<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class IncidentReport extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'vehicle_id',
        'reported_by',
        'description',
        'report_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'report_date' => 'date',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    public function maintenanceTicket(): HasOne
    {
        return $this->hasOne(MaintenanceManagement::class, 'incident_report_id');
    }
}
