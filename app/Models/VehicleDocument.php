<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class VehicleDocument extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vehicle_id',
        'document_name',
        'file',
        'type',
        'registration_expiry',
        'insurance_expiry',
    ];

    protected function casts(): array
    {
        return [
            'registration_expiry' => 'date',
            'insurance_expiry' => 'date',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }
}
