<?php

namespace App\Support;

use App\Models\ChargeType;
use App\Models\Cost;
use App\Models\Revenue;

class JobFinancialShowData
{
    /**
     * @return array<string, mixed>
     */
    public static function for(string $jobableType, int $jobableId): array
    {
        return [
            'revenues' => Revenue::query()
                ->where('jobable_type', $jobableType)
                ->where('jobable_id', $jobableId)
                ->with(['chargeType:id,name', 'customer:id,customer_code,name', 'chargedByUser:id,name'])
                ->latest()
                ->get(),
            'costs' => Cost::query()
                ->where('jobable_type', $jobableType)
                ->where('jobable_id', $jobableId)
                ->with(['chargeType:id,name', 'customer:id,customer_code,name', 'chargedByUser:id,name'])
                ->latest()
                ->get(),
            'chargeTypes' => ChargeType::query()
                ->where('status', 'active')
                ->orderBy('name')
                ->get(['id', 'name']),
            'jobableType' => $jobableType,
        ];
    }
}
