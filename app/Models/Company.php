<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'country_id',
        'name',
        'email',
        'phone',
        'logo',
        'website',
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
    ];

    protected function casts(): array
    {
        return [
            'settings_json' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Company $company): void {
            if ($company->country_code) {
                $company->country_code = strtoupper($company->country_code);
            }
            if ($company->base_currency) {
                $company->base_currency = strtoupper($company->base_currency);
            }
        });
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
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
