<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VehicleGpsSetup extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vehicle_id',
        'traccar_device_id',
        'api_username',
        'imei',
        'provider',
        'auto_sync',
        'last_synced_at',
        'sync_message',
    ];

    protected function casts(): array
    {
        return [
            'auto_sync' => 'boolean',
            'last_synced_at' => 'datetime',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function traccarDevice(): BelongsTo
    {
        return $this->belongsTo(TraccarDevice::class, 'traccar_device_id');
    }
}
