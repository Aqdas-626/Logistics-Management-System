<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoutePlanStop extends Model
{
    protected $fillable = [
        'route_plan_id',
        'stop_order',
        'stop_name',
        'location_id',
        'latitude',
        'longitude',
        'position_recorded_at',
        'shipment_id',
        'job_queue_id',
        'eta_at',
        'ata_at',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'position_recorded_at' => 'datetime',
            'eta_at' => 'datetime',
            'ata_at' => 'datetime',
        ];
    }

    public function routePlan(): BelongsTo
    {
        return $this->belongsTo(RoutePlan::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function shipment(): BelongsTo
    {
        return $this->belongsTo(Shipment::class);
    }

    public function jobQueue(): BelongsTo
    {
        return $this->belongsTo(JobQueue::class);
    }
}
