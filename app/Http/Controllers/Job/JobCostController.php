<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Cost;
use App\Models\Export;
use App\Models\Import;
use App\Models\Swing;
use App\Support\JobLineCustomerResolver;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class JobCostController extends Controller
{
    private const JOBABLE_TYPES = [
        Import::class,
        Export::class,
        Cart::class,
        Swing::class,
    ];

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatedPayload($request, true);

        $customerId = JobLineCustomerResolver::forJobable($validated['jobable_type'], (int) $validated['jobable_id']);

        Cost::query()->create([
            'jobable_type' => $validated['jobable_type'],
            'jobable_id' => $validated['jobable_id'],
            'charge_type_id' => $validated['charge_type_id'],
            'type' => $validated['type'] ?? null,
            'charge' => $validated['charge'],
            'comments' => $validated['comments'] ?? null,
            'customer_id' => $customerId,
            'charged_by_user_id' => $request->user()->id,
        ]);

        return back()->with('success', 'Cost added successfully.');
    }

    public function update(Request $request, Cost $cost): RedirectResponse
    {
        $validated = $this->validatedPayload($request, false);

        $customerId = JobLineCustomerResolver::forJobable($cost->jobable_type, (int) $cost->jobable_id);

        $cost->update([
            'charge_type_id' => $validated['charge_type_id'],
            'type' => $validated['type'] ?? null,
            'charge' => $validated['charge'],
            'comments' => $validated['comments'] ?? null,
            'customer_id' => $customerId,
        ]);

        return back()->with('success', 'Cost updated successfully.');
    }

    public function destroy(Cost $cost): RedirectResponse
    {
        $cost->delete();

        return back()->with('success', 'Cost deleted successfully.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedPayload(Request $request, bool $includeJobable): array
    {
        $rules = [
            'charge_type_id' => ['required', 'integer', 'exists:charge_types,id'],
            'type' => ['nullable', 'string', 'max:255'],
            'charge' => ['required', 'numeric', 'min:0'],
            'comments' => ['nullable', 'string'],
        ];

        if ($includeJobable) {
            $rules['jobable_type'] = ['required', 'string', Rule::in(self::JOBABLE_TYPES)];
            $rules['jobable_id'] = ['required', 'integer'];
        }

        $validated = $request->validate($rules);

        if ($includeJobable) {
            $class = $validated['jobable_type'];
            if (! $class::query()->whereKey($validated['jobable_id'])->exists()) {
                abort(404);
            }
        }

        return $validated;
    }
}
