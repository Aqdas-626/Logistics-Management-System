<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\JobQueue;
use App\Models\JobQueueHub;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class JobQueueHubController extends Controller
{
    public function store(Request $request, JobQueue $jobQueue): RedirectResponse
    {
        $validated = $request->validate([
            'location_id' => ['required', 'integer', Rule::exists('locations', 'id')],
            'is_charge_customer' => ['nullable', 'boolean'],
        ]);

        $nextSortOrder = ((int) $jobQueue->hubs()->max('sort_order')) + 1;

        JobQueueHub::updateOrCreate(
            [
                'job_queue_id' => $jobQueue->id,
                'location_id' => $validated['location_id'],
            ],
            [
                'is_charge_customer' => (bool) ($validated['is_charge_customer'] ?? false),
                'sort_order' => $nextSortOrder,
            ]
        );

        return redirect()->route('job-queues.index')->with('success', 'Hub added successfully.');
    }
}
