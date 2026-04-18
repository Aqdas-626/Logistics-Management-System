<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Scheduler extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vehicle_id',
        'service_name',
        'interval_km',
        'interval_days',
        'last_service_date',
        'last_service_odometer_km',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'last_service_date' => 'date',
            'is_active' => 'boolean',
            'interval_km' => 'integer',
            'interval_days' => 'integer',
            'last_service_odometer_km' => 'integer',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
