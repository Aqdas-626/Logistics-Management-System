<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobDocument extends Model
{
    public const JOB_TYPES = ['import', 'cart', 'swing', 'export'];

    protected $fillable = [
        'job_type',
        'file',
    ];
}
