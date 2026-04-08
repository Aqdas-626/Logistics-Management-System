<?php

namespace App\Http\Controllers\Job;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Country;
use App\Models\Customer;
use App\Models\CustomerAddress;
use App\Models\Branch;
use App\Models\DgSignatory;
use App\Models\DgType;
use App\Models\JobAdditionalInformation;
use App\Models\JobBooking;
use App\Models\JobPackage;
use App\Models\JobTrackingNotification;
use App\Models\NotificationType;
use App\Models\PackageType;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class JobBookingController extends Controller
{
    /**
     * Display a listing of job bookings.
     */
    public function index(Request $request)
    {
        $query = JobBooking::with(['company', 'customer', 'branch']);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('booking_id', 'like', "%{$request->search}%")
                    ->orWhere('job_number', 'like', "%{$request->search}%")
                    ->orWhere('customer_reference', 'like', "%{$request->search}%")
                    ->orWhereHas('customer', fn($q) => $q->where('name', 'like', "%{$request->search}%")
                        ->orWhere('customer_code', 'like', "%{$request->search}%"));
            });
        }

        $jobBookings = $query->latest()->paginate(10);

        return Inertia::render('Job/JobBookings/Index', [
            'jobBookings' => $jobBookings,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for creating a new job booking.
     */
    public function create()
    {
        return Inertia::render('Job/JobBookings/Create', [
            'companies' => Company::active()->with('country')->get(),
            'countries' => Country::active()->get(),
            'packageTypes' => PackageType::all(),
            'dgTypes' => DgType::active()->get(),
            'notificationTypes' => NotificationType::all(),
            'dgSignatories' => DgSignatory::all(),
            'services' => Service::where('status', 'active')->get(),
        ]);
    }

    /**
     * Store a newly created job booking.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'branch_id' => 'nullable|exists:branches,id',
            'customer_id' => 'required|exists:customers,id',
            'sender_customer_id' => 'required|exists:customers,id',
            'receiver_customer_id' => 'required|exists:customers,id',
            'booking_id' => 'required|string|max:80',
            'job_type' => 'required|in:general,import,cart,export,swing',
            'customer_reference' => 'nullable|string',
            'receiver_reference' => 'nullable|string',
            'freight_ready_by' => 'nullable|date',
            'signature_required' => 'boolean',
            'sender' => 'nullable|array',
            'receiver' => 'nullable|array',
            'receiver.additional_services' => 'nullable|array',
            'receiver.additional_services.*' => 'exists:services,id',
            'packages' => 'required|array|min:1',
            'packages.*.units' => 'required|integer|min:1',
            'packages.*.weight_kg' => 'required|numeric|min:0',
            'packages.*.length_cm' => 'nullable|numeric|min:0',
            'packages.*.width_cm' => 'nullable|numeric|min:0',
            'packages.*.height_cm' => 'nullable|numeric|min:0',
            'packages.*.cubic_m3' => 'nullable|numeric|min:0',
            'packages.*.package_type_id' => 'required|exists:package_types,id',
            'packages.*.dg_type_id' => 'nullable|exists:dg_types,id',
            'packages.*.remarks' => 'nullable|string',
            'tracking_notifications' => 'nullable|array',
            'tracking_notifications.*.communication_type' => 'nullable|in:EMAIL,PHONE,SMS,WHATSAPP,PUSH',
            'tracking_notifications.*.contact_value' => 'nullable|string',
            'tracking_notifications.*.enabled' => 'nullable|boolean',
            'tracking_notifications.*.notification_type_id' => 'nullable|exists:notification_types,id',
            'additional_information' => 'nullable|array',
            'additional_information.insurance_type' => 'nullable|in:Owners Risk,Carriers Risk,All Risk,Total Loss Only,Third Party,Limited Carrier Liability',
            'additional_information.dg_signatory_id' => 'nullable|exists:dg_signatories,id',
        ]);

        // Check unique booking_id
        $exists = JobBooking::where('company_id', $validated['company_id'])
            ->where('branch_id', $validated['branch_id'] ?? null)
            ->where('booking_id', $validated['booking_id'])
            ->exists();

        if ($exists) {
            return back()->withErrors(['booking_id' => 'This booking ID already exists for this company and branch.']);
        }

        DB::beginTransaction();
        try {
            $senderCustomerId = (int) $validated['sender_customer_id'];
            $receiverCustomerId = (int) $validated['receiver_customer_id'];

            // Persist sender/receiver address form data into customer_addresses table.
            $this->syncCustomerAddressFromPayload($senderCustomerId, $validated['sender'] ?? []);
            $this->syncCustomerAddressFromPayload($receiverCustomerId, $validated['receiver'] ?? []);

            $booking = JobBooking::create([
                'company_id' => $validated['company_id'],
                'branch_id' => $validated['branch_id'] ?? null,
                'customer_id' => $validated['customer_id'],
                'sender_customer_id' => $validated['sender_customer_id'],
                'receiver_customer_id' => $validated['receiver_customer_id'],
                'booking_id' => $validated['booking_id'],
                'job_type' => $validated['job_type'],
                'customer_reference' => $validated['customer_reference'] ?? null,
                'receiver_reference' => $validated['receiver_reference'] ?? null,
                'freight_ready_by' => $validated['freight_ready_by'] ?? null,
                'signature_required' => $validated['signature_required'] ?? false,
            ]);

            // Additional services
            if (!empty($validated['receiver']['additional_services'])) {
                $booking->services()->sync($validated['receiver']['additional_services']);
            }

            // Packages
            foreach ($validated['packages'] as $index => $pkg) {
                $cubic = $pkg['cubic_m3'] ?? null;
                if (empty($cubic) && !empty($pkg['length_cm']) && !empty($pkg['width_cm']) && !empty($pkg['height_cm'])) {
                    $cubic = ($pkg['length_cm'] * $pkg['width_cm'] * $pkg['height_cm']) / 1000000 * ($pkg['units'] ?? 1);
                }
                JobPackage::create([
                    'booking_id' => $booking->id,
                    'package_name' => 'Package ' . ($index + 1),
                    'units' => $pkg['units'],
                    'weight_kg' => $pkg['weight_kg'],
                    'length_cm' => $pkg['length_cm'] ?? null,
                    'width_cm' => $pkg['width_cm'] ?? null,
                    'height_cm' => $pkg['height_cm'] ?? null,
                    'cubic_m3' => $cubic,
                    'package_type_id' => $pkg['package_type_id'],
                    'dg_type_id' => $pkg['dg_type_id'] ?? null,
                    'remarks' => $pkg['remarks'] ?? null,
                ]);
            }

            // Tracking notifications
            $trackingNotifications = collect($validated['tracking_notifications'] ?? [])
                ->filter(fn ($tn) => !empty($tn['notification_type_id']))
                ->values();

            if ($trackingNotifications->isNotEmpty()) {
                foreach ($trackingNotifications as $tn) {
                    JobTrackingNotification::create([
                        'job_booking_id' => $booking->id,
                        'notification_type_id' => $tn['notification_type_id'],
                        'communication_type' => $tn['communication_type'] ?? 'EMAIL',
                        'contact_value' => $tn['contact_value'] ?? null,
                        'enabled' => (bool)($tn['enabled'] ?? true),
                    ]);
                }
            }

            // Additional information
            $addInfo = $validated['additional_information'] ?? [];
            JobAdditionalInformation::create([
                'booking_id' => $booking->id,
                'dg_signatory_id' => !empty($addInfo['dg_signatory_id']) ? $addInfo['dg_signatory_id'] : null,
                'insurance_type' => $addInfo['insurance_type'] ?? 'Owners Risk',
            ]);

            DB::commit();

            return redirect()->route('job-bookings.index')
                ->with('success', 'Job booking created successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create job booking: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(JobBooking $jobBooking)
    {
        // Eager load core relations
        $jobBooking->load([
            'company',
            'branch',
            'customer.country',
            'customer.address',
            'customer.contacts',
            'senderCustomer.country',
            'senderCustomer.address',
            'senderCustomer.contacts',
            'receiverCustomer.country',
            'receiverCustomer.address',
            'receiverCustomer.contacts',
            'packages.packageType',
            'packages.dgType',
            'services',
        ]);

        // Resolve branch relation robustly for legacy/inconsistent records:
        // - normal case: branch_id stores branches.id
        // - fallback case: old data may store branch code/name in branch_id
        if (!$jobBooking->branch && !empty($jobBooking->branch_id)) {
            $branch = Branch::withTrashed()->find($jobBooking->branch_id);

            if (!$branch) {
                $branch = Branch::withTrashed()
                    ->where('code', $jobBooking->branch_id)
                    ->orWhere('name', $jobBooking->branch_id)
                    ->first();
            }

            if ($branch) {
                $jobBooking->setRelation('branch', $branch);
            }
        }

        // Tracking Notifications & Additional Information:
        // Some deployments store the FK against either the numeric `job_bookings.id`
        // or the string `job_bookings.booking_id`. Fetch with fallback to support both.
        $jobTrackingNotifications = JobTrackingNotification::with([
            'notificationType',
            'jobBooking',
            'jobBookingByBookingId',
        ])
            ->where(function ($q) use ($jobBooking) {
                $q->where('job_booking_id', $jobBooking->id)
                    ->orWhere('job_booking_id', $jobBooking->booking_id);
            })
            ->get();

        $jobBooking->setRelation('trackingNotifications', $jobTrackingNotifications);

        $jobAdditionalInformation = JobAdditionalInformation::with('dgSignatory')
            ->where(function ($q) use ($jobBooking) {
                $q->where('booking_id', $jobBooking->id)
                    ->orWhere('booking_id', $jobBooking->booking_id);
            })
            ->first();

        $jobBooking->setRelation('additionalInformation', $jobAdditionalInformation);

        return Inertia::render('Job/JobBookings/Show', [
            'jobBooking' => $jobBooking,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(JobBooking $jobBooking)
    {
        $jobBooking->load([
            'company',
            'branch',
            'customer',
            'senderCustomer.country',
            'senderCustomer.address',
            'senderCustomer.contacts',
            'receiverCustomer.country',
            'receiverCustomer.address',
            'receiverCustomer.contacts',
            'packages',
            'trackingNotifications',
            'additionalInformation',
            'services',
        ]);

        return Inertia::render('Job/JobBookings/Edit', [
            'jobBooking' => $jobBooking,
            'companies' => Company::active()->with('country')->get(),
            'countries' => Country::active()->get(),
            'packageTypes' => PackageType::all(),
            'dgTypes' => DgType::active()->get(),
            'notificationTypes' => NotificationType::all(),
            'dgSignatories' => DgSignatory::all(),
            'services' => Service::where('status', 'active')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, JobBooking $jobBooking)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'branch_id' => 'nullable|exists:branches,id',
            'customer_id' => 'required|exists:customers,id',
            'sender_customer_id' => 'required|exists:customers,id',
            'receiver_customer_id' => 'required|exists:customers,id',
            'booking_id' => 'required|string|max:80',
            'job_type' => 'required|in:general,import,cart,export,swing',
            'customer_reference' => 'nullable|string',
            'receiver_reference' => 'nullable|string',
            'freight_ready_by' => 'nullable|date',
            'signature_required' => 'boolean',
            'sender' => 'nullable|array',
            'receiver' => 'nullable|array',
            'receiver.additional_services' => 'nullable|array',
            'receiver.additional_services.*' => 'exists:services,id',
            'packages' => 'required|array|min:1',
            'packages.*.units' => 'required|integer|min:1',
            'packages.*.weight_kg' => 'required|numeric|min:0',
            'packages.*.length_cm' => 'nullable|numeric|min:0',
            'packages.*.width_cm' => 'nullable|numeric|min:0',
            'packages.*.height_cm' => 'nullable|numeric|min:0',
            'packages.*.cubic_m3' => 'nullable|numeric|min:0',
            'packages.*.package_type_id' => 'required|exists:package_types,id',
            'packages.*.dg_type_id' => 'nullable|exists:dg_types,id',
            'packages.*.remarks' => 'nullable|string',
            'tracking_notifications' => 'nullable|array',
            'tracking_notifications.*.communication_type' => 'nullable|in:EMAIL,PHONE,SMS,WHATSAPP,PUSH',
            'tracking_notifications.*.contact_value' => 'nullable|string',
            'tracking_notifications.*.enabled' => 'nullable|boolean',
            'tracking_notifications.*.notification_type_id' => 'nullable|exists:notification_types,id',
            'additional_information' => 'nullable|array',
            'additional_information.insurance_type' => 'nullable|in:Owners Risk,Carriers Risk,All Risk,Total Loss Only,Third Party,Limited Carrier Liability',
            'additional_information.dg_signatory_id' => 'nullable|exists:dg_signatories,id',
        ]);

        // Check unique booking_id (exclude current record)
        $exists = JobBooking::where('company_id', $validated['company_id'])
            ->where('branch_id', $validated['branch_id'] ?? null)
            ->where('booking_id', $validated['booking_id'])
            ->where('id', '!=', $jobBooking->id)
            ->exists();

        if ($exists) {
            return back()->withErrors(['booking_id' => 'This booking ID already exists for this company and branch.']);
        }

        DB::beginTransaction();
        try {
            $senderCustomerId = (int) $validated['sender_customer_id'];
            $receiverCustomerId = (int) $validated['receiver_customer_id'];

            // Persist sender/receiver address form data into customer_addresses table.
            $this->syncCustomerAddressFromPayload($senderCustomerId, $validated['sender'] ?? []);
            $this->syncCustomerAddressFromPayload($receiverCustomerId, $validated['receiver'] ?? []);

            $jobBooking->update([
                'company_id' => $validated['company_id'],
                'branch_id' => $validated['branch_id'] ?? null,
                'customer_id' => $validated['customer_id'],
                'sender_customer_id' => $validated['sender_customer_id'],
                'receiver_customer_id' => $validated['receiver_customer_id'],
                'booking_id' => $validated['booking_id'],
                'job_type' => $validated['job_type'],
                'customer_reference' => $validated['customer_reference'] ?? null,
                'receiver_reference' => $validated['receiver_reference'] ?? null,
                'freight_ready_by' => $validated['freight_ready_by'] ?? null,
                'signature_required' => $validated['signature_required'] ?? false,
            ]);

            // Replace related records (simple + reliable)
            $jobBooking->services()->sync($validated['receiver']['additional_services'] ?? []);
            $jobBooking->packages()->delete();
            $jobBooking->trackingNotifications()->delete();
            $jobBooking->additionalInformation()->delete();

            // Packages
            foreach ($validated['packages'] as $index => $pkg) {
                $cubic = $pkg['cubic_m3'] ?? null;
                if (empty($cubic) && !empty($pkg['length_cm']) && !empty($pkg['width_cm']) && !empty($pkg['height_cm'])) {
                    $cubic = ($pkg['length_cm'] * $pkg['width_cm'] * $pkg['height_cm']) / 1000000 * ($pkg['units'] ?? 1);
                }
                JobPackage::create([
                    'booking_id' => $jobBooking->id,
                    'package_name' => 'Package ' . ($index + 1),
                    'units' => $pkg['units'],
                    'weight_kg' => $pkg['weight_kg'],
                    'length_cm' => $pkg['length_cm'] ?? null,
                    'width_cm' => $pkg['width_cm'] ?? null,
                    'height_cm' => $pkg['height_cm'] ?? null,
                    'cubic_m3' => $cubic,
                    'package_type_id' => $pkg['package_type_id'],
                    'dg_type_id' => $pkg['dg_type_id'] ?? null,
                    'remarks' => $pkg['remarks'] ?? null,
                ]);
            }

            // Tracking notifications
            $trackingNotifications = collect($validated['tracking_notifications'] ?? [])
                ->filter(fn ($tn) => !empty($tn['notification_type_id']))
                ->values();

            if ($trackingNotifications->isNotEmpty()) {
                foreach ($trackingNotifications as $tn) {
                    JobTrackingNotification::create([
                        'job_booking_id' => $jobBooking->id,
                        'notification_type_id' => $tn['notification_type_id'],
                        'communication_type' => $tn['communication_type'] ?? 'EMAIL',
                        'contact_value' => $tn['contact_value'] ?? null,
                        'enabled' => (bool)($tn['enabled'] ?? true),
                    ]);
                }
            }

            // Additional information
            $addInfo = $validated['additional_information'] ?? [];
            JobAdditionalInformation::create([
                'booking_id' => $jobBooking->id,
                'dg_signatory_id' => !empty($addInfo['dg_signatory_id']) ? $addInfo['dg_signatory_id'] : null,
                'insurance_type' => $addInfo['insurance_type'] ?? 'Owners Risk',
            ]);

            DB::commit();

            return redirect()->route('job-bookings.index')
                ->with('success', 'Job booking updated successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to update job booking: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JobBooking $jobBooking)
    {
        DB::beginTransaction();
        try {
            $jobBooking->services()->detach();
            $jobBooking->trackingNotifications()->delete();
            $jobBooking->packages()->delete();
            $jobBooking->additionalInformation()->delete();
            $jobBooking->delete();

            DB::commit();

            return redirect()->route('job-bookings.index')
                ->with('success', 'Job booking deleted successfully');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to delete job booking: ' . $e->getMessage()]);
        }
    }

    /**
     * Get customers for a company (for dynamic dropdown).
     */
    public function getCustomers(Request $request)
    {
        $companyId = $request->company_id;
        if (!$companyId) {
            return response()->json([]);
        }

        return Customer::where('company_id', $companyId)
            ->with([
                'address',
                'contacts' => function ($q) {
                    // Primary contact first (if exists)
                    $q->orderByDesc('is_primary');
                },
            ])
            ->get([
                'id',
                'customer_code',
                'name',
                'country_id',
                'is_consignor',
                'is_consignee',
            ]);
    }

    /**
     * Get branches for a company.
     */
    public function getBranches(Request $request)
    {
        $companyId = $request->company_id;
        if (!$companyId) {
            return response()->json([]);
        }
        return Branch::where('company_id', $companyId)->active()
            ->get(['id', 'name', 'code']);
    }

    private function syncCustomerAddressFromPayload(?int $customerId, array $payload): void
    {
        if (!$customerId || empty($payload)) {
            return;
        }

        $addressData = [
            'building' => $payload['building'] ?? null,
            'street_no' => $payload['street_no'] ?? null,
            'street' => $payload['street'] ?? null,
            'suburb' => $payload['suburb'] ?? null,
            'city' => $payload['city'] ?? null,
            'state' => $payload['state'] ?? null,
            'postcode' => $payload['postcode'] ?? null,
            'contact_person' => $payload['contact_person'] ?? null,
            'instructions' => $payload['instructions'] ?? null,
        ];

        $hasAnyAddressValue = false;
        foreach ($addressData as $value) {
            if ($value !== null && $value !== '') {
                $hasAnyAddressValue = true;
                break;
            }
        }

        if (!$hasAnyAddressValue) {
            return;
        }

        CustomerAddress::updateOrCreate(
            ['customer_id' => $customerId],
            $addressData
        );
    }
}
