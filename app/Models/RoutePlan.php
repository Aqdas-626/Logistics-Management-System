<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RoutePlan extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'branch_id',
        'route_code',
        'route_name',
        'plan_date',
        'scheduled_departure_at',
        'estimated_duration_minutes',
        'origin_location_id',
        'destination_location_id',
        'driver_vehicle_assignment_id',
        'status',
        'started_at',
        'completed_at',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'plan_date' => 'date',
            'scheduled_departure_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
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

    public function originLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'origin_location_id');
    }

    public function destinationLocation(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'destination_location_id');
    }

    public function driverVehicleAssignment(): BelongsTo
    {
        return $this->belongsTo(DriverVehicleAssignment::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function stops(): HasMany
    {
        return $this->hasMany(RoutePlanStop::class)->orderBy('stop_order')->orderBy('id');
    }
}
