<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Driver extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'user_id',
        'driver_code',
        'name',
        'phone',
        'email',
        'license_no',
        'license_expiry',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'license_expiry' => 'date',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany('App\\Models\\DriverDocument');
    }

    public function vehicleAssignments(): HasMany
    {
        return $this->hasMany(DriverVehicleAssignment::class);
    }
}
