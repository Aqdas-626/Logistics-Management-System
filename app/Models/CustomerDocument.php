<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerDocument extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'customer_id',
        'title',
        'file_path',
        'file_type',
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
}
