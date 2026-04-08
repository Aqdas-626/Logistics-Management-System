<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use SoftDeletes;
use HasFactory;

class IsoCode extends Model
{
    protected $table = 'iso_codes';

    protected $fillable = [
        'code',
        'name',
        'status',
    ];

    protected $casts = [
        'status' => 'boolean',
    ];

    public function scopeActive($query)
    {
        return $query->where('status', true);
    }
}
