<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Export;
use App\Models\Import;
use App\Models\JobNote;
use App\Models\Swing;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class JobQueueJobNoteController extends Controller
{
    private const JOBABLE_TYPES = [
        Import::class,
        Export::class,
        Cart::class,
        Swing::class,
    ];

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'jobable_type' => ['required', 'string', Rule::in(self::JOBABLE_TYPES)],
            'jobable_id' => ['required', 'integer'],
            'endorsement_id' => ['required', 'integer', 'exists:endorsements,id'],
            'note' => ['nullable', 'string', 'max:10000'],
        ]);

        $class = $validated['jobable_type'];
        if (! $class::query()->whereKey($validated['jobable_id'])->exists()) {
            abort(404);
        }

        JobNote::query()->create([
            'jobable_type' => $validated['jobable_type'],
            'jobable_id' => $validated['jobable_id'],
            'endorsement_id' => $validated['endorsement_id'],
            'note' => $validated['note'] ?? null,
        ]);

        return back()->with('success', 'Note added successfully.');
    }

    public function update(Request $request, JobNote $jobNote): RedirectResponse
    {
        $validated = $request->validate([
            'endorsement_id' => ['required', 'integer', 'exists:endorsements,id'],
            'note' => ['nullable', 'string', 'max:10000'],
        ]);

        $jobNote->update([
            'endorsement_id' => $validated['endorsement_id'],
            'note' => $validated['note'] ?? null,
        ]);

        return back()->with('success', 'Note updated successfully.');
    }

    public function destroy(JobNote $jobNote): RedirectResponse
    {
        $jobNote->delete();

        return back()->with('success', 'Note deleted successfully.');
    }
}
