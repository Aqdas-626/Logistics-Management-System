<?php

namespace App\Http\Controllers\Invoice;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceSequence;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class InvoiceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Invoice::query()
            ->with('customer:id,name,customer_code')
            ->latest('id');

        if ($request->filled('search')) {
            $search = trim((string) $request->string('search'));
            $query->where(function ($q) use ($search) {
                $q->where('invoice_no', 'like', '%' . $search . '%')
                    ->orWhereHas('customer', function ($cq) use ($search) {
                        $cq->where('name', 'like', '%' . $search . '%')
                            ->orWhere('customer_code', 'like', '%' . $search . '%');
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return Inertia::render('Invoice/Invoices/Index', [
            'invoices' => $query->paginate(12)->withQueryString(),
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Invoice/Invoices/Create', [
            'customers' => Customer::query()->select('id', 'name', 'customer_code')->orderBy('name')->get(),
            'defaultIssueDate' => now()->toDateString(),
            'defaultDueDate' => now()->addDays(7)->toDateString(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        $user = $request->user();
        $companyId = (int) ($validated['company_id'] ?? $user?->company_id ?? 1);

        DB::transaction(function () use ($validated, $companyId, $user) {
            $invoiceNo = $this->nextInvoiceNo($companyId, (string) $validated['issue_date']);
            $totals = $this->calculateTotals($validated['lines']);

            $invoice = Invoice::create([
                'company_id' => $companyId,
                'customer_id' => $validated['customer_id'],
                'invoice_no' => $invoiceNo,
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'] ?? null,
                'currency_code' => strtoupper((string) ($validated['currency_code'] ?? 'USD')),
                'status' => $validated['status'] ?? 'draft',
                'subtotal' => $totals['subtotal'],
                'discount_total' => $totals['discount_total'],
                'tax_total' => $totals['tax_total'],
                'grand_total' => $totals['grand_total'],
                'amount_paid' => 0,
                'balance_due' => $totals['grand_total'],
                'notes' => $validated['notes'] ?? null,
                'terms' => $validated['terms'] ?? null,
                'created_by' => $user?->id,
            ]);

            foreach ($totals['lines'] as $index => $line) {
                $invoice->lines()->create([
                    'description' => $line['description'],
                    'qty' => $line['qty'],
                    'unit_price' => $line['unit_price'],
                    'line_discount' => $line['line_discount'],
                    'tax_rate' => $line['tax_rate'],
                    'tax_amount' => $line['tax_amount'],
                    'line_total' => $line['line_total'],
                    'sort_order' => $index + 1,
                ]);
            }
        });

        return redirect()->route('invoices.index')->with('success', 'Invoice created successfully.');
    }

    public function show(Invoice $invoice): Response
    {
        $invoice->load([
            'customer:id,name,customer_code',
            'lines:id,invoice_id,description,qty,unit_price,line_discount,tax_rate,tax_amount,line_total,sort_order',
            'payments:id,invoice_id,payment_date,amount,method,reference_no,notes,received_by',
            'payments.receivedBy:id,name',
        ]);

        return Inertia::render('Invoice/Invoices/Show', [
            'invoice' => $invoice,
        ]);
    }

    public function edit(Invoice $invoice): Response
    {
        $invoice->load('lines:id,invoice_id,description,qty,unit_price,line_discount,tax_rate,tax_amount,line_total,sort_order');

        return Inertia::render('Invoice/Invoices/Edit', [
            'invoice' => $invoice,
            'customers' => Customer::query()->select('id', 'name', 'customer_code')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate($this->rules(false));

        DB::transaction(function () use ($validated, $invoice) {
            $totals = $this->calculateTotals($validated['lines']);

            $amountPaid = (float) $invoice->amount_paid;
            $newBalance = max(0, (float) $totals['grand_total'] - $amountPaid);
            $status = $validated['status'] ?? $invoice->status;
            if ($amountPaid > 0 && $newBalance > 0) {
                $status = 'partially_paid';
            }
            if ($newBalance <= 0 && $totals['grand_total'] > 0) {
                $status = 'paid';
            }

            $invoice->update([
                'customer_id' => $validated['customer_id'],
                'issue_date' => $validated['issue_date'],
                'due_date' => $validated['due_date'] ?? null,
                'currency_code' => strtoupper((string) ($validated['currency_code'] ?? $invoice->currency_code)),
                'status' => $status,
                'subtotal' => $totals['subtotal'],
                'discount_total' => $totals['discount_total'],
                'tax_total' => $totals['tax_total'],
                'grand_total' => $totals['grand_total'],
                'balance_due' => $newBalance,
                'notes' => $validated['notes'] ?? null,
                'terms' => $validated['terms'] ?? null,
            ]);

            $invoice->lines()->delete();
            foreach ($totals['lines'] as $index => $line) {
                $invoice->lines()->create([
                    'description' => $line['description'],
                    'qty' => $line['qty'],
                    'unit_price' => $line['unit_price'],
                    'line_discount' => $line['line_discount'],
                    'tax_rate' => $line['tax_rate'],
                    'tax_amount' => $line['tax_amount'],
                    'line_total' => $line['line_total'],
                    'sort_order' => $index + 1,
                ]);
            }
        });

        return redirect()->route('invoices.show', $invoice)->with('success', 'Invoice updated successfully.');
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return redirect()->route('invoices.index')->with('success', 'Invoice deleted successfully.');
    }

    private function rules(bool $isCreate = true): array
    {
        return [
            'company_id' => [$isCreate ? 'nullable' : 'sometimes', 'integer', 'exists:companies,id'],
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'issue_date' => ['required', 'date'],
            'due_date' => ['nullable', 'date'],
            'currency_code' => ['nullable', 'string', 'size:3'],
            'status' => ['nullable', 'in:draft,issued,partially_paid,paid,void,overdue'],
            'notes' => ['nullable', 'string'],
            'terms' => ['nullable', 'string'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.description' => ['required', 'string', 'max:500'],
            'lines.*.qty' => ['required', 'numeric', 'gt:0'],
            'lines.*.unit_price' => ['required', 'numeric', 'min:0'],
            'lines.*.line_discount' => ['nullable', 'numeric', 'min:0'],
            'lines.*.tax_rate' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    private function calculateTotals(array $lines): array
    {
        $subtotal = 0.0;
        $discountTotal = 0.0;
        $taxTotal = 0.0;
        $normalized = [];

        foreach ($lines as $line) {
            $qty = (float) ($line['qty'] ?? 0);
            $unitPrice = (float) ($line['unit_price'] ?? 0);
            $lineDiscount = (float) ($line['line_discount'] ?? 0);
            $taxRate = (float) ($line['tax_rate'] ?? 0);

            $lineSubtotal = $qty * $unitPrice;
            $taxable = max(0, $lineSubtotal - $lineDiscount);
            $taxAmount = $taxable * $taxRate;
            $lineTotal = $taxable + $taxAmount;

            $subtotal += $lineSubtotal;
            $discountTotal += $lineDiscount;
            $taxTotal += $taxAmount;

            $normalized[] = [
                'description' => (string) $line['description'],
                'qty' => round($qty, 3),
                'unit_price' => round($unitPrice, 2),
                'line_discount' => round($lineDiscount, 2),
                'tax_rate' => round($taxRate, 4),
                'tax_amount' => round($taxAmount, 2),
                'line_total' => round($lineTotal, 2),
            ];
        }

        $grandTotal = max(0, $subtotal - $discountTotal + $taxTotal);

        return [
            'subtotal' => round($subtotal, 2),
            'discount_total' => round($discountTotal, 2),
            'tax_total' => round($taxTotal, 2),
            'grand_total' => round($grandTotal, 2),
            'lines' => $normalized,
        ];
    }

    private function nextInvoiceNo(int $companyId, string $issueDate): string
    {
        $year = (int) date('Y', strtotime($issueDate));

        $seq = InvoiceSequence::query()
            ->where('company_id', $companyId)
            ->where('year', $year)
            ->lockForUpdate()
            ->first();

        if (!$seq) {
            $seq = InvoiceSequence::create([
                'company_id' => $companyId,
                'year' => $year,
                'prefix' => 'INV',
                'last_number' => 0,
            ]);
        }

        $seq->last_number = (int) $seq->last_number + 1;
        $seq->save();

        return sprintf('%s-%d-%05d', $seq->prefix, $year, $seq->last_number);
    }
}
