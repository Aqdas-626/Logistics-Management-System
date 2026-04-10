<?php

namespace App\Support;

use App\Models\Cart;
use App\Models\Customer;
use App\Models\Dispatch;
use App\Models\Export;
use App\Models\Import;
use App\Models\Invoice;
use App\Models\JobBooking;
use App\Models\JobQueue;
use App\Models\Swing;
use Illuminate\Support\Collection;

class RecentActivitiesFeed
{
    public static function forDashboard(int $limit = 15): array
    {
        $items = collect();

        self::appendJobBookings($items);
        self::appendCustomers($items);
        self::appendInvoices($items);
        self::appendDispatches($items);

        return $items
            ->sortByDesc('sort')
            ->take($limit)
            ->map(fn (array $row) => [
                'id' => $row['id'],
                'icon' => $row['icon'],
                'message' => $row['message'],
                'time' => $row['time'],
            ])
            ->values()
            ->all();
    }

    private static function appendJobBookings(Collection $items): void
    {
        JobBooking::query()
            ->latest('id')
            ->limit(8)
            ->get()
            ->each(function (JobBooking $jb) use ($items) {
                $at = $jb->created_at;
                if (! $at) {
                    return;
                }
                $ref = $jb->job_number ?: 'Booking #'.$jb->id;
                $items->push([
                    'id' => 'job-booking-'.$jb->id,
                    'icon' => '📦',
                    'message' => 'Job booking '.$ref.' created',
                    'sort' => $at->timestamp,
                    'time' => $at->diffForHumans(),
                ]);
            });
    }

    private static function appendCustomers(Collection $items): void
    {
        Customer::query()
            ->latest('id')
            ->limit(8)
            ->get()
            ->each(function (Customer $c) use ($items) {
                $at = $c->created_at;
                if (! $at) {
                    return;
                }
                $items->push([
                    'id' => 'customer-'.$c->id,
                    'icon' => '👤',
                    'message' => 'Customer '.$c->name.' registered',
                    'sort' => $at->timestamp,
                    'time' => $at->diffForHumans(),
                ]);
            });
    }

    private static function appendInvoices(Collection $items): void
    {
        Invoice::query()
            ->latest('id')
            ->limit(8)
            ->get()
            ->each(function (Invoice $inv) use ($items) {
                $at = $inv->created_at;
                if (! $at) {
                    return;
                }
                $items->push([
                    'id' => 'invoice-'.$inv->id,
                    'icon' => '🧾',
                    'message' => 'Invoice '.$inv->invoice_no.' added',
                    'sort' => $at->timestamp,
                    'time' => $at->diffForHumans(),
                ]);
            });
    }

    private static function appendDispatches(Collection $items): void
    {
        Dispatch::query()
            ->with(['jobQueue.jobable'])
            ->latest('dispatched_at')
            ->limit(8)
            ->get()
            ->each(function (Dispatch $d) use ($items) {
                $at = $d->dispatched_at ?? $d->created_at;
                if (! $at) {
                    return;
                }
                $label = self::queueJobLabel($d->jobQueue);
                $items->push([
                    'id' => 'dispatch-'.$d->id,
                    'icon' => '🚚',
                    'message' => 'Dispatch recorded for '.$label,
                    'sort' => $at->timestamp,
                    'time' => $at->diffForHumans(),
                ]);
            });
    }

    private static function queueJobLabel(?JobQueue $queue): string
    {
        if (! $queue) {
            return 'unknown job';
        }

        $jobable = $queue->jobable;
        if (! $jobable) {
            return 'queue #'.$queue->id;
        }

        if ($jobable instanceof Import || $jobable instanceof Export) {
            return $jobable->job_number ?: '#'.$jobable->id;
        }

        if ($jobable instanceof Cart || $jobable instanceof Swing) {
            return $jobable->job_no ?: '#'.$jobable->id;
        }

        return '#'.$queue->id;
    }
}
