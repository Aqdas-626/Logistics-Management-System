<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FuelTankTransaction extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'fuel_tank_id',
        'type',
        'quantity',
        'before_stock',
        'after_stock',
        'transaction_date',
        'reference_type',
        'reference_id',
        'remarks',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:2',
            'before_stock' => 'decimal:2',
            'after_stock' => 'decimal:2',
            'transaction_date' => 'date',
        ];
    }

    public function fuelTank(): BelongsTo
    {
        return $this->belongsTo(FuelTank::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
