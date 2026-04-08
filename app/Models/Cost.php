<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Cost extends Model
{
    protected $fillable = [
        'jobable_type',
        'jobable_id',
        'charge_type_id',
        'type',
        'charge',
        'comments',
        'customer_id',
        'charged_by_user_id',
        'approved_by_user_id',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'charge' => 'decimal:2',
            'approved_at' => 'datetime',
        ];
    }

    public function jobable(): MorphTo
    {
        return $this->morphTo();
    }

    public function chargeType(): BelongsTo
    {
        return $this->belongsTo(ChargeType::class, 'charge_type_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function chargedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'charged_by_user_id');
    }

    public function approvedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_user_id');
    }
}
