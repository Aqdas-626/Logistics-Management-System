<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobPackage extends Model
{
    protected $fillable = [
        'booking_id',
        'package_name',
        'units',
        'weight_kg',
        'length_cm',
        'width_cm',
        'height_cm',
        'cubic_m3',
        'package_type_id',
        'dg_type_id',
        'remarks',
    ];

    protected $casts = [
        'units' => 'integer',
        'weight_kg' => 'decimal:3',
        'length_cm' => 'decimal:2',
        'width_cm' => 'decimal:2',
        'height_cm' => 'decimal:2',
        'cubic_m3' => 'decimal:4',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(JobBooking::class, 'booking_id');
    }

    public function packageType(): BelongsTo
    {
        return $this->belongsTo(PackageType::class, 'package_type_id');
    }

    public function dgType(): BelongsTo
    {
        return $this->belongsTo(DgType::class, 'dg_type_id');
    }
}
