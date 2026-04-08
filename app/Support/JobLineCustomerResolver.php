<?php

namespace App\Support;

use App\Models\Cart;
use App\Models\Export;
use App\Models\Import;
use App\Models\Swing;

final class JobLineCustomerResolver
{
    private const JOBABLE_TYPES = [
        Import::class,
        Export::class,
        Cart::class,
        Swing::class,
    ];

    public static function forJobable(string $jobableType, int $jobableId): ?int
    {
        if (! in_array($jobableType, self::JOBABLE_TYPES, true)) {
            return null;
        }

        $jobable = $jobableType::query()->find($jobableId);

        return $jobable?->customer_id;
    }
}
