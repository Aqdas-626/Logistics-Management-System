<?php

namespace App\Http\Controllers\Fuel;

use App\Http\Controllers\Controller;
use App\Models\FuelTank;
use App\Models\FuelTankTransaction;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FuelTankTransactionController extends Controller
{
    private function filteredQuery(string $search)
    {
        $query = FuelTankTransaction::with('fuelTank', 'createdBy')->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('type', 'like', '%'.$search.'%')
                    ->orWhere('reference_type', 'like', '%'.$search.'%')
                    ->orWhere('remarks', 'like', '%'.$search.'%')
                    ->orWhereHas('fuelTank', fn ($t) => $t->where('name', 'like', '%'.$search.'%'));
            });
        }

        return $query;
    }

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        return Inertia::render('Fuel/Transactions/Index', [
            'transactions' => $this->filteredQuery($search)->paginate(15)->withQueryString(),
            'filters' => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Fuel/Transactions/Create', [
            'tanks' => FuelTank::where('is_active', true)->orderBy('name')->get(['id', 'name', 'current_stock']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'fuel_tank_id' => ['required', 'exists:fuel_tanks,id'],
            'type' => ['required', 'in:in,out,adjustment'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'transaction_date' => ['nullable', 'date'],
            'reference_type' => ['nullable', 'string', 'max:255'],
            'reference_id' => ['nullable', 'integer'],
            'remarks' => ['nullable', 'string'],
        ]);

        $tank = FuelTank::findOrFail($validated['fuel_tank_id']);

        $validated['before_stock'] = $tank->current_stock;

        $after = match ($validated['type']) {
            'in' => $tank->current_stock + $validated['quantity'],
            'out' => $tank->current_stock - $validated['quantity'],
            'adjustment' => $validated['quantity'],
        };

        $validated['after_stock'] = $after;
        $validated['created_by'] = auth()->id();

        FuelTankTransaction::create($validated);

        $tank->update(['current_stock' => $after]);

        return redirect()
            ->route('fuel-tank-transactions.index')
            ->with('success', 'Transaction recorded successfully.');
    }

    public function edit(FuelTankTransaction $fuelTankTransaction): Response
    {
        return Inertia::render('Fuel/Transactions/Edit', [
            'transaction' => $fuelTankTransaction->load('fuelTank'),
            'tanks' => FuelTank::where('is_active', true)->orderBy('name')->get(['id', 'name', 'current_stock']),
        ]);
    }

    public function update(Request $request, FuelTankTransaction $fuelTankTransaction): RedirectResponse
    {
        $validated = $request->validate([
            'fuel_tank_id' => ['required', 'exists:fuel_tanks,id'],
            'type' => ['required', 'in:in,out,adjustment'],
            'quantity' => ['required', 'numeric', 'min:0.01'],
            'transaction_date' => ['nullable', 'date'],
            'reference_type' => ['nullable', 'string', 'max:255'],
            'reference_id' => ['nullable', 'integer'],
            'remarks' => ['nullable', 'string'],
        ]);

        $fuelTankTransaction->update($validated);

        return redirect()
            ->route('fuel-tank-transactions.index')
            ->with('success', 'Transaction updated successfully.');
    }

    public function destroy(FuelTankTransaction $fuelTankTransaction): RedirectResponse
    {
        $fuelTankTransaction->delete();

        return redirect()
            ->route('fuel-tank-transactions.index')
            ->with('success', 'Transaction deleted successfully.');
    }
}
