<?php

namespace App\Services;

use App\Models\FuelTank;
use Illuminate\Database\Eloquent\Collection;

class FuelTankService
{
    /**
     * Get all active fuel tanks
     */
    public function getActiveTanks(): Collection
    {
        return FuelTank::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'current_stock', 'capacity', 'fuel_type']);
    }

    /**
     * Get tank by ID with full details
     */
    public function getTankById(int $id): ?FuelTank
    {
        return FuelTank::find($id);
    }

    /**
     * Deduct quantity from tank stock
     */
    public function deductStock(int $tankId, float $quantity): bool
    {
        $tank = $this->getTankById($tankId);

        if (!$tank) {
            return false;
        }

        if ($tank->current_stock < $quantity) {
            throw new \Exception("Insufficient stock in tank. Available: {$tank->current_stock}, Required: {$quantity}");
        }

        return $tank->decrement('current_stock', $quantity) !== false;
    }

    /**
     * Add quantity to tank stock
     */
    public function addStock(int $tankId, float $quantity): bool
    {
        $tank = $this->getTankById($tankId);

        if (!$tank) {
            return false;
        }

        if ($tank->current_stock + $quantity > $tank->capacity) {
            throw new \Exception("Tank capacity exceeded. Current: {$tank->current_stock}, Adding: {$quantity}, Capacity: {$tank->capacity}");
        }

        return $tank->increment('current_stock', $quantity) !== false;
    }

    /**
     * Adjust tank stock to specific value
     */
    public function adjustStock(int $tankId, float $newStock): bool
    {
        $tank = $this->getTankById($tankId);

        if (!$tank) {
            return false;
        }

        if ($newStock < 0 || $newStock > $tank->capacity) {
            throw new \Exception("Invalid stock value. Must be between 0 and {$tank->capacity}");
        }

        return $tank->update(['current_stock' => $newStock]);
    }

    /**
     * Get tank stock percentage
     */
    public function getStockPercentage(int $tankId): float
    {
        $tank = $this->getTankById($tankId);

        if (!$tank || $tank->capacity == 0) {
            return 0;
        }

        return ($tank->current_stock / $tank->capacity) * 100;
    }

    /**
     * Check if tank has sufficient stock
     */
    public function hasSufficientStock(int $tankId, float $quantity): bool
    {
        $tank = $this->getTankById($tankId);

        return $tank && $tank->current_stock >= $quantity;
    }
}
