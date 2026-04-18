<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TraccarDevice extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'traccar_device_id',
        'name',
        'unique_id',
        'model',
        'phone',
        'category',
        'is_active',
        'last_synced_at',
        'attributes',
        'last_latitude',
        'last_longitude',
        'last_fix_time',
        'last_server_time',
        'last_speed_knots',
        'last_course',
        'last_position_valid',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_synced_at' => 'datetime',
            'attributes' => 'array',
            'last_latitude' => 'float',
            'last_longitude' => 'float',
            'last_fix_time' => 'datetime',
            'last_server_time' => 'datetime',
            'last_speed_knots' => 'float',
            'last_course' => 'float',
            'last_position_valid' => 'boolean',
        ];
    }

    public function gpsSetups(): HasMany
    {
        return $this->hasMany(VehicleGpsSetup::class, 'traccar_device_id');
    }
}
