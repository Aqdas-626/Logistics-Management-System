<?php

namespace App\Http\Controllers;

use App\Models\Dispatch;
use App\Models\Driver;
use App\Models\Invoice;
use App\Models\JobQueue;
use App\Models\Revenue;
use App\Support\RecentActivitiesFeed;
use App\Support\RecentJobsForDashboard;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $now = Carbon::now();

        $sumBetween = fn (Carbon $start, Carbon $end): float => (float) Revenue::query()
            ->whereBetween('created_at', [$start, $end])
            ->sum('charge');

        $todayStart = $now->copy()->startOfDay();
        $todayEnd = $now->copy()->endOfDay();

        $weekStart = $now->copy()->startOfWeek();
        $weekEnd = $now->copy()->endOfWeek();

        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();

        $deliveriesToday = Dispatch::query()
            ->whereNotNull('completed_at')
            ->whereBetween('completed_at', [$todayStart, $todayEnd])
            ->count();

        $completedJobs = JobQueue::query()
            ->where('status', 'DELIVERED')
            ->count();

        $openInvoices = Invoice::query()
            ->whereIn('status', ['draft', 'issued', 'partially_paid', 'overdue'])
            ->count();

        $totalJobs = JobQueue::query()->count();

        $activeDrivers = Driver::query()
            ->where('status', 'active')
            ->count();

        $pendingDispatches = JobQueue::query()
            ->where('status', 'DISPATCH')
            ->count();

        return Inertia::render('Dashboard', [
            'revenueStats' => [
                'today' => [
                    'total' => $sumBetween($todayStart, $todayEnd),
                    'period' => $todayStart->format('M j, Y'),
                ],
                'week' => [
                    'total' => $sumBetween($weekStart, $weekEnd),
                    'period' => $weekStart->format('M j').' – '.$weekEnd->format('M j, Y'),
                ],
                'month' => [
                    'total' => $sumBetween($monthStart, $monthEnd),
                    'period' => $monthStart->format('F Y'),
                ],
            ],
            'statCounts' => [
                'totalJobs' => $totalJobs,
                'activeDrivers' => $activeDrivers,
                'pendingDispatches' => $pendingDispatches,
                'deliveriesToday' => $deliveriesToday,
                'completedJobs' => $completedJobs,
                'openInvoices' => $openInvoices,
            ],
            'recentActivities' => RecentActivitiesFeed::forDashboard(15),
            'recentJobs' => RecentJobsForDashboard::collect(10),
        ]);
    }
}
