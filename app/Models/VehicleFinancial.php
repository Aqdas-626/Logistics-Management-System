<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VehicleFinancial extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vehicle_id',
        'billing_method',
        'default_cost',
        'ownership_type',
        'currency',
        'effective_from',
        'effective_to',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'default_cost' => 'decimal:2',
            'effective_from' => 'date',
            'effective_to' => 'date',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
