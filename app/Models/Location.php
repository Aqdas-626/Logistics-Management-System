<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Company;
use App\Models\Country;
use App\Models\Branch;
use App\Models\LocationType;
use App\Models\DoorType;
use App\Models\LiftType;
use App\Models\JobQueueHub;

class Location extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'company_id',
        'country_id',
        'branch_id',
        'name',
        'location_code',
        'location_type_id',
        'door_type_id',
        'lift_type_id',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'postcode',
        'contact_person',
        'phone',
        'mobile',
        'email',
        'send_tracking_email',
        'special_instruction',
        'status',
    ];

    protected $casts = [
        'send_tracking_email' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function country()
    {
        return $this->belongsTo(Country::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function locationType()
    {
        return $this->belongsTo(LocationType::class);
    }

    public function doorType()
    {
        return $this->belongsTo(DoorType::class);
    }

    public function liftType()
    {
        return $this->belongsTo(LiftType::class);
    }

    public function jobQueueHubs()
    {
        return $this->hasMany(JobQueueHub::class);
    }
}

