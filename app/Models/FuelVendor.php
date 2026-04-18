<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class FuelVendor extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'note',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }
}
