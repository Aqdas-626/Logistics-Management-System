<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'branch_id',
        'vehicle_type_id',
        'name',
        'image',
        'registration_no',
        'vin',
        'chassis_no',
        'engine_no',
        'color',
        'fuel_type',
        'fuel_capacity',
        'fuel_efficiency',
        'opening_fuel',
        'current_fuel',
        'status',
        'odometer_km',
    ];

    protected function casts(): array
    {
        return [
            'odometer_km' => 'decimal:2',
            'fuel_capacity' => 'decimal:2',
            'fuel_efficiency' => 'decimal:2',
            'opening_fuel' => 'decimal:2',
            'current_fuel' => 'decimal:2',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function vehicleType(): BelongsTo
    {
        return $this->belongsTo(VehicleType::class);
    }

    public function driverAssignments(): HasMany
    {
        return $this->hasMany(DriverVehicleAssignment::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(VehicleDocument::class);
    }

    public function financial(): HasOne
    {
        return $this->hasOne(VehicleFinancial::class);
    }

    public function gpsSetup(): HasOne
    {
        return $this->hasOne(VehicleGpsSetup::class);
    }
}
