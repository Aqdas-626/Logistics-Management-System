<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'max_weight_kg',
        'max_volume_m3',
    ];

    protected function casts(): array
    {
        return [
            'max_weight_kg' => 'decimal:3',
            'max_volume_m3' => 'decimal:3',
        ];
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }
}
