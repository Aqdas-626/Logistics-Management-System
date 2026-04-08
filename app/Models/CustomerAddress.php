<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerAddress extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'customer_id',
        'building',
        'street_no',
        'street',
        'suburb',
        'city',
        'state',
        'postcode',
        'contact_person',
        'instructions',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
