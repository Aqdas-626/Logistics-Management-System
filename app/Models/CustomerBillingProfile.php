<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerBillingProfile extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'customer_id',
        'billing_name',
        'ntn',
        'tax_number',
        'payment_terms',
        'credit_limit',
    ];

    protected $casts = [
        'credit_limit' => 'decimal:2',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
