<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TyreManagement extends Model
{
    use SoftDeletes;

    protected $table = 'tyre_management';

    protected $fillable = [
        'vehicle_id',
        'position',
        'serial_number',
        'brand_model',
        'install_date',
        'install_odometer_km',
    ];

    protected function casts(): array
    {
        return [
            'install_date' => 'date',
            'install_odometer_km' => 'integer',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
