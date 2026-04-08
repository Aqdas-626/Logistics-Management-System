<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Company;
use App\Models\Country;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Inertia\Inertia;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Customer::with(['company', 'address', 'contacts', 'billingProfile']);
        
        // Search by name or customer code
        if ($request->search) {
            $query->where('name', 'like', "%{$request->search}%")
                  ->orWhere('customer_code', 'like', "%{$request->search}%");
        }

        // Filter by status
        if ($request->status) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->type) {
            $query->where('type', $request->type);
        }

        $customers = $query->paginate(10);
        $companies = Company::active()->get(['id', 'name']);
        $countries = Country::all(['id', 'name']);

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'companies' => $companies,
            'countries' => $countries,
            'filters' => $request->only(['search', 'status', 'type']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $companies = Company::active()->get(['id', 'name']);
        $countries = Country::all(['id', 'name']);
        
        return Inertia::render('Customers/Create', [
            'companies' => $companies,
            'countries' => $countries,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'country_id' => 'required|exists:countries,id',
            'customer_code' => 'required|string|max:50|unique:customers,customer_code',
            'name' => 'required|string|max:255',
            'type' => 'required|in:business,individual',
            'status' => 'required|in:active,inactive,blocked',
            'notes' => 'nullable|string',
            'is_consignor' => 'boolean',
            'is_consignee' => 'boolean',
            // Address (1 per customer)
            'address' => 'nullable|array',
            'address.building' => 'nullable|string|max:255',
            'address.street_no' => 'nullable|string|max:255',
            'address.street' => 'nullable|string|max:255',
            'address.suburb' => 'nullable|string|max:255',
            'address.city' => 'nullable|string|max:100',
            'address.state' => 'nullable|string|max:100',
            'address.postcode' => 'nullable|string|max:20',
            'address.contact_person' => 'nullable|string|max:255',
            'address.instructions' => 'nullable|string',
            // Contacts
            'contacts' => 'nullable|array',
            'contacts.*.name' => 'required_with:contacts.*|string|max:255',
            'contacts.*.email' => 'nullable|email|max:255',
            'contacts.*.phone' => 'nullable|string|max:20',
            'contacts.*.mobile' => 'nullable|string|max:20',
            'contacts.*.designation' => 'nullable|string|max:100',
            'contacts.*.is_primary' => 'nullable|boolean',
            // Contact Notes
            'contact_notes' => 'nullable|array',
            'contact_notes.*.note' => 'required_with:contact_notes.*|string',
            'contact_notes.*.interaction_type' => 'nullable|in:call,meeting,email,other',
            'contact_notes.*.interaction_date' => 'nullable|date',
            // Documents
            'documents' => 'nullable|array',
            'documents.*.title' => 'required_with:documents.*|string|max:255',
            'documents.*.file_path' => 'nullable|string',
            'documents.*.file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,gif,bmp,webp,svg|max:10240',
            'documents.*.file_type' => 'nullable|in:pdf,image,word',
            // Billing
            'billing' => 'nullable|array',
            'billing.billing_name' => 'nullable|string|max:255',
            'billing.ntn' => 'nullable|string|max:50',
            'billing.tax_number' => 'nullable|string|max:50',
            'billing.payment_terms' => 'nullable|string|max:100',
            'billing.credit_limit' => 'nullable|numeric|min:0',
        ]);

        try {
            // Create customer
            $customer = Customer::create([
                'company_id' => $validated['company_id'],
                'country_id' => $validated['country_id'],
                'customer_code' => $validated['customer_code'],
                'name' => $validated['name'],
                'type' => $validated['type'],
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
                'is_consignor' => $validated['is_consignor'] ?? false,
                'is_consignee' => $validated['is_consignee'] ?? false,
            ]);

            // Create address (1 per customer)
            $address = $validated['address'] ?? null;
            if ($this->hasAnyAddressData($address)) {
                $customer->address()->create([
                    'building' => $address['building'] ?? null,
                    'street_no' => $address['street_no'] ?? null,
                    'street' => $address['street'] ?? null,
                    'suburb' => $address['suburb'] ?? null,
                    'city' => $address['city'] ?? null,
                    'state' => $address['state'] ?? null,
                    'postcode' => $address['postcode'] ?? null,
                    'contact_person' => $address['contact_person'] ?? null,
                    'instructions' => $address['instructions'] ?? null,
                ]);
            }

            // Create contacts
            if (!empty($validated['contacts'])) {
                foreach ($validated['contacts'] as $contact) {
                    if (!empty($contact['name'])) {
                        $customer->contacts()->create([
                            'name' => $contact['name'],
                            'email' => $contact['email'] ?? null,
                            'phone' => $contact['phone'] ?? null,
                            'mobile' => $contact['mobile'] ?? null,
                            'designation' => $contact['designation'] ?? null,
                            'is_primary' => $contact['is_primary'] ?? false,
                        ]);
                    }
                }
            }

            // Create contact notes
            if (!empty($validated['contact_notes'])) {
                foreach ($validated['contact_notes'] as $note) {
                    if (!empty($note['note'])) {
                        $customer->contactNotes()->create([
                            'note' => $note['note'],
                            'interaction_type' => $note['interaction_type'] ?? null,
                            'interaction_date' => $note['interaction_date'] ?? now(),
                        ]);
                    }
                }
            }

            // Create documents
            if (!empty($validated['documents'])) {
                foreach ($validated['documents'] as $document) {
                    if (!empty($document['title'])) {
                        $storedPath = null;
                        if (!empty($document['file']) && $document['file'] instanceof UploadedFile) {
                            $storedPath = $document['file']->store('customer-documents', 'public');
                        }

                        $customer->documents()->create([
                            'title' => $document['title'],
                            'file_path' => $storedPath ?? (!empty($document['file_path']) ? $document['file_path'] : null),
                            'file_type' => $document['file_type'] ?? $this->guessDocumentType($document['file'] ?? null),
                        ]);
                    }
                }
            }

            // Create billing profile
            if (!empty($validated['billing'])) {
                $customer->billingProfile()->create([
                    'billing_name' => $validated['billing']['billing_name'] ?? null,
                    'ntn' => $validated['billing']['ntn'] ?? null,
                    'tax_number' => $validated['billing']['tax_number'] ?? null,
                    'payment_terms' => $validated['billing']['payment_terms'] ?? null,
                    'credit_limit' => $validated['billing']['credit_limit'] ?? 0,
                ]);
            }

            return redirect()->route('customers.index')
                            ->with('success', 'Customer created successfully with all details');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to create customer: ' . $e->getMessage()]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer)
    {
        $customer->load(['company', 'address', 'contacts', 'documents', 'billingProfile', 'contactNotes']);

        // Provide a correct public URL for each document (respects disk/url config).
        $customer->documents->each(function ($doc) {
            $doc->setAttribute(
                'public_url',
                $doc->file_path ? asset('storage/' . ltrim($doc->file_path, '/')) : null
            );
        });

        return Inertia::render('Customers/Show', [
            'customer' => $customer,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Customer $customer)
    {
        $customer->load(['address', 'contacts', 'contactNotes', 'documents', 'billingProfile']);
        $companies = Company::active()->get(['id', 'name']);
        $countries = Country::all(['id', 'name']);

        return Inertia::render('Customers/Edit', [
            'customer' => $customer,
            'companies' => $companies,
            'countries' => $countries,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'country_id' => 'required|exists:countries,id',
            'customer_code' => 'required|string|max:50|unique:customers,customer_code,' . $customer->id,
            'name' => 'required|string|max:255',
            'type' => 'required|in:business,individual',
            'status' => 'required|in:active,inactive,blocked',
            'notes' => 'nullable|string',
            'is_consignor' => 'boolean',
            'is_consignee' => 'boolean',
            // Address (1 per customer)
            'address' => 'nullable|array',
            'address.building' => 'nullable|string|max:255',
            'address.street_no' => 'nullable|string|max:255',
            'address.street' => 'nullable|string|max:255',
            'address.suburb' => 'nullable|string|max:255',
            'address.city' => 'nullable|string|max:100',
            'address.state' => 'nullable|string|max:100',
            'address.postcode' => 'nullable|string|max:20',
            'address.contact_person' => 'nullable|string|max:255',
            'address.instructions' => 'nullable|string',
            // Contacts
            'contacts' => 'nullable|array',
            'contacts.*.id' => 'nullable|exists:customer_contacts,id',
            'contacts.*.name' => 'required_with:contacts.*|string|max:255',
            'contacts.*.email' => 'nullable|email|max:255',
            'contacts.*.phone' => 'nullable|string|max:20',
            'contacts.*.mobile' => 'nullable|string|max:20',
            'contacts.*.designation' => 'nullable|string|max:100',
            'contacts.*.is_primary' => 'nullable|boolean',
            // Contact Notes
            'contact_notes' => 'nullable|array',
            'contact_notes.*.id' => 'nullable|exists:contact_notes,id',
            'contact_notes.*.note' => 'required_with:contact_notes.*|string',
            'contact_notes.*.interaction_type' => 'nullable|in:call,meeting,email,other',
            'contact_notes.*.interaction_date' => 'nullable|date',
            // Documents
            'documents' => 'nullable|array',
            'documents.*.id' => 'nullable|exists:customer_documents,id',
            'documents.*.title' => 'required_with:documents.*|string|max:255',
            'documents.*.file_path' => 'nullable|string',
            'documents.*.file' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,gif,bmp,webp,svg|max:10240',
            'documents.*.file_type' => 'nullable|in:pdf,image,word',
            // Billing
            'billing' => 'nullable|array',
            'billing.billing_name' => 'nullable|string|max:255',
            'billing.ntn' => 'nullable|string|max:50',
            'billing.tax_number' => 'nullable|string|max:50',
            'billing.payment_terms' => 'nullable|string|max:100',
            'billing.credit_limit' => 'nullable|numeric|min:0',
        ]);

        try {
            // Update customer
            $customer->update([
                'company_id' => $validated['company_id'],
                'country_id' => $validated['country_id'],
                'customer_code' => $validated['customer_code'],
                'name' => $validated['name'],
                'type' => $validated['type'],
                'status' => $validated['status'],
                'notes' => $validated['notes'] ?? null,
                'is_consignor' => $validated['is_consignor'] ?? false,
                'is_consignee' => $validated['is_consignee'] ?? false,
            ]);

            // Update address (1 per customer)
            $address = $validated['address'] ?? null;
            if ($this->hasAnyAddressData($address)) {
                $addressPayload = [
                    'building' => $address['building'] ?? null,
                    'street_no' => $address['street_no'] ?? null,
                    'street' => $address['street'] ?? null,
                    'suburb' => $address['suburb'] ?? null,
                    'city' => $address['city'] ?? null,
                    'state' => $address['state'] ?? null,
                    'postcode' => $address['postcode'] ?? null,
                    'contact_person' => $address['contact_person'] ?? null,
                    'instructions' => $address['instructions'] ?? null,
                ];

                if ($customer->address) {
                    $customer->address()->update($addressPayload);
                } else {
                    $customer->address()->create($addressPayload);
                }
            } else {
                $customer->address()->delete();
            }

            // Update contacts
            if (!empty($validated['contacts'])) {
                $contactIds = collect($validated['contacts'])->pluck('id')->filter();
                $customer->contacts()->whereNotIn('id', $contactIds)->delete();

                foreach ($validated['contacts'] as $contact) {
                    if (!empty($contact['name'])) {
                        if (isset($contact['id'])) {
                            $customer->contacts()->find($contact['id'])->update($contact);
                        } else {
                            $customer->contacts()->create($contact);
                        }
                    }
                }
            } else {
                $customer->contacts()->delete();
            }

            // Update contact notes
            if (!empty($validated['contact_notes'])) {
                $noteIds = collect($validated['contact_notes'])->pluck('id')->filter();
                $customer->contactNotes()->whereNotIn('id', $noteIds)->delete();

                foreach ($validated['contact_notes'] as $note) {
                    if (!empty($note['note'])) {
                        if (isset($note['id'])) {
                            $customer->contactNotes()->find($note['id'])->update($note);
                        } else {
                            $customer->contactNotes()->create($note);
                        }
                    }
                }
            } else {
                $customer->contactNotes()->delete();
            }

            // Update documents
            if (!empty($validated['documents'])) {
                $docIds = collect($validated['documents'])->pluck('id')->filter();
                $customer->documents()->whereNotIn('id', $docIds)->delete();

                foreach ($validated['documents'] as $document) {
                    if (!empty($document['title'])) {
                        if (isset($document['id'])) {
                            $existingDocument = $customer->documents()->find($document['id']);

                            if (!$existingDocument) {
                                continue;
                            }

                            $storedPath = $existingDocument->file_path;
                            if (!empty($document['file']) && $document['file'] instanceof UploadedFile) {
                                $storedPath = $document['file']->store('customer-documents', 'public');
                            }

                            $existingDocument->update([
                                'title' => $document['title'],
                                'file_path' => $storedPath,
                                'file_type' => $document['file_type'] ?? $this->guessDocumentType($document['file'] ?? null) ?? $existingDocument->file_type,
                            ]);
                        } else {
                            $storedPath = null;
                            if (!empty($document['file']) && $document['file'] instanceof UploadedFile) {
                                $storedPath = $document['file']->store('customer-documents', 'public');
                            }

                            $customer->documents()->create([
                                'title' => $document['title'],
                                'file_path' => $storedPath ?? (!empty($document['file_path']) ? $document['file_path'] : null),
                                'file_type' => $document['file_type'] ?? $this->guessDocumentType($document['file'] ?? null),
                            ]);
                        }
                    }
                }
            } else {
                $customer->documents()->delete();
            }

            // Update billing profile
            if (!empty($validated['billing'])) {
                if ($customer->billingProfile) {
                    $customer->billingProfile()->update($validated['billing']);
                } else {
                    $customer->billingProfile()->create($validated['billing']);
                }
            } else {
                $customer->billingProfile()->delete();
            }

            return redirect()->route('customers.index')
                            ->with('success', 'Customer updated successfully with all details');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to update customer: ' . $e->getMessage()]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer)
    {
        try {
            $customer->delete();
            return redirect()->route('customers.index')
                            ->with('success', 'Customer deleted successfully');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete customer: ' . $e->getMessage()]);
        }
    }

    private function hasAnyAddressData(?array $address): bool
    {
        if (!$address) {
            return false;
        }

        foreach ($address as $value) {
            if ($value !== null && $value !== '') {
                return true;
            }
        }

        return false;
    }

    private function guessDocumentType($file): ?string
    {
        if (!$file instanceof UploadedFile) {
            return null;
        }

        $ext = strtolower($file->getClientOriginalExtension());

        if ($ext === 'pdf') {
            return 'pdf';
        }

        if (in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'], true)) {
            return 'image';
        }

        if (in_array($ext, ['doc', 'docx'], true)) {
            return 'word';
        }

        return null;
    }
}
