<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Swing extends Model
{
    use SoftDeletes;

    public const JOB_TYPE = 'swing';

    protected $fillable = [
        'job_no',
        'customer_id',
        'from_location',
        'document_received_at',
    ];

    protected $casts = [
        'document_received_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $swing) {
            if (empty($swing->job_no)) {
                $swing->job_no = 'SWING-' . now()->format('YmdHisv');
            }
        });

        static::created(function (self $swing) {
            JobQueue::query()->firstOrCreate(
                [
                    'jobable_type' => self::class,
                    'jobable_id' => $swing->id,
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
