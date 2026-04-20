<?php

namespace App\Services;

use App\Models\FuelTank;
use App\Models\FuelTankTransaction;
use Illuminate\Database\Eloquent\Builder;

class FuelTankTransactionService
{
    private FuelTankService $fuelTankService;

    public function __construct(FuelTankService $fuelTankService)
    {
        $this->fuelTankService = $fuelTankService;
    }

    /**
     * Record a fuel tank transaction
     */
    public function recordTransaction(array $data): FuelTankTransaction
    {
        $tank = FuelTank::findOrFail($data['fuel_tank_id']);

        $beforeStock = $tank->current_stock;

        // Calculate after stock based on transaction type
        $afterStock = match ($data['type']) {
            'in'         => $beforeStock + $data['quantity'],
            'out'        => $beforeStock - $data['quantity'],
            'adjustment' => $data['quantity'],
        };

        // Validate stock levels
        if ($afterStock < 0) {
            throw new \Exception("Transaction would result in negative stock. Current: {$beforeStock}, Type: {$data['type']}, Quantity: {$data['quantity']}");
        }

        if ($afterStock > $tank->capacity) {
            throw new \Exception("Transaction would exceed tank capacity. Current: {$beforeStock}, After: {$afterStock}, Capacity: {$tank->capacity}");
        }

        // Create transaction record
        $transaction = FuelTankTransaction::create([
            'fuel_tank_id'     => $data['fuel_tank_id'],
            'type'             => $data['type'],
            'quantity'         => $data['quantity'],
            'before_stock'     => $beforeStock,
            'after_stock'      => $afterStock,
            'transaction_date' => $data['transaction_date'] ?? now()->toDateString(),
            'reference_type'   => $data['reference_type'] ?? null,
            'reference_id'     => $data['reference_id'] ?? null,
            'remarks'          => $data['remarks'] ?? null,
            'created_by'       => auth()->id(),
        ]);

        // Update tank stock
        $tank->update(['current_stock' => $afterStock]);

        return $transaction;
    }

    /**
     * Get filtered transactions
     */
    public function getFilteredTransactions(string $search = ''): Builder
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

    /**
     * Get transactions for a specific tank
     */
    public function getTankTransactions(int $tankId, int $limit = 50): \Illuminate\Pagination\LengthAwarePaginator
    {
        return FuelTankTransaction::where('fuel_tank_id', $tankId)
            ->with('createdBy')
            ->orderByDesc('id')
            ->paginate($limit);
    }

    /**
     * Get transaction summary for a tank
     */
    public function getTankSummary(int $tankId): array
    {
        $transactions = FuelTankTransaction::where('fuel_tank_id', $tankId)->get();

        return [
            'total_in'        => $transactions->where('type', 'in')->sum('quantity'),
            'total_out'       => $transactions->where('type', 'out')->sum('quantity'),
            'total_adjustments' => $transactions->where('type', 'adjustment')->count(),
            'transaction_count' => $transactions->count(),
        ];
    }

    /**
     * Get all active fuel tanks (delegates to FuelTankService)
     */
    public function getActiveTanks()
    {
        return $this->fuelTankService->getActiveTanks();
    }
}
