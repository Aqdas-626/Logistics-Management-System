<?php

namespace App\Http\Controllers\Invoice;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\InvoicePayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InvoicePaymentController extends Controller
{
    public function store(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'payment_date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'method' => ['nullable', 'string', 'max:40'],
            'reference_no' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated, $invoice, $request) {
            $amount = (float) $validated['amount'];
            $balance = (float) $invoice->balance_due;
            if ($amount > $balance) {
                $amount = $balance;
            }

            InvoicePayment::create([
                'invoice_id' => $invoice->id,
                'payment_date' => $validated['payment_date'],
                'amount' => $amount,
                'method' => $validated['method'] ?? null,
                'reference_no' => $validated['reference_no'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'received_by' => $request->user()?->id,
            ]);

            $newAmountPaid = (float) $invoice->amount_paid + $amount;
            $newBalance = max(0, (float) $invoice->grand_total - $newAmountPaid);
            $newStatus = $invoice->status;
            if ($newBalance <= 0 && (float) $invoice->grand_total > 0) {
                $newStatus = 'paid';
            } elseif ($newAmountPaid > 0) {
                $newStatus = 'partially_paid';
            }

            $invoice->update([
                'amount_paid' => round($newAmountPaid, 2),
                'balance_due' => round($newBalance, 2),
                'status' => $newStatus,
            ]);
        });

        return redirect()->route('invoices.show', $invoice)->with('success', 'Payment added successfully.');
    }

    public function destroy(Invoice $invoice, InvoicePayment $payment)
    {
        if ((int) $payment->invoice_id !== (int) $invoice->id) {
            abort(404);
        }

        DB::transaction(function () use ($invoice, $payment) {
            $amount = (float) $payment->amount;
            $payment->delete();

            $newAmountPaid = max(0, (float) $invoice->amount_paid - $amount);
            $newBalance = max(0, (float) $invoice->grand_total - $newAmountPaid);
            $newStatus = $newBalance <= 0 && (float) $invoice->grand_total > 0
                ? 'paid'
                : ($newAmountPaid > 0 ? 'partially_paid' : 'issued');

            if ((float) $invoice->grand_total <= 0) {
                $newStatus = 'draft';
            }

            $invoice->update([
                'amount_paid' => round($newAmountPaid, 2),
                'balance_due' => round($newBalance, 2),
                'status' => $newStatus,
            ]);
        });

        return redirect()->route('invoices.show', $invoice)->with('success', 'Payment removed successfully.');
    }
}
