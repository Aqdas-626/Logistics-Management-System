<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Models\MaintenanceManagement;
use App\Models\Vehicle;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceAnalyticsController extends Controller
{
    public function index(): Response
    {
        $monthKeys = $this->lastTwelveMonthKeys();
        $monthlyTotals = array_fill_keys($monthKeys, 0.0);

        MaintenanceManagement::query()
            ->where('status', '!=', 'cancelled')
            ->select(['total_cost', 'start_date', 'created_at'])
            ->chunkById(500, function ($rows) use (&$monthlyTotals): void {
                foreach ($rows as $row) {
                    $base = $row->start_date ?? $row->created_at;
                    if ($base === null) {
                        continue;
                    }
                    $ym = Carbon::parse($base)->format('Y-m');
                    if (! array_key_exists($ym, $monthlyTotals)) {
                        continue;
                    }
                    $monthlyTotals[$ym] += (float) $row->total_cost;
                }
            });

        $monthlySpend = collect($monthKeys)->map(function (string $ym) use ($monthlyTotals) {
            return [
                'period' => $ym,
                'label' => $ym,
                'total' => round($monthlyTotals[$ym], 2),
            ];
        })->values()->all();

        $topVehicles = $this->topCostliestVehicles();

        return Inertia::render('MaintenanceManagement/Analytics/Index', [
            'monthlySpend' => $monthlySpend,
            'topVehicles' => $topVehicles,
        ]);
    }

    /**
     * @return list<string>
     */
    private function lastTwelveMonthKeys(): array
    {
        $keys = [];
        for ($i = 11; $i >= 0; $i--) {
            $keys[] = now()->subMonths($i)->format('Y-m');
        }

        return $keys;
    }

    /**
     * @return list<array{vehicle_id: int|null, label: string, total: float}>
     */
    private function topCostliestVehicles(): array
    {
        $driver = DB::connection()->getDriverName();
        $sumExpr = $driver === 'sqlite'
            ? 'SUM(CAST(total_cost AS REAL))'
            : 'SUM(total_cost)';

        $rows = MaintenanceManagement::query()
            ->where('status', '!=', 'cancelled')
            ->selectRaw('vehicle_id, '.$sumExpr.' as sum_cost')
            ->groupBy('vehicle_id')
            ->orderByDesc('sum_cost')
            ->limit(10)
            ->get();

        $vehicleIds = $rows->pluck('vehicle_id')->filter()->unique()->values()->all();
        $vehicles = Vehicle::query()
            ->whereIn('id', $vehicleIds)
            ->get(['id', 'name', 'registration_no'])
            ->keyBy('id');

        return $rows->map(function ($row) use ($vehicles) {
            $v = $vehicles->get($row->vehicle_id);

            return [
                'vehicle_id' => $row->vehicle_id,
                'label' => $this->vehicleChartLabel($v),
                'total' => round((float) $row->sum_cost, 2),
            ];
        })->values()->all();
    }

    private function vehicleChartLabel(?Vehicle $vehicle): string
    {
        if (! $vehicle) {
            return 'Unknown vehicle';
        }

        $reg = (string) ($vehicle->registration_no ?? '');
        $name = (string) ($vehicle->name ?? '');
        if ($reg !== '' && $name !== '') {
            return $reg.' — '.$name;
        }

        return $reg !== '' ? $reg : ($name !== '' ? $name : 'Vehicle #'.$vehicle->id);
    }
}
