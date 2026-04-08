<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Model;

class JobQueue extends Model
{
    protected $fillable = [
        'jobable_type',
        'jobable_id',
        'status',
    ];

    public function jobable(): MorphTo
    {
        return $this->morphTo();
    }

    public function dispatches(): HasMany
    {
        return $this->hasMany(Dispatch::class);
    }

    public function latestDispatch(): HasOne
    {
        return $this->hasOne(Dispatch::class)->latestOfMany();
    }

    public function hubs(): HasMany
    {
        return $this->hasMany(JobQueueHub::class)->orderBy('sort_order')->orderBy('id');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(JobQueueDocument::class)->latest();
    }
}
