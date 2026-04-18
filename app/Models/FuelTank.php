<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FuelTank extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'fuel_type',
        'capacity',
        'current_stock',
        'unit',
        'note',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'decimal:2',
            'current_stock' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }
}
