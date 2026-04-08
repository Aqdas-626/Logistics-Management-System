<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobBookingAddress extends Model
{
    protected $fillable = [
        'job_booking_id',
        'type',
        'country_id',
        'name',
        'building',
        'street_no',
        'street',
        'suburb',
        'city',
        'state',
        'postcode',
        'contact_person',
        'mobile',
        'phone',
        'email',
        'instructions',
    ];

    public function jobBooking(): BelongsTo
    {
        return $this->belongsTo(JobBooking::class);
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }
}
