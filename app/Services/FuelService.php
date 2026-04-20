<?php

namespace App\Services;

use App\Models\Driver;
use App\Models\Fuel;
use App\Models\FuelTank;
use App\Models\FuelVendor;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class FuelService
{
    private FuelTankService $fuelTankService;

    public function __construct(FuelTankService $fuelTankService)
    {
        $this->fuelTankService = $fuelTankService;
    }

    /**
     * Get form data for fuel entry forms
     */
    public function getFormData(): array
    {
        return [
            'vehicles'    => Vehicle::orderBy('name')->get(['id', 'name', 'registration_no']),
            'drivers'     => Driver::orderBy('name')->get(['id', 'name']),
            'fuelTanks'   => $this->fuelTankService->getActiveTanks(),
            'fuelVendors' => FuelVendor::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ];
    }

    /**
     * Get filtered fuel entries
     */
    public function getFilteredFuels(string $search = ''): Builder
    {
        $query = Fuel::with('vehicle', 'driver', 'fuelTank', 'fuelVendor')->orderByDesc('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('fuel_type', 'like', '%'.$search.'%')
                    ->orWhere('source_type', 'like', '%'.$search.'%')
                    ->orWhereHas('vehicle', fn ($v) => $v->where('name', 'like', '%'.$search.'%'))
                    ->orWhereHas('driver', fn ($d) => $d->where('name', 'like', '%'.$search.'%'));
            });
        }

        return $query;
    }

    /**
     * Create a new fuel entry
     */
    public function createFuel(array $data): Fuel
    {
        // Handle file upload
        if (isset($data['receipt']) && $data['receipt'] instanceof UploadedFile) {
            $data['receipt'] = $this->storeReceipt($data['receipt']);
        }

        $data['created_by'] = auth()->id();

        // Deduct from tank if source is tank
        if ($data['source_type'] === 'tank' && !empty($data['fuel_tank_id'])) {
            $this->fuelTankService->deductStock($data['fuel_tank_id'], $data['quantity']);
        }

        return Fuel::create($data);
    }

    /**
     * Update fuel entry
     */
    public function updateFuel(Fuel $fuel, array $data): Fuel
    {
        // Handle file upload
        if (isset($data['receipt']) && $data['receipt'] instanceof UploadedFile) {
            // Delete old receipt if exists
            if ($fuel->receipt) {
                Storage::disk('public')->delete($fuel->receipt);
            }
            $data['receipt'] = $this->storeReceipt($data['receipt']);
        } elseif (isset($data['receipt']) && $data['receipt'] === null) {
            // Remove receipt if explicitly set to null
            if ($fuel->receipt) {
                Storage::disk('public')->delete($fuel->receipt);
            }
            $data['receipt'] = null;
        }

        $fuel->update($data);

        return $fuel;
    }

    /**
     * Delete fuel entry
     */
    public function deleteFuel(Fuel $fuel): bool
    {
        // Delete receipt file if exists
        if ($fuel->receipt) {
            Storage::disk('public')->delete($fuel->receipt);
        }

        return $fuel->delete();
    }

    /**
     * Store receipt file
     */
    private function storeReceipt(UploadedFile $file): string
    {
        $this->validateReceiptFile($file);

        return $file->store('fuel/receipts', 'public');
    }

    /**
     * Validate receipt file
     */
    private function validateReceiptFile(UploadedFile $file): void
    {
        $maxSize = 2048 * 1024; // 2MB in bytes
        $allowedMimes = ['image/jpeg', 'image/png', 'application/pdf'];

        if ($file->getSize() > $maxSize) {
            throw new \Exception("Receipt file size exceeds 2MB limit");
        }

        if (!in_array($file->getMimeType(), $allowedMimes)) {
            throw new \Exception("Invalid receipt file type. Allowed: JPG, PNG, PDF");
        }
    }

    /**
     * Get fuel entries for a vehicle
     */
    public function getVehicleFuels(int $vehicleId, int $limit = 50): \Illuminate\Pagination\LengthAwarePaginator
    {
        return Fuel::where('vehicle_id', $vehicleId)
            ->with('driver', 'fuelTank', 'fuelVendor')
            ->orderByDesc('fill_date')
            ->paginate($limit);
    }

    /**
     * Get fuel entries for a driver
     */
    public function getDriverFuels(int $driverId, int $limit = 50): \Illuminate\Pagination\LengthAwarePaginator
    {
        return Fuel::where('driver_id', $driverId)
            ->with('vehicle', 'fuelTank', 'fuelVendor')
            ->orderByDesc('fill_date')
            ->paginate($limit);
    }

    /**
     * Calculate fuel consumption for a vehicle
     */
    public function calculateFuelConsumption(int $vehicleId): array
    {
        $fuels = Fuel::where('vehicle_id', $vehicleId)
            ->orderBy('fill_date')
            ->get();

        if ($fuels->count() < 2) {
            return [
                'total_quantity'    => $fuels->sum('quantity'),
                'total_amount'      => $fuels->sum('amount'),
                'average_consumption' => 0,
                'entries_count'     => $fuels->count(),
            ];
        }

        $totalDistance = $fuels->last()->odometer - $fuels->first()->odometer;
        $totalQuantity = $fuels->sum('quantity');
        $avgConsumption = $totalDistance > 0 ? $totalQuantity / $totalDistance : 0;

        return [
            'total_quantity'      => $totalQuantity,
            'total_amount'        => $fuels->sum('amount'),
            'average_consumption' => round($avgConsumption, 2),
            'entries_count'       => $fuels->count(),
            'total_distance'      => $totalDistance,
        ];
    }

    /**
     * Get fuel statistics
     */
    public function getFuelStatistics(): array
    {
        $fuels = Fuel::all();

        return [
            'total_entries'     => $fuels->count(),
            'total_quantity'    => $fuels->sum('quantity'),
            'total_amount'      => $fuels->sum('amount'),
            'from_tank'         => $fuels->where('source_type', 'tank')->count(),
            'from_vendor'       => $fuels->where('source_type', 'vendor')->count(),
            'average_per_entry' => $fuels->count() > 0 ? round($fuels->sum('amount') / $fuels->count(), 2) : 0,
        ];
    }
}
