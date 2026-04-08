<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Container extends Model
{
    use SoftDeletes;

    public const JOB_TYPES = ['import', 'cart', 'swing', 'export'];

    protected $fillable = [
        'container_number',
        'job_type',
        'job_id',
        'cut_off_date',
        'grid_position',
        'no_of_containers',
        'reference',
        'iso_code_id',
        'dg_type_id',
        'shipping_id',
        'vessel_id',
        'ship_type_id',
        'weight',
        'from_location',
        'to_location',
        'return_to',
        'security_check',
        'random_number',
        'release_ecn_number',
        'port_pin_no',
        'available_date',
        'vb_slot_date',
        'demurrage_date',
        'detention_days',
        'voyage',
        'xray',
        'dgs',
        'live_ul',
        'hold_sh',
        'hold_customs',
        'hold_mpi',
        'door_type_id',
        'lift_type_id',
        'ready_now',
    ];

    protected $casts = [
        'cut_off_date' => 'date',
        'available_date' => 'date',
        'vb_slot_date' => 'date',
        'demurrage_date' => 'date',
        'weight' => 'decimal:2',
        'xray' => 'boolean',
        'dgs' => 'boolean',
        'live_ul' => 'boolean',
        'hold_sh' => 'boolean',
        'hold_customs' => 'boolean',
        'hold_mpi' => 'boolean',
        'ready_now' => 'boolean',
    ];

    public function isoCode(): BelongsTo
    {
        return $this->belongsTo(IsoCode::class);
    }

    public function dgType(): BelongsTo
    {
        return $this->belongsTo(DgType::class);
    }

    public function shipping(): BelongsTo
    {
        return $this->belongsTo(Shipping::class);
    }

    public function vessel(): BelongsTo
    {
        return $this->belongsTo(Vessel::class);
    }

    public function shipType(): BelongsTo
    {
        return $this->belongsTo(ShipType::class);
    }

    public function importJob(): BelongsTo
    {
        return $this->belongsTo(Import::class, 'job_id');
    }

    public function doorType(): BelongsTo
    {
        return $this->belongsTo(DoorType::class);
    }

    public function liftType(): BelongsTo
    {
        return $this->belongsTo(LiftType::class);
    }

    public function cartJob(): BelongsTo
    {
        return $this->belongsTo(Cart::class, 'job_id');
    }

    public function swingJob(): BelongsTo
    {
        return $this->belongsTo(Swing::class, 'job_id');
    }
}
