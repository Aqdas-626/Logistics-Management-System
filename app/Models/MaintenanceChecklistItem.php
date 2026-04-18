<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenanceChecklistItem extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'maintenance_management_id',
        'sort_order',
        'task_item',
        'is_done',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_done' => 'boolean',
        ];
    }

    public function maintenanceManagement(): BelongsTo
    {
        return $this->belongsTo(MaintenanceManagement::class, 'maintenance_management_id');
    }
}
