<?php

namespace App\Http\Controllers\Fuel;

use App\Http\Requests\Fuel\StoreFuelTankTransactionRequest;
use App\Http\Requests\Fuel\UpdateFuelTankTransactionRequest;
use App\Http\Controllers\Controller;
use App\Models\FuelTankTransaction;
use App\Services\FuelTankService;
use App\Services\FuelTankTransactionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FuelTankTransactionController extends Controller
{
    private FuelTankTransactionService $transactionService;
    private FuelTankService $tankService;

    public function __construct(FuelTankTransactionService $transactionService, FuelTankService $tankService)
    {
        $this->transactionService = $transactionService;
        $this->tankService = $tankService;
    }

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();

        return Inertia::render('Fuel/Transactions/Index', [
            'transactions' => $this->transactionService->getFilteredTransactions($search)->paginate(15)->withQueryString(),
            'filters'      => ['search' => $search],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Fuel/Transactions/Create', [
            'tanks' => $this->tankService->getActiveTanks(),
        ]);
    }

    public function store(StoreFuelTankTransactionRequest $request): RedirectResponse
    {
        try {
            $this->transactionService->recordTransaction($request->validated());

            return redirect()
                ->route('fuel-tank-transactions.index')
                ->with('success', 'Transaction recorded successfully.');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function edit(FuelTankTransaction $fuelTankTransaction): Response
    {
        return Inertia::render('Fuel/Transactions/Edit', [
            'transaction' => $fuelTankTransaction->load('fuelTank'),
            'tanks'       => $this->tankService->getActiveTanks(),
        ]);
    }

    public function update(UpdateFuelTankTransactionRequest $request, FuelTankTransaction $fuelTankTransaction): RedirectResponse
    {
        try {
            $fuelTankTransaction->update($request->validated());

            return redirect()
                ->route('fuel-tank-transactions.index')
                ->with('success', 'Transaction updated successfully.');
        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function destroy(FuelTankTransaction $fuelTankTransaction): RedirectResponse
    {
        try {
            $fuelTankTransaction->delete();

            return redirect()
                ->route('fuel-tank-transactions.index')
                ->with('success', 'Transaction deleted successfully.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
