<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LiftType extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
    ];
}
