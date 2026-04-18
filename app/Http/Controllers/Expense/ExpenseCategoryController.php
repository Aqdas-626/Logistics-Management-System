<?php

namespace App\Http\Controllers\Expense;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ExpenseCategoryController extends Controller
{
    public function index(Request $request): Response
    {
        $query = ExpenseCategory::query()->with('company:id,name');

        if ($request->filled('search')) {
            $term = $request->search;
            $query->where(function ($w) use ($term) {
                $w->where('name', 'like', "%{$term}%")
                    ->orWhere('code', 'like', "%{$term}%");
            });
        }

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $expenseCategories = $query
            ->orderBy('sort_order')
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Expense/ExpenseCategories/Index', [
            'expenseCategories' => $expenseCategories,
            'companies' => Company::query()->active()->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['search', 'company_id']),
        ]);
    }

    public function store(Request $request)
    {
        if ($request->input('company_id') === '') {
            $request->merge(['company_id' => null]);
        }
        if ($request->input('sort_order') === '' || $request->input('sort_order') === null) {
            $request->merge(['sort_order' => 0]);
        }

        $validated = $request->validate([
            'company_id' => 'nullable|exists:companies,id',
            'name' => [
                'required',
                'string',
                'max:120',
                Rule::unique('expense_categories', 'name')->where(
                    fn ($q) => $q->where('company_id', $request->input('company_id'))
                ),
            ],
            'code' => 'nullable|string|max:40',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer|min:0|max:65535',
            'status' => 'required|string|in:active,inactive',
        ]);

        try {
            ExpenseCategory::create($validated);

            return redirect()->route('expense-categories.index')
                ->with('success', 'Expense category created successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create expense category: '.$e->getMessage()]);
        }
    }

    public function update(Request $request, ExpenseCategory $expense_category)
    {
        if ($request->input('company_id') === '') {
            $request->merge(['company_id' => null]);
        }
        if ($request->input('sort_order') === '' || $request->input('sort_order') === null) {
            $request->merge(['sort_order' => 0]);
        }

        $validated = $request->validate([
            'company_id' => 'nullable|exists:companies,id',
            'name' => [
                'required',
                'string',
                'max:120',
                Rule::unique('expense_categories', 'name')
                    ->ignore($expense_category->id)
                    ->where(
                        fn ($q) => $q->where('company_id', $request->input('company_id'))
                    ),
            ],
            'code' => 'nullable|string|max:40',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer|min:0|max:65535',
            'status' => 'required|string|in:active,inactive',
        ]);

        try {
            $expense_category->update($validated);

            return redirect()->route('expense-categories.index')
                ->with('success', 'Expense category updated successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update expense category: '.$e->getMessage()]);
        }
    }

    public function destroy(ExpenseCategory $expense_category)
    {
        try {
            $expense_category->delete();

            return redirect()->route('expense-categories.index')
                ->with('success', 'Expense category deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete expense category: '.$e->getMessage()]);
        }
    }
}
