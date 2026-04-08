<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Cart extends Model
{
    use SoftDeletes;

    public const JOB_TYPE = 'cart';

    protected $fillable = [
        'job_no',
        'customer_id',
        'from_location',
        'to_location',
        'document_received_at',
    ];

    protected $casts = [
        'document_received_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $cart) {
            if (empty($cart->job_no)) {
                $cart->job_no = 'CART-' . now()->format('YmdHisv');
            }
        });

        static::created(function (self $cart) {
            JobQueue::query()->firstOrCreate(
                [
                    'jobable_type' => self::class,
                    'jobable_id' => $cart->id,
                ],
                [
                    'status' => 'PENDING_TBA',
                ]
            );
        });
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function containers(): HasMany
    {
        return $this->hasMany(Container::class, 'job_id')
            ->where('job_type', self::JOB_TYPE);
    }

    public function jobServices(): MorphMany
    {
        return $this->morphMany(JobService::class, 'jobable');
    }

    public function jobNotes(): MorphMany
    {
        return $this->morphMany(JobNote::class, 'jobable');
    }

    public function jobQueue(): MorphOne
    {
        return $this->morphOne(JobQueue::class, 'jobable');
    }

    public function revenues(): MorphMany
    {
        return $this->morphMany(Revenue::class, 'jobable');
    }

    public function costs(): MorphMany
    {
        return $this->morphMany(Cost::class, 'jobable');
    }
}
