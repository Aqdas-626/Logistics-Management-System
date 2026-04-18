<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Shipment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'branch_id',
        'customer_id',
        'shipment_no',
        'shipment_type',
        'jobable_type',
        'jobable_id',
        'job_queue_id',
        'status',
        'booked_at',
        'pickup_at',
        'eta_at',
        'delivered_at',
        'barcode',
        'remarks',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'booked_at' => 'datetime',
            'pickup_at' => 'datetime',
            'eta_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    public function jobable(): MorphTo
    {
        return $this->morphTo();
    }

    public function jobQueue(): BelongsTo
    {
        return $this->belongsTo(JobQueue::class);
    }
}
