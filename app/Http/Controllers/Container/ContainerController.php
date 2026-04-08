<?php

namespace App\Http\Controllers\Container;

use App\Http\Controllers\Controller;
use App\Models\Container;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContainerController extends Controller
{
    public function index(Request $request)
    {
        $query = Container::query()->latest();

        if ($request->search) {
            $query->where(function ($builder) use ($request) {
                $builder->where('container_number', 'like', "%{$request->search}%")
                    ->orWhere('reference', 'like', "%{$request->search}%")
                    ->orWhere('job_type', 'like', "%{$request->search}%");
            });
        }

        $containers = $query->paginate(10)->withQueryString();

        return Inertia::render('Container/Index', [
            'containers' => $containers,
            'filters' => $request->only(['search']),
        ]);
    }
}
