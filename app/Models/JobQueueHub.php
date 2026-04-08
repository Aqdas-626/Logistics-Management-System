<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobQueueHub extends Model
{
    protected $fillable = [
        'job_queue_id',
        'location_id',
        'is_charge_customer',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_charge_customer' => 'boolean',
        ];
    }

    public function jobQueue(): BelongsTo
    {
        return $this->belongsTo(JobQueue::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}
