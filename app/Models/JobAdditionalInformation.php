<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobAdditionalInformation extends Model
{
    public const INSURANCE_TYPES = [
        'Owners Risk',
        'Carriers Risk',
        'All Risk',
        'Total Loss Only',
        'Third Party',
        'Limited Carrier Liability',
    ];

    protected $table = 'job_additional_information';

    protected $fillable = [
        'booking_id',
        'dg_signatory_id',
        'insurance_type',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(JobBooking::class, 'booking_id');
    }

    public function dgSignatory(): BelongsTo
    {
        return $this->belongsTo(DgSignatory::class, 'dg_signatory_id');
    }
}
