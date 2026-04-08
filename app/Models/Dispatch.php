<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Dispatch extends Model
{
    protected $fillable = [
        'job_queue_id',
        'driver_vehicle_assignment_id',
        'dispatched_at',
        'completed_at',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'dispatched_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function jobQueue(): BelongsTo
    {
        return $this->belongsTo(JobQueue::class);
    }

    public function driverVehicleAssignment(): BelongsTo
    {
        return $this->belongsTo(DriverVehicleAssignment::class);
    }
}
