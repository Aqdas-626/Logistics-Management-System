<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceSequence extends Model
{
    use HasFactory;

    protected $table = 'invoice_sequences';

    protected $fillable = [
        'company_id',
        'year',
        'prefix',
        'last_number',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
