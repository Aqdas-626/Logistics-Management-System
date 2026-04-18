<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VehicleVendor extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vendor_name',
        'contact_person',
        'mobile_number',
        'date_of_contract',
        'status',
        'contract_document',
        'address',
    ];

    protected function casts(): array
    {
        return [
            'date_of_contract' => 'date',
        ];
    }
}
