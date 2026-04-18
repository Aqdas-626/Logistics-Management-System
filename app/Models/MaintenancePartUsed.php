<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenancePartUsed extends Model
{
    use SoftDeletes;

    protected $table = 'maintenance_part_useds';

    protected $fillable = [
        'maintenance_management_id',
        'parts_stock_id',
        'quantity',
        'unit_cost_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'unit_cost_snapshot' => 'decimal:2',
        ];
    }

    public function maintenanceManagement(): BelongsTo
    {
        return $this->belongsTo(MaintenanceManagement::class, 'maintenance_management_id');
    }

    public function partStock(): BelongsTo
    {
        return $this->belongsTo(PartStock::class, 'parts_stock_id');
    }
}
