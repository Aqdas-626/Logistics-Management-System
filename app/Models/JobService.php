<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class JobService extends Model
{
    protected $fillable = [
        'jobable_type',
        'jobable_id',
        'service_id',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function jobable(): MorphTo
    {
        return $this->morphTo();
    }
}
