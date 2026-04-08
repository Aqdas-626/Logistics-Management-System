<?php

namespace App\Http\Controllers\Container;

use App\Http\Controllers\Controller;
use App\Models\JobNote;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobNoteController extends Controller
{
    public function index(Request $request)
    {
        $query = JobNote::query()->with('endorsement:id,name')->latest();

        if ($request->search) {
            $query->where(function ($builder) use ($request) {
                $builder->where('jobable_type', 'like', "%{$request->search}%")
                    ->orWhere('endorsement_id', 'like', "%{$request->search}%");
            });
        }

        $jobNotes = $query->paginate(10)->withQueryString();

        return Inertia::render('Container/JobNotes/Index', [
            'jobNotes' => $jobNotes,
            'filters' => $request->only(['search']),
        ]);
    }
}
