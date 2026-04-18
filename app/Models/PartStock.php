<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartStock extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sku',
        'name',
        'unit',
        'unit_cost',
        'stock_qty',
    ];

    protected function casts(): array
    {
        return [
            'unit_cost' => 'decimal:2',
            'stock_qty' => 'integer',
        ];
    }
}
