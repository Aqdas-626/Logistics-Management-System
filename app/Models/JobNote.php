<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class JobNote extends Model
{
    protected $fillable = [
        'jobable_type',
        'jobable_id',
        'endorsement_id',
        'note',
    ];

    public function endorsement(): BelongsTo
    {
        return $this->belongsTo(Endorsement::class);
    }

    public function jobable(): MorphTo
    {
        return $this->morphTo();
    }
}
