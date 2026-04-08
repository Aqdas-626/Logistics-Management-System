<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DriverDocumentController extends Controller
{
    public function index(Driver $driver): Response
    {
        return Inertia::render('Driver/Documents/Index', [
            'driver' => $driver->only(['id', 'name', 'driver_code']),
            'documents' => $driver->documents()->latest()->get(),
        ]);
    }

    public function store(Request $request, Driver $driver): RedirectResponse
    {
        $validated = $request->validate([
            'doc_type' => ['required', 'string', 'max:100'],
            'file' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx',
                'max:10240',
            ],
            'link' => ['nullable', 'url', 'max:500'],
        ]);

        $storedPath = $request->file('file')->store('driver-documents', 'public');

        $driver->documents()->create([
            'doc_type' => $validated['doc_type'],
            'file_path' => $storedPath,
            'link' => $validated['link'] ?? null,
        ]);

        return redirect()
            ->route('drivers.documents.index', $driver->id)
            ->with('success', 'Driver document added successfully.');
    }

    public function update(Request $request, Driver $driver, int $document): RedirectResponse
    {
        $document = $driver->documents()->findOrFail($document);

        $validated = $request->validate([
            'doc_type' => ['required', 'string', 'max:100'],
            'file' => ['nullable', 'file', 'mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx', 'max:10240'],
            'link' => ['nullable', 'url', 'max:500'],
        ]);

        $payload = [
            'doc_type' => $validated['doc_type'],
            'link' => $validated['link'] ?? null,
        ];

        if ($request->hasFile('file')) {
            if (!empty($document->file_path) && Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }

            $payload['file_path'] = $request->file('file')->store('driver-documents', 'public');
        }

        $document->update($payload);

        return redirect()
            ->route('drivers.documents.index', $driver->id)
            ->with('success', 'Driver document updated successfully.');
    }

    public function destroy(Driver $driver, int $document): RedirectResponse
    {
        $document = $driver->documents()->findOrFail($document);

        if (!empty($document->file_path) && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return redirect()
            ->route('drivers.documents.index', $driver->id)
            ->with('success', 'Driver document deleted successfully.');
    }
}

