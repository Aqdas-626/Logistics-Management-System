<?php

namespace App\Http\Controllers\Job\Queue;

use App\Http\Controllers\Controller;
use App\Models\JobQueue;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class JobQueueDocumentController extends Controller
{
    public function store(Request $request, JobQueue $jobQueue): RedirectResponse
    {
        $validated = $request->validate([
            'files' => ['required', 'array', 'min:1'],
            'files.*' => [
                'file',
                'mimes:jpg,jpeg,png,gif,webp,bmp,tif,tiff,pdf,doc,docx',
                'max:10240',
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        foreach ($request->file('files', []) as $uploadedFile) {
            $storedPath = $uploadedFile->store("job-queue-documents/{$jobQueue->id}", 'public');

            $jobQueue->documents()->create([
                'file' => $storedPath,
                'original_name' => $uploadedFile->getClientOriginalName(),
                'mime_type' => $uploadedFile->getMimeType(),
                'file_size' => $uploadedFile->getSize(),
                'notes' => $validated['notes'] ?? null,
                'uploaded_by' => $request->user()?->id,
            ]);
        }

        return redirect()->route('job-queues.index')->with('success', 'Document(s) uploaded successfully.');
    }
}
