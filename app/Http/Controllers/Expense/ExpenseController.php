<?php

namespace App\Http\Controllers\Expense;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Company;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseController extends Controller
{
    private function selectedIds(Request $request): array
    {
        $raw = (string) $request->query('ids', '');
        if ($raw === '') {
            return [];
        }

        return collect(explode(',', $raw))
            ->map(fn ($id) => (int) trim($id))
            ->filter(fn ($id) => $id > 0)
            ->unique()
            ->values()
            ->all();
    }

    private function filteredQuery(Request $request)
    {
        $query = Expense::query()
            ->with([
                'expenseCategory:id,name',
                'company:id,name',
                'branch:id,name',
                'creator:id,name',
            ]);

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($w) use ($term) {
                $w->where('title', 'like', "%{$term}%")
                    ->orWhere('description', 'like', "%{$term}%")
                    ->orWhere('reference_no', 'like', "%{$term}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        return $query;
    }

    public function index(Request $request): Response
    {
        $expenses = $this->filteredQuery($request)
            ->orderByDesc('expense_date')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Expense/Expenses/Index', [
            'expenses' => $expenses,
            'companies' => Company::query()->active()->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'status', 'company_id']),
        ]);
    }

    public function exportCsv(Request $request)
    {
        $selectedIds = $this->selectedIds($request);

        $expenses = $this->filteredQuery($request)
            ->orderByDesc('expense_date')
            ->orderByDesc('id');

        if ($selectedIds !== []) {
            $expenses->whereIn('id', $selectedIds);
        }

        $expenses = $expenses->get();

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="expenses.csv"',
        ];

        $callback = function () use ($expenses) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'S.NO',
                'DATE',
                'TITLE',
                'CATEGORY',
                'COMPANY',
                'BRANCH',
                'AMOUNT',
                'CURRENCY',
                'PAYMENT METHOD',
                'REFERENCE NO',
                'STATUS',
                'CREATED BY',
                'APPROVED AT',
            ]);

            foreach ($expenses as $index => $expense) {
                fputcsv($handle, [
                    $index + 1,
                    optional($expense->expense_date)->format('Y-m-d') ?? '',
                    $expense->title,
                    $expense->expenseCategory?->name ?? '',
                    $expense->company?->name ?? '',
                    $expense->branch?->name ?? '',
                    (string) $expense->amount,
                    $expense->currency ?? '',
                    $expense->payment_method ?? '',
                    $expense->reference_no ?? '',
                    $expense->status ?? '',
                    $expense->creator?->name ?? '',
                    optional($expense->approved_at)->toDateTimeString() ?? '',
                ]);
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportExcel(Request $request)
    {
        $selectedIds = $this->selectedIds($request);

        $expenses = $this->filteredQuery($request)
            ->orderByDesc('expense_date')
            ->orderByDesc('id');

        if ($selectedIds !== []) {
            $expenses->whereIn('id', $selectedIds);
        }

        $expenses = $expenses->get();

        $headers = [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="expenses.xls"',
        ];

        $callback = function () use ($expenses) {
            $handle = fopen('php://output', 'w');
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'S.NO',
                'DATE',
                'TITLE',
                'CATEGORY',
                'COMPANY',
                'BRANCH',
                'AMOUNT',
                'CURRENCY',
                'PAYMENT METHOD',
                'REFERENCE NO',
                'STATUS',
                'CREATED BY',
                'APPROVED AT',
            ], "\t");

            foreach ($expenses as $index => $expense) {
                fputcsv($handle, [
                    $index + 1,
                    optional($expense->expense_date)->format('Y-m-d') ?? '',
                    $expense->title,
                    $expense->expenseCategory?->name ?? '',
                    $expense->company?->name ?? '',
                    $expense->branch?->name ?? '',
                    (string) $expense->amount,
                    $expense->currency ?? '',
                    $expense->payment_method ?? '',
                    $expense->reference_no ?? '',
                    $expense->status ?? '',
                    $expense->creator?->name ?? '',
                    optional($expense->approved_at)->toDateTimeString() ?? '',
                ], "\t");
            }

            fclose($handle);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportPdf(Request $request)
    {
        $selectedIds = $this->selectedIds($request);

        $expenses = $this->filteredQuery($request)
            ->orderByDesc('expense_date')
            ->orderByDesc('id');

        if ($selectedIds !== []) {
            $expenses->whereIn('id', $selectedIds);
        }

        $expenses = $expenses->get();

        $pdf = Pdf::loadView('exports.expenses-pdf', [
            'expenses' => $expenses,
        ])->setPaper('a4', 'landscape');

        return $pdf->download('expenses.pdf');
    }

    public function create(): Response
    {
        return Inertia::render('Expense/Expenses/Create', $this->formSharedData());
    }

    public function store(Request $request): RedirectResponse
    {
        $this->mergeNullableIds($request);

        $validator = Validator::make($request->all(), $this->rules($request));

        $validator->after(function ($validator) use ($request): void {
            $this->validateCategoryAndBranch($validator, $request);
        });

        $validated = $validator->validate();
        unset($validated['receipt']);

        if ($request->hasFile('receipt')) {
            $validated['receipt_path'] = $request->file('receipt')->store('expense-receipts', 'public');
        }

        $validated['created_by'] = $request->user()?->id;

        try {
            Expense::create($validated);

            return redirect()->route('expenses.index')
                ->with('success', 'Expense created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create expense: '.$e->getMessage()])->withInput();
        }
    }

    public function show(Expense $expense): Response
    {
        $expense->load([
            'expenseCategory',
            'company',
            'branch',
            'creator:id,name,email',
            'approver:id,name,email',
        ]);

        return Inertia::render('Expense/Expenses/Show', [
            'expense' => $expense,
            'receiptUrl' => $expense->receipt_path
                ? asset('storage/'.ltrim($expense->receipt_path, '/'))
                : null,
        ]);
    }

    public function edit(Expense $expense): Response
    {
        $expense->load(['expenseCategory:id,name,company_id', 'company:id,name', 'branch:id,name,company_id']);

        return Inertia::render('Expense/Expenses/Edit', [
            'expense' => $expense,
            'receiptUrl' => $expense->receipt_path
                ? asset('storage/'.ltrim($expense->receipt_path, '/'))
                : null,
            ...$this->formSharedData(),
        ]);
    }

    public function update(Request $request, Expense $expense): RedirectResponse
    {
        $this->mergeNullableIds($request);

        $validator = Validator::make($request->all(), $this->rules($request));

        $validator->after(function ($validator) use ($request): void {
            $this->validateCategoryAndBranch($validator, $request);
        });

        $validated = $validator->validate();
        unset($validated['receipt']);

        if ($request->hasFile('receipt')) {
            if ($expense->receipt_path && Storage::disk('public')->exists($expense->receipt_path)) {
                Storage::disk('public')->delete($expense->receipt_path);
            }
            $validated['receipt_path'] = $request->file('receipt')->store('expense-receipts', 'public');
        }

        try {
            $expense->update($validated);

            return redirect()->route('expenses.index')
                ->with('success', 'Expense updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update expense: '.$e->getMessage()])->withInput();
        }
    }

    public function destroy(Expense $expense): RedirectResponse
    {
        try {
            $expense->delete();

            return redirect()->route('expenses.index')
                ->with('success', 'Expense deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete expense: '.$e->getMessage()]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function formSharedData(): array
    {
        return [
            'expenseCategories' => ExpenseCategory::query()
                ->where('status', 'active')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get(['id', 'name', 'company_id']),
            'companies' => Company::query()->active()->orderBy('name')->get(['id', 'name']),
            'branches' => Branch::query()
                ->orderBy('name')
                ->get(['id', 'name', 'company_id']),
        ];
    }

    private function mergeNullableIds(Request $request): void
    {
        if ($request->input('company_id') === '') {
            $request->merge(['company_id' => null]);
        }
        if ($request->input('branch_id') === '') {
            $request->merge(['branch_id' => null]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(Request $request): array
    {
        return [
            'expense_category_id' => 'required|exists:expense_categories,id',
            'company_id' => 'nullable|exists:companies,id',
            'branch_id' => 'nullable|exists:branches,id',
            'title' => 'required|string|max:160',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0.01|max:999999999999.99',
            'currency' => 'required|string|max:10',
            'expense_date' => 'required|date',
            'payment_method' => 'nullable|string|max:40',
            'reference_no' => 'nullable|string|max:80',
            'receipt' => 'nullable|file|mimes:jpg,jpeg,png,webp,pdf|max:5120',
            'status' => 'required|string|in:draft,submitted,approved,rejected',
        ];
    }

    private function validateCategoryAndBranch(\Illuminate\Validation\Validator $validator, Request $request): void
    {
        if ($validator->errors()->isNotEmpty()) {
            return;
        }

        $category = ExpenseCategory::query()->find($request->input('expense_category_id'));
        if (! $category) {
            return;
        }

        $companyId = $request->input('company_id');

        if ($companyId && $category->company_id && (int) $category->company_id !== (int) $companyId) {
            $validator->errors()->add(
                'expense_category_id',
                'This category is not available for the selected company.'
            );
        }

        if ($request->filled('branch_id')) {
            if (! $companyId) {
                $validator->errors()->add('branch_id', 'Select a company when a branch is chosen.');

                return;
            }

            $branch = Branch::query()->find($request->input('branch_id'));
            if (! $branch || (int) $branch->company_id !== (int) $companyId) {
                $validator->errors()->add('branch_id', 'Branch must belong to the selected company.');
            }
        }
    }
}
