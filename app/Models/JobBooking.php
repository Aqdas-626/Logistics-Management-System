<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class JobBooking extends Model
{
    public const JOB_TYPES = ['general', 'import', 'cart', 'export', 'swing'];

    protected $fillable = [
        'company_id',
        'branch_id',
        'customer_id',
        'sender_customer_id',
        'receiver_customer_id',
        'booking_id',
        'job_number',
        'job_type',
        'customer_reference',
        'receiver_reference',
        'freight_ready_by',
        'document_received_at',
        'signature_required',
    ];

    protected $casts = [
        'freight_ready_by' => 'datetime',
        'document_received_at' => 'datetime',
        'signature_required' => 'boolean',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $jobBooking) {
            // Ensure job_number is always populated (it is nullable in DB).
            if (empty($jobBooking->job_number)) {
                // Format: JN-YYYYMMDDHHMMSSmmm
                $jobBooking->job_number = 'JN-' . now()->format('YmdHisv');
            }
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function branch(): BelongsTo
    {
        // Keep branch visible in views even if branch is soft-deleted.
        return $this->belongsTo(Branch::class)->withTrashed();
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function senderCustomer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'sender_customer_id');
    }

    public function receiverCustomer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'receiver_customer_id');
    }

    public function packages(): HasMany
    {
        return $this->hasMany(JobPackage::class, 'booking_id');
    }

    public function addresses(): HasMany
    {
        return $this->hasMany(JobBookingAddress::class);
    }

    public function senderAddress()
    {
        return $this->hasOne(JobBookingAddress::class)->where('type', 'sender');
    }

    public function receiverAddress()
    {
        return $this->hasOne(JobBookingAddress::class)->where('type', 'receiver');
    }

    public function trackingNotifications(): HasMany
    {
        return $this->hasMany(JobTrackingNotification::class, 'job_booking_id');
    }

    public function additionalInformation()
    {
        return $this->hasOne(JobAdditionalInformation::class, 'booking_id');
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'job_booking_services');
    }
}
