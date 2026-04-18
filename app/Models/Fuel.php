<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Fuel extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vehicle_id',
        'driver_id',
        'fuel_type',
        'fill_date',
        'quantity',
        'odometer',
        'amount',
        'source_type',
        'fuel_tank_id',
        'fuel_vendor_id',
        'receipt',
        'comment',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'fill_date' => 'date',
            'quantity' => 'decimal:2',
            'odometer' => 'decimal:2',
            'amount' => 'decimal:2',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class);
    }

    public function fuelTank(): BelongsTo
    {
        return $this->belongsTo(FuelTank::class);
    }

    public function fuelVendor(): BelongsTo
    {
        return $this->belongsTo(FuelVendor::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
