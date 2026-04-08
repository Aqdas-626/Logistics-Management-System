<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContactNote extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'customer_id',
        'note',
        'interaction_type',
        'interaction_date',
    ];

    protected $casts = [
        'interaction_date' => 'datetime',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
