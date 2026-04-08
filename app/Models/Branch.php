<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Branch extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'name',
        'code',
        'phone',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'postcode',
        'country_code',
        'timezone',
        'base_currency',
        'settings_json',
        'status',
        'manager_user_id',
    ];

    protected function casts(): array
    {
        return [
            'settings_json' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Branch $branch): void {
            if ($branch->code) {
                $branch->code = strtoupper($branch->code);
            }
            if ($branch->country_code) {
                $branch->country_code = strtoupper($branch->country_code);
            }
            if ($branch->base_currency) {
                $branch->base_currency = strtoupper($branch->base_currency);
            }
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'manager_user_id');
    }

    /** One contact row per branch (unique branch_id in DB). */
    public function contact(): HasOne
    {
        return $this->hasOne(BranchContact::class);
    }

    public function assets(): HasMany
    {
        return $this->hasMany(BranchAsset::class);
    }

    public function branchEmployees(): HasMany
    {
        return $this->hasMany(BranchEmployee::class);
    }

    public function departments(): HasMany
    {
        return $this->hasMany(Department::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }
}
