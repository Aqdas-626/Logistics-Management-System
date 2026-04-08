<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'company_id',
        'country_id',
        'customer_code',
        'name',
        'type',
        'status',
        'notes',
        'is_consignor',
        'is_consignee',
    ];

    protected $casts = [
        'is_consignor' => 'boolean',
        'is_consignee' => 'boolean',
    ];

    // Relationships
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function address()
    {
        return $this->hasOne(CustomerAddress::class);
    }

    // Backwards compatibility (older code may eager-load `addresses`)
    public function addresses()
    {
        return $this->address();
    }

    public function contacts()
    {
        return $this->hasMany(CustomerContact::class);
    }

    public function documents()
    {
        return $this->hasMany(CustomerDocument::class);
    }

    public function billingProfile()
    {
        return $this->hasOne(CustomerBillingProfile::class);
    }

    public function contactNotes()
    {
        return $this->hasMany(ContactNote::class);
    }
}
