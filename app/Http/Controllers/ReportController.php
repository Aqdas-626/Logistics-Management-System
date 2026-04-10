<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Cost;
use App\Models\Dispatch;
use App\Models\Driver;
use App\Models\Invoice;
use App\Models\InvoicePayment;
use App\Models\Revenue;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $startDate = $request->string('start_date')->trim()->value();
        $endDate = $request->string('end_date')->trim()->value();
        $driverId = $request->integer('driver_id') ?: null;
        $companyId = $request->integer('company_id') ?: null;

        $start = $startDate !== '' ? Carbon::parse($startDate)->startOfDay() : now()->startOfMonth()->startOfDay();
        $end = $endDate !== '' ? Carbon::parse($endDate)->endOfDay() : now()->endOfMonth()->endOfDay();

        $revenues = Revenue::query()
            ->with(['jobable', 'customer.company'])
            ->whereBetween('created_at', [$start, $end])
            ->when($companyId, fn ($q) => $q->whereHas('customer', fn ($qq) => $qq->where('company_id', $companyId)))
            ->get();

        $costs = Cost::query()
            ->with(['jobable', 'customer.company'])
            ->whereBetween('created_at', [$start, $end])
            ->when($companyId, fn ($q) => $q->whereHas('customer', fn ($qq) => $qq->where('company_id', $companyId)))
            ->get();

        $jobRows = [];
        foreach ($revenues as $row) {
            $key = $row->jobable_type.'#'.$row->jobable_id;
            if (!isset($jobRows[$key])) {
                $jobRows[$key] = [
                    'job_key' => $key,
                    'job_number' => $row->jobable?->job_number ?? $row->jobable?->job_no ?? '—',
                    'job_type' => class_basename((string) $row->jobable_type),
                    'customer' => $row->customer?->name ?? '—',
                    'company' => $row->customer?->company?->name ?? '—',
                    'revenue' => 0.0,
                    'cost' => 0.0,
                    'margin' => 0.0,
                ];
            }
            $jobRows[$key]['revenue'] += (float) $row->charge;
        }
        foreach ($costs as $row) {
            $key = $row->jobable_type.'#'.$row->jobable_id;
            if (!isset($jobRows[$key])) {
                $jobRows[$key] = [
                    'job_key' => $key,
                    'job_number' => $row->jobable?->job_number ?? $row->jobable?->job_no ?? '—',
                    'job_type' => class_basename((string) $row->jobable_type),
                    'customer' => $row->customer?->name ?? '—',
                    'company' => $row->customer?->company?->name ?? '—',
                    'revenue' => 0.0,
                    'cost' => 0.0,
                    'margin' => 0.0,
                ];
            }
            $jobRows[$key]['cost'] += (float) $row->charge;
        }

        foreach ($jobRows as &$entry) {
            $entry['margin'] = $entry['revenue'] - $entry['cost'];
        }
        unset($entry);

        $jobFinancialRows = collect(array_values($jobRows))
            ->sortByDesc('margin')
            ->take(200)
            ->values();

        $totalRevenue = (float) $revenues->sum('charge');
        $totalCost = (float) $costs->sum('charge');
        $totalMargin = $totalRevenue - $totalCost;
        $marginPct = $totalRevenue > 0 ? round(($totalMargin / $totalRevenue) * 100, 2) : 0.0;

        $payments = InvoicePayment::query()
            ->with(['invoice.customer', 'invoice.company'])
            ->whereBetween('payment_date', [$start->toDateString(), $end->toDateString()])
            ->when($companyId, fn ($q) => $q->whereHas('invoice', fn ($qq) => $qq->where('company_id', $companyId)))
            ->latest('payment_date')
            ->limit(150)
            ->get()
            ->map(fn (InvoicePayment $p) => [
                'id' => $p->id,
                'payment_date' => optional($p->payment_date)->format('Y-m-d'),
                'invoice_no' => $p->invoice?->invoice_no ?? '—',
                'customer' => $p->invoice?->customer?->name ?? '—',
                'company' => $p->invoice?->company?->name ?? '—',
                'method' => $p->method ?? '—',
                'reference_no' => $p->reference_no ?? '—',
                'amount' => (float) $p->amount,
            ]);

        $unpaidInvoices = Invoice::query()
            ->with(['customer', 'company'])
            ->where('balance_due', '>', 0)
            ->whereIn('status', ['draft', 'issued', 'partially_paid', 'overdue'])
            ->when($companyId, fn ($q) => $q->where('company_id', $companyId))
            ->orderByDesc('due_date')
            ->limit(200)
            ->get()
            ->map(function (Invoice $inv) {
                $daysOverdue = 0;
                if ($inv->due_date && $inv->balance_due > 0 && now()->gt($inv->due_date)) {
                    $daysOverdue = (int) $inv->due_date->diffInDays(now());
                }

                return [
                    'id' => $inv->id,
                    'invoice_no' => $inv->invoice_no,
                    'customer' => $inv->customer?->name ?? '—',
                    'company' => $inv->company?->name ?? '—',
                    'issue_date' => optional($inv->issue_date)->format('Y-m-d'),
                    'due_date' => optional($inv->due_date)->format('Y-m-d'),
                    'status' => $inv->status,
                    'grand_total' => (float) $inv->grand_total,
                    'amount_paid' => (float) $inv->amount_paid,
                    'balance_due' => (float) $inv->balance_due,
                    'days_overdue' => $daysOverdue,
                ];
            });

        $aging = [
            'current' => 0.0,
            'days_1_30' => 0.0,
            'days_31_60' => 0.0,
            'days_61_90' => 0.0,
            'days_90_plus' => 0.0,
        ];
        foreach ($unpaidInvoices as $inv) {
            $amount = (float) $inv['balance_due'];
            $days = (int) $inv['days_overdue'];
            if ($days <= 0) {
                $aging['current'] += $amount;
            } elseif ($days <= 30) {
                $aging['days_1_30'] += $amount;
            } elseif ($days <= 60) {
                $aging['days_31_60'] += $amount;
            } elseif ($days <= 90) {
                $aging['days_61_90'] += $amount;
            } else {
                $aging['days_90_plus'] += $amount;
            }
        }

        $dispatches = Dispatch::query()
            ->with(['driverVehicleAssignment.driver:id,name,driver_code', 'driverVehicleAssignment.company:id,name', 'jobQueue.jobable'])
            ->whereBetween('dispatched_at', [$start, $end])
            ->when($driverId, fn ($q) => $q->whereHas('driverVehicleAssignment', fn ($qq) => $qq->where('driver_id', $driverId)))
            ->when($companyId, fn ($q) => $q->whereHas('driverVehicleAssignment', fn ($qq) => $qq->where('company_id', $companyId)))
            ->latest('dispatched_at')
            ->get();

        $driverStats = [];
        $deliveryRows = [];
        foreach ($dispatches as $d) {
            $driver = $d->driverVehicleAssignment?->driver;
            if (!$driver) {
                continue;
            }

            $driverKey = (string) $driver->id;
            if (!isset($driverStats[$driverKey])) {
                $driverStats[$driverKey] = [
                    'driver_id' => $driver->id,
                    'driver_name' => $driver->name,
                    'driver_code' => $driver->driver_code,
                    'company' => $d->driverVehicleAssignment?->company?->name ?? '—',
                    'total_dispatches' => 0,
                    'completed_deliveries' => 0,
                    'pending_deliveries' => 0,
                    'completion_rate' => 0.0,
                ];
            }

            $driverStats[$driverKey]['total_dispatches']++;
            if ($d->completed_at) {
                $driverStats[$driverKey]['completed_deliveries']++;
            } else {
                $driverStats[$driverKey]['pending_deliveries']++;
            }

            $deliveryRows[] = [
                'dispatch_id' => $d->id,
                'driver' => $driver->name,
                'driver_code' => $driver->driver_code,
                'company' => $d->driverVehicleAssignment?->company?->name ?? '—',
                'job_number' => $d->jobQueue?->jobable?->job_number ?? $d->jobQueue?->jobable?->job_no ?? '—',
                'dispatched_at' => optional($d->dispatched_at)->format('Y-m-d H:i'),
                'completed_at' => optional($d->completed_at)->format('Y-m-d H:i'),
                'status' => $d->status ?? '—',
            ];
        }

        foreach ($driverStats as &$stat) {
            $stat['completion_rate'] = $stat['total_dispatches'] > 0
                ? round(($stat['completed_deliveries'] / $stat['total_dispatches']) * 100, 2)
                : 0.0;
        }
        unset($stat);

        $driverPerformance = collect(array_values($driverStats))
            ->sortByDesc('completion_rate')
            ->values();

        $companyRevenue = collect($jobRows)
            ->groupBy('company')
            ->map(function ($rows, $name) {
                $revenue = (float) $rows->sum('revenue');
                $cost = (float) $rows->sum('cost');

                return [
                    'company' => $name ?: '—',
                    'revenue' => $revenue,
                    'cost' => $cost,
                    'margin' => $revenue - $cost,
                ];
            })
            ->values()
            ->sortByDesc('revenue')
            ->values();

        $branchRevenue = collect([
            [
                'branch' => 'Not available in current data model',
                'revenue' => 0,
                'cost' => 0,
                'margin' => 0,
            ],
        ]);

        return Inertia::render('Reports/Index', [
            'filters' => [
                'start_date' => $start->toDateString(),
                'end_date' => $end->toDateString(),
                'driver_id' => $driverId,
                'company_id' => $companyId,
            ],
            'options' => [
                'drivers' => Driver::query()->select('id', 'name', 'driver_code')->orderBy('name')->get(),
                'companies' => Company::query()->select('id', 'name')->orderBy('name')->get(),
            ],
            'kpis' => [
                'total_revenue' => $totalRevenue,
                'total_cost' => $totalCost,
                'total_margin' => $totalMargin,
                'margin_percent' => $marginPct,
                'collections_total' => (float) $payments->sum('amount'),
                'unpaid_total' => (float) $unpaidInvoices->sum('balance_due'),
            ],
            'reports' => [
                'driver_delivery' => $deliveryRows,
                'profit_loss' => [
                    'revenue' => $totalRevenue,
                    'cost' => $totalCost,
                    'margin' => $totalMargin,
                    'margin_percent' => $marginPct,
                ],
                'collections_payments' => $payments,
                'job_financial_lines' => $jobFinancialRows,
                'driver_performance' => $driverPerformance,
                'company_revenue' => $companyRevenue,
                'branch_revenue' => $branchRevenue,
                'aging_receivables' => $aging,
                'unpaid_invoices' => $unpaidInvoices,
            ],
        ]);
    }
}

