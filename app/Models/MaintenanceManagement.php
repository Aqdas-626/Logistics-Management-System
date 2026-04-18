<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenanceManagement extends Model
{
    use SoftDeletes;

    protected $table = 'maintenance_management';

    protected $fillable = [
        'vehicle_id',
        'maintenance_vendor_id',
        'mechanic_management_id',
        'incident_report_id',
        'scheduler_id',
        'status',
        'start_date',
        'end_date',
        'service_details',
        'total_cost',
        'currency',
        'invoice_receipt_path',
        'priority',
        'notification_method',
        'notify_user_ids',
        'is_auto_generated',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'total_cost' => 'decimal:2',
            'notify_user_ids' => 'array',
            'is_auto_generated' => 'boolean',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function maintenanceVendor(): BelongsTo
    {
        return $this->belongsTo(MaintenanceVendor::class, 'maintenance_vendor_id');
    }

    public function mechanicManagement(): BelongsTo
    {
        return $this->belongsTo(MechanicManagement::class, 'mechanic_management_id');
    }

    public function incidentReport(): BelongsTo
    {
        return $this->belongsTo(IncidentReport::class);
    }

    public function scheduler(): BelongsTo
    {
        return $this->belongsTo(Scheduler::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function checklistItems(): HasMany
    {
        return $this->hasMany(MaintenanceChecklistItem::class, 'maintenance_management_id')->orderBy('sort_order');
    }

    public function partUseds(): HasMany
    {
        return $this->hasMany(MaintenancePartUsed::class, 'maintenance_management_id');
    }
}
