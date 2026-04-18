<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MechanicManagement extends Model
{
    use SoftDeletes;

    protected $table = 'mechanic_management';

    protected $fillable = [
        'name',
        'email',
        'phone',
        'category',
    ];
}
