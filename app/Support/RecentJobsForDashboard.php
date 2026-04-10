<?php

namespace App\Support;

use App\Models\Cart;
use App\Models\Container;
use App\Models\Export;
use App\Models\Import;
use App\Models\JobQueue;
use App\Models\Swing;

class RecentJobsForDashboard
{
    public static function collect(int $limit = 10): array
    {
        return JobQueue::query()
            ->with(['jobable.customer'])
            ->latest('id')
            ->limit($limit)
            ->get()
            ->map(fn (JobQueue $queue) => self::presentRow($queue))
            ->all();
    }

    private static function presentRow(JobQueue $queue): array
    {
        $jobable = $queue->jobable;
        $container = self::resolveContainer($queue);

        $jobId = $jobable?->job_number ?? $jobable?->job_no ?? ('#'.$queue->id);
        $customer = $jobable?->customer?->name ?? '—';

        $origin = $container?->from_location;
        $destination = $container?->to_location;

        if ($jobable instanceof Cart || $jobable instanceof Swing) {
            $origin = $origin ?? $jobable->from_location;
            $destination = $destination ?? $jobable->to_location;
        }

        ['label' => $statusLabel, 'tone' => $tone] = self::statusPresentation($queue->status);

        $at = $queue->updated_at ?? $queue->created_at;

        return [
            'queueId' => $queue->id,
            'jobId' => $jobId,
            'customer' => $customer,
            'origin' => $origin ?: '—',
            'destination' => $destination ?: '—',
            'status' => $statusLabel,
            'statusTone' => $tone,
            'date' => $at ? $at->format('M j, Y') : '—',
        ];
    }

    /**
     * @return array{label: string, tone: string}
     */
    private static function statusPresentation(string $status): array
    {
        return match ($status) {
            'DELIVERED' => ['label' => 'Completed', 'tone' => 'completed'],
            'CANCELLED' => ['label' => 'Cancelled', 'tone' => 'cancelled'],
            'IN_PROCESS', 'DISPATCH', 'ACTIVE' => ['label' => 'In Progress', 'tone' => 'in_progress'],
            'PENDING_TBA' => ['label' => 'Pending', 'tone' => 'pending'],
            default => ['label' => str_replace('_', ' ', $status), 'tone' => 'pending'],
        };
    }

    private static function resolveContainer(JobQueue $queue): ?Container
    {
        $typeMap = [
            Import::class => 'import',
            Export::class => 'export',
            Cart::class => 'cart',
            Swing::class => 'swing',
        ];

        $jobType = $typeMap[$queue->jobable_type] ?? null;
        if (! $jobType) {
            return null;
        }

        return Container::query()
            ->where('job_type', $jobType)
            ->where('job_id', $queue->jobable_id)
            ->latest('id')
            ->first();
    }
}
