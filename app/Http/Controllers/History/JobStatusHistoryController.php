<?php

namespace App\Http\Controllers\History;

use App\Http\Controllers\Controller;
use App\Models\JobQueue;
use App\Models\JobStatusHistory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobStatusHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->value();
        $status = $request->string('status')->trim()->value();

        $query = JobStatusHistory::query()
            ->with([
                'jobQueue.jobable',
                'changedBy:id,name',
            ])
            ->latest('changed_at')
            ->latest('id');

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('remarks', 'like', '%'.$search.'%')
                    ->orWhere('old_status', 'like', '%'.$search.'%')
                    ->orWhere('new_status', 'like', '%'.$search.'%')
                    ->orWhereHas('jobQueue', function ($qq) use ($search) {
                        $qq->where('id', 'like', '%'.$search.'%');
                    })
                    ->orWhereHas('jobQueue.jobable', function ($qq) use ($search) {
                        $qq->where('job_number', 'like', '%'.$search.'%')
                            ->orWhere('job_no', 'like', '%'.$search.'%');
                    });
            });
        }

        if ($status !== '') {
            $query->where('new_status', $status);
        }

        $histories = $query->paginate(15)->withQueryString();
        $histories->getCollection()->transform(function (JobStatusHistory $history) {
            $jobable = $history->jobQueue?->jobable;

            return [
                'id' => $history->id,
                'job_queue_id' => $history->job_queue_id,
                'job_reference' => $jobable?->job_number ?? $jobable?->job_no ?? ('Queue #'.$history->job_queue_id),
                'old_status' => $history->old_status,
                'new_status' => $history->new_status,
                'remarks' => $history->remarks,
                'changed_by' => $history->changedBy?->name ?? 'System',
                'changed_at' => $history->changed_at?->format('M j, Y h:i A') ?? '-',
            ];
        });

        $statusOptions = JobStatusHistory::query()
            ->select('new_status')
            ->distinct()
            ->orderBy('new_status')
            ->pluck('new_status')
            ->values();

        $jobQueues = JobQueue::query()
            ->with('jobable')
            ->latest('id')
            ->limit(100)
            ->get()
            ->map(fn (JobQueue $q) => [
                'id' => $q->id,
                'label' => ($q->jobable?->job_number ?? $q->jobable?->job_no ?? ('Queue #'.$q->id)).' ('.$q->status.')',
            ])
            ->values();

        return Inertia::render('History/JobStatusHistories/Index', [
            'histories' => $histories,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'statusOptions' => $statusOptions,
            'jobQueues' => $jobQueues,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'job_queue_id' => ['required', 'exists:job_queues,id'],
            'old_status' => ['nullable', 'string', 'max:50'],
            'new_status' => ['required', 'string', 'max:50'],
            'remarks' => ['nullable', 'string'],
            'changed_at' => ['nullable', 'date'],
        ]);

        JobStatusHistory::query()->create([
            'job_queue_id' => $validated['job_queue_id'],
            'old_status' => $validated['old_status'] ?? null,
            'new_status' => $validated['new_status'],
            'remarks' => $validated['remarks'] ?? null,
            'changed_by' => $request->user()?->id,
            'changed_at' => $validated['changed_at'] ?? now(),
        ]);

        return redirect()->route('job-status-histories.index')->with('success', 'Status history added successfully.');
    }
}
