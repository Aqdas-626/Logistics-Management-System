<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class BranchAsset extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'branch_id',
        'asset_name',
        'asset_code',
        'category',
        'serial_no',
        'quantity',
        'condition',
        'purchase_date',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'purchase_date' => 'date',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (BranchAsset $asset): void {
            if ($asset->asset_code) {
                $asset->asset_code = strtoupper($asset->asset_code);
            }
        });
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
