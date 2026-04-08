<?php

namespace App\Http\Controllers\Container;

use App\Http\Controllers\Controller;
use App\Models\JobService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JobServiceController extends Controller
{
    public function index(Request $request)
    {
        $query = JobService::query()->with('service:id,name')->latest();

        if ($request->search) {
            $query->where(function ($builder) use ($request) {
                $builder->where('jobable_type', 'like', "%{$request->search}%")
                    ->orWhere('service_id', 'like', "%{$request->search}%");
            });
        }

        $jobServices = $query->paginate(10)->withQueryString();

        return Inertia::render('Container/JobServices/Index', [
            'jobServices' => $jobServices,
            'filters' => $request->only(['search']),
        ]);
    }
}
