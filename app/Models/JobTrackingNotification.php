<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobTrackingNotification extends Model
{
    public const COMMUNICATION_TYPES = ['EMAIL', 'PHONE', 'SMS', 'WHATSAPP', 'PUSH'];

    protected $fillable = [
        'job_booking_id',
        'notification_type_id',
        'communication_type',
        'contact_value',
        'is_sent',
        'enabled',
    ];

    protected $casts = [
        'is_sent' => 'boolean',
        'enabled' => 'boolean',
    ];

    public function jobBooking(): BelongsTo
    {
        return $this->belongsTo(JobBooking::class, 'job_booking_id');
    }

    /**
     * Fallback relation if the FK column is stored against JobBooking's `booking_id` (string),
     * instead of the numeric `job_bookings.id`.
     */
    public function jobBookingByBookingId(): BelongsTo
    {
        return $this->belongsTo(JobBooking::class, 'job_booking_id', 'booking_id');
    }

    public function notificationType(): BelongsTo
    {
        return $this->belongsTo(NotificationType::class, 'notification_type_id');
    }
}
