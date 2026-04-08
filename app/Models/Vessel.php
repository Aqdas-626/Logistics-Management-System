<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vessel extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'country_id',
        'ship_type_id',
        'imo_number',
        'mmsi',
        'call_sign',
        'built_year',
        'status',
    ];

    protected $casts = [
        'built_year' => 'integer',
    ];

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function shipType()
    {
        return $this->belongsTo(ShipType::class, 'ship_type_id');
    }
}

