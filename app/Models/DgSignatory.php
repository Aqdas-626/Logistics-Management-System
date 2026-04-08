<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class DgSignatory extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'certificate_no',
        'expiry_date',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'expiry_date' => 'date',
    ];
}
