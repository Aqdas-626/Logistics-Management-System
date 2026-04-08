<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Country extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'iso_alpha2',
        'iso_alpha3',
        'phone_code',
        'currency_code',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Normalize ISO codes to uppercase on save.
     */
    protected static function booted(): void
    {
        static::saving(function (Country $country): void {
            if ($country->iso_alpha2) {
                $country->iso_alpha2 = strtoupper($country->iso_alpha2);
            }
            if ($country->iso_alpha3) {
                $country->iso_alpha3 = strtoupper($country->iso_alpha3);
            }
            if ($country->currency_code) {
                $country->currency_code = strtoupper($country->currency_code);
            }
        });
    }

    public function companies(): HasMany
    {
        return $this->hasMany(Company::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}
