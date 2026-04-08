<?php

namespace App\Http\Controllers\Container;

use App\Http\Controllers\Controller;
use App\Models\JobDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobDocumentController extends Controller
{
    public function index(Request $request)
    {
        $query = JobDocument::query()->latest();

        if ($request->search) {
            $query->where(function ($builder) use ($request) {
                $builder->where('job_type', 'like', "%{$request->search}%")
                    ->orWhere('file', 'like', "%{$request->search}%");
            });
        }

        $jobDocuments = $query->paginate(10)->withQueryString();

        return Inertia::render('Container/JobDocuments/Index', [
            'jobDocuments' => $jobDocuments,
            'filters' => $request->only(['search']),
        ]);
    }
}
