import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { PlusIcon } from '@/Components/Icons';

const emptyBilling = {
    billing_name: '',
    ntn: '',
    tax_number: '',
    payment_terms: '',
    credit_limit: '',
};

const detectFileType = (file) => {
    if (!file) return '';
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(ext)) return 'image';
    if (['doc', 'docx'].includes(ext)) return 'word';
    return '';
};

const asString = (value) => (value ?? '').toString();
const asBool = (value) => Boolean(value);
const toDateInputValue = (value) => {
    if (!value) return '';
    const raw = value.toString();
    return raw.includes('T') ? raw.split('T')[0] : raw;
};

const buildCustomerFormData = (data) => {
    const fd = new FormData();

    const append = (key, value) => {
        if (value === null || value === undefined) return;
        if (value instanceof File) {
            fd.append(key, value);
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((v, i) => append(`${key}[${i}]`, v));
            return;
        }
        if (typeof value === 'object') {
            Object.entries(value).forEach(([k, v]) => append(`${key}[${k}]`, v));
            return;
        }
        fd.append(key, value);
    };

    // Normalize booleans to 0/1 so Laravel boolean validation behaves consistently
    append('company_id', data.company_id);
    append('country_id', data.country_id);
    append('customer_code', data.customer_code);
    append('name', data.name);
    append('type', data.type);
    append('status', data.status);
    append('notes', data.notes);
    append('is_consignor', data.is_consignor ? '1' : '0');
    append('is_consignee', data.is_consignee ? '1' : '0');

    append('address', {
        building: data.address?.building || null,
        street_no: data.address?.street_no || null,
        street: data.address?.street || null,
        suburb: data.address?.suburb || null,
        city: data.address?.city || null,
        state: data.address?.state || null,
        postcode: data.address?.postcode || null,
        contact_person: data.address?.contact_person || null,
        instructions: data.address?.instructions || null,
    });

    append('contacts', (data.contacts || []).map((c) => ({
        ...c,
        email: c.email || null,
        phone: c.phone || null,
        mobile: c.mobile || null,
        designation: c.designation || null,
        is_primary: c.is_primary ? '1' : '0',
    })));

    append('contact_notes', (data.contact_notes || []).map((n) => ({
        ...n,
        note: n.note || null,
        interaction_type: n.interaction_type || null,
        interaction_date: n.interaction_date || null,
    })));

    append('documents', (data.documents || []).map((d) => ({
        ...d,
        file_path: d.file_path || null,
        file: d.file || null,
    })));

    append('billing', {
        billing_name: data.billing?.billing_name || null,
        ntn: data.billing?.ntn || null,
        tax_number: data.billing?.tax_number || null,
        payment_terms: data.billing?.payment_terms || null,
        credit_limit: data.billing?.credit_limit === '' ? null : data.billing?.credit_limit,
    });

    return fd;
};

const hasAnyDocumentFile = (data) => (data.documents || []).some((d) => d?.file instanceof File);

const createInitialFormData = (customer = null) => ({
    company_id: asString(customer?.company_id),
    country_id: asString(customer?.country_id),
    customer_code: asString(customer?.customer_code),
    name: asString(customer?.name),
    type: customer?.type || 'business',
    status: customer?.status || 'active',
    notes: asString(customer?.notes),
    is_consignor: asBool(customer?.is_consignor),
    is_consignee: asBool(customer?.is_consignee),
    address: (() => {
        const addr = customer?.address
            || (Array.isArray(customer?.addresses) ? customer.addresses[0] : customer?.addresses)
            || {};

        return {
            building: asString(addr?.building),
            street_no: asString(addr?.street_no),
            street: asString(addr?.street),
            suburb: asString(addr?.suburb),
            city: asString(addr?.city),
            state: asString(addr?.state),
            postcode: asString(addr?.postcode),
            contact_person: asString(addr?.contact_person),
            instructions: asString(addr?.instructions),
        };
    })(),
    contacts: customer?.contacts?.length
        ? customer.contacts.map((contact) => ({
            ...contact,
            name: asString(contact?.name),
            email: asString(contact?.email),
            phone: asString(contact?.phone),
            mobile: asString(contact?.mobile),
            designation: asString(contact?.designation),
            is_primary: asBool(contact?.is_primary),
        }))
        : [],
    contact_notes: customer?.contact_notes?.length
        ? customer.contact_notes.map((note) => ({
            ...note,
            note: asString(note?.note),
            interaction_type: note?.interaction_type || 'call',
            interaction_date: toDateInputValue(note?.interaction_date),
        }))
        : (customer?.contactNotes?.length
            ? customer.contactNotes.map((note) => ({
                ...note,
                note: asString(note?.note),
                interaction_type: note?.interaction_type || 'call',
                interaction_date: toDateInputValue(note?.interaction_date),
            }))
            : []),
    documents: customer?.documents?.length
        ? customer.documents.map((doc) => ({
            ...doc,
            title: asString(doc?.title),
            file_path: asString(doc?.file_path),
            file_type: asString(doc?.file_type),
            file: null,
        }))
        : [],
    billing: {
        ...emptyBilling,
        ...((customer?.billing_profile || customer?.billingProfile || {})),
    },
});

export default function CustomerForm({ customer = null, companies = [], countries = [] }) {
    const [formData, setFormData] = useState(createInitialFormData(customer));
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setFormData(createInitialFormData(customer));
        setErrors({});
    }, [customer]);

    const isEdit = Boolean(customer);

    const setNested = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));
    const appendItem = (key, item) => setNested(key, [...formData[key], item]);
    const removeItem = (key, index) => setNested(key, formData[key].filter((_, i) => i !== index));
    const updateItem = (key, index, field, value) => {
        const rows = [...formData[key]];
        rows[index] = { ...rows[index], [field]: value };
        setNested(key, rows);
    };

    const getError = (path) => errors[path];

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const routeName = isEdit ? route('customers.update', customer.id) : route('customers.store');
        const submit = isEdit ? (payload, options) => router.put(routeName, payload, options) : (payload, options) => router.post(routeName, payload, options);

        const payload = hasAnyDocumentFile(formData) ? buildCustomerFormData(formData) : formData;

        submit(payload, {
            forceFormData: true,
            onSuccess: () => {
                setLoading(false);
                router.visit(route('customers.index'));
            },
            onError: (newErrors) => {
                setLoading(false);
                setErrors(newErrors);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg bg-white p-6 shadow-md">
            {errors.error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errors.error}
                </div>
            )}

            <div className="border-b pb-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Basic Information</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Company</label>
                        <select value={formData.company_id} onChange={(e) => setNested('company_id', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#20A4AC]" required>
                            <option value="">Select Company</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {getError('company_id') && <p className="mt-1 text-xs text-red-600">{getError('company_id')}</p>}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Country</label>
                        <select value={formData.country_id} onChange={(e) => setNested('country_id', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#20A4AC]" required>
                            <option value="">Select Country</option>
                            {countries.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                        {getError('country_id') && <p className="mt-1 text-xs text-red-600">{getError('country_id')}</p>}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Customer Code</label>
                        <input type="text" value={formData.customer_code} onChange={(e) => setNested('customer_code', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#20A4AC]" required />
                        {getError('customer_code') && <p className="mt-1 text-xs text-red-600">{getError('customer_code')}</p>}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setNested('name', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#20A4AC]" required />
                        {getError('name') && <p className="mt-1 text-xs text-red-600">{getError('name')}</p>}
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                        <select value={formData.type} onChange={(e) => setNested('type', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#20A4AC]">
                            <option value="business">Business</option>
                            <option value="individual">Individual</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
                        <select value={formData.status} onChange={(e) => setNested('status', e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#20A4AC]">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                        <textarea value={formData.notes} onChange={(e) => setNested('notes', e.target.value)} rows="3" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#20A4AC]" />
                    </div>
                    <div className="md:col-span-2 flex gap-4">
                        <label className="flex cursor-pointer items-center">
                            <input type="checkbox" checked={formData.is_consignor} onChange={(e) => setNested('is_consignor', e.target.checked)} className="h-4 w-4 text-[#20A4AC]" />
                            <span className="ml-2 text-sm text-gray-700">Is Consignor</span>
                        </label>
                        <label className="flex cursor-pointer items-center">
                            <input type="checkbox" checked={formData.is_consignee} onChange={(e) => setNested('is_consignee', e.target.checked)} className="h-4 w-4 text-[#20A4AC]" />
                            <span className="ml-2 text-sm text-gray-700">Is Consignee</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="border-b pb-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Address</h3>
                </div>
                <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <input
                            type="text"
                            placeholder="Building"
                            value={formData.address.building || ''}
                            onChange={(e) => setNested('address', { ...formData.address, building: e.target.value })}
                            className="rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Street No"
                            value={formData.address.street_no || ''}
                            onChange={(e) => setNested('address', { ...formData.address, street_no: e.target.value })}
                            className="rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Street"
                            value={formData.address.street || ''}
                            onChange={(e) => setNested('address', { ...formData.address, street: e.target.value })}
                            className="md:col-span-2 rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Suburb"
                            value={formData.address.suburb || ''}
                            onChange={(e) => setNested('address', { ...formData.address, suburb: e.target.value })}
                            className="rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="City"
                            value={formData.address.city || ''}
                            onChange={(e) => setNested('address', { ...formData.address, city: e.target.value })}
                            className="rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="State"
                            value={formData.address.state || ''}
                            onChange={(e) => setNested('address', { ...formData.address, state: e.target.value })}
                            className="rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Postcode"
                            value={formData.address.postcode || ''}
                            onChange={(e) => setNested('address', { ...formData.address, postcode: e.target.value })}
                            className="md:col-span-2 rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                        <input
                            type="text"
                            placeholder="Contact Person"
                            value={formData.address.contact_person || ''}
                            onChange={(e) => setNested('address', { ...formData.address, contact_person: e.target.value })}
                            className="md:col-span-2 rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                        <textarea
                            placeholder="Instructions"
                            value={formData.address.instructions || ''}
                            onChange={(e) => setNested('address', { ...formData.address, instructions: e.target.value })}
                            rows="2"
                            className="md:col-span-2 rounded border border-gray-300 px-2 py-1 text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="border-b pb-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Contacts</h3>
                    <button type="button" onClick={() => appendItem('contacts', { name: '', email: '', phone: '', mobile: '', designation: '', is_primary: false })} className="flex items-center gap-1 text-sm font-medium text-[#20A4AC] hover:text-[#178089]">
                        <PlusIcon className="h-4 w-4" /> Add Contact
                    </button>
                </div>
                {formData.contacts.map((contact, idx) => (
                    <div key={contact.id || idx} className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Contact {idx + 1}</span>
                            <button type="button" onClick={() => removeItem('contacts', idx)} className="text-xs font-medium text-red-600 hover:text-red-700">Remove</button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <input type="text" placeholder="Name" value={contact.name || ''} onChange={(e) => updateItem('contacts', idx, 'name', e.target.value)} className="md:col-span-2 rounded border border-gray-300 px-2 py-1 text-sm" />
                            <input type="email" placeholder="Email" value={contact.email || ''} onChange={(e) => updateItem('contacts', idx, 'email', e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm" />
                            <input type="text" placeholder="Phone" value={contact.phone || ''} onChange={(e) => updateItem('contacts', idx, 'phone', e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm" />
                            <input type="text" placeholder="Mobile" value={contact.mobile || ''} onChange={(e) => updateItem('contacts', idx, 'mobile', e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm" />
                            <input type="text" placeholder="Designation" value={contact.designation || ''} onChange={(e) => updateItem('contacts', idx, 'designation', e.target.value)} className="md:col-span-2 rounded border border-gray-300 px-2 py-1 text-sm" />
                            <label className="md:col-span-2 flex cursor-pointer items-center">
                                <input type="checkbox" checked={Boolean(contact.is_primary)} onChange={(e) => updateItem('contacts', idx, 'is_primary', e.target.checked)} className="h-4 w-4 text-[#20A4AC]" />
                                <span className="ml-2 text-sm text-gray-600">Primary Contact</span>
                            </label>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-b pb-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Contact Notes</h3>
                    <button type="button" onClick={() => appendItem('contact_notes', { note: '', interaction_type: 'call', interaction_date: new Date().toISOString().split('T')[0] })} className="flex items-center gap-1 text-sm font-medium text-[#20A4AC] hover:text-[#178089]">
                        <PlusIcon className="h-4 w-4" /> Add Note
                    </button>
                </div>
                {formData.contact_notes.map((note, idx) => (
                    <div key={note.id || idx} className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Note {idx + 1}</span>
                            <button type="button" onClick={() => removeItem('contact_notes', idx)} className="text-xs font-medium text-red-600 hover:text-red-700">Remove</button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <textarea placeholder="Note" value={note.note || ''} onChange={(e) => updateItem('contact_notes', idx, 'note', e.target.value)} className="md:col-span-2 rounded border border-gray-300 px-2 py-1 text-sm" rows="2" />
                            <select value={note.interaction_type || 'call'} onChange={(e) => updateItem('contact_notes', idx, 'interaction_type', e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm">
                                <option value="call">Call</option>
                                <option value="meeting">Meeting</option>
                                <option value="email">Email</option>
                                <option value="other">Other</option>
                            </select>
                            <input type="date" value={note.interaction_date || ''} onChange={(e) => updateItem('contact_notes', idx, 'interaction_date', e.target.value)} className="rounded border border-gray-300 px-2 py-1 text-sm" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-b pb-6">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Documents</h3>
                    <button type="button" onClick={() => appendItem('documents', { title: '', file_path: null, file_type: '', file: null })} className="flex items-center gap-1 text-sm font-medium text-[#20A4AC] hover:text-[#178089]">
                        <PlusIcon className="h-4 w-4" /> Add Document
                    </button>
                </div>
                {formData.documents.map((doc, idx) => (
                    <div key={doc.id || idx} className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">Document {idx + 1}</span>
                            <button type="button" onClick={() => removeItem('documents', idx)} className="text-xs font-medium text-red-600 hover:text-red-700">Remove</button>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                            <input type="text" placeholder="Document Title" value={doc.title || ''} onChange={(e) => updateItem('documents', idx, 'title', e.target.value)} className="md:col-span-2 rounded border border-gray-300 px-2 py-1 text-sm" />
                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    updateItem('documents', idx, 'file', file);
                                    updateItem('documents', idx, 'file_path', null); // Upload ke baad backend file_path set karega
                                    updateItem('documents', idx, 'file_type', detectFileType(file));
                                }}
                                className="md:col-span-2 rounded border border-gray-300 px-2 py-1 text-sm"
                            />
                            {(doc.file?.name || doc.file_path) && (
                                <p className="md:col-span-2 text-xs text-gray-500">
                                    {doc.file?.name ? `Selected: ${doc.file.name}` : `Current file: ${doc.file_path}`}
                                </p>
                            )}
                            <select value={doc.file_type || ''} onChange={(e) => updateItem('documents', idx, 'file_type', e.target.value)} className="md:col-span-2 rounded border border-gray-300 px-2 py-1 text-sm">
                                <option value="">Select File Type</option>
                                <option value="pdf">PDF</option>
                                <option value="image">Image</option>
                                <option value="word">Word</option>
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            <div className="border-b pb-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-800">Billing Information</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input type="text" placeholder="Billing Name" value={formData.billing.billing_name || ''} onChange={(e) => setNested('billing', { ...formData.billing, billing_name: e.target.value })} className="md:col-span-2 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#20A4AC]" />
                    <input type="text" placeholder="NTN" value={formData.billing.ntn || ''} onChange={(e) => setNested('billing', { ...formData.billing, ntn: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#20A4AC]" />
                    <input type="text" placeholder="Tax Number" value={formData.billing.tax_number || ''} onChange={(e) => setNested('billing', { ...formData.billing, tax_number: e.target.value })} className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#20A4AC]" />
                    <input type="text" placeholder="Payment Terms" value={formData.billing.payment_terms || ''} onChange={(e) => setNested('billing', { ...formData.billing, payment_terms: e.target.value })} className="md:col-span-2 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#20A4AC]" />
                    <input type="number" min="0" placeholder="Credit Limit" value={formData.billing.credit_limit || ''} onChange={(e) => setNested('billing', { ...formData.billing, credit_limit: e.target.value })} className="md:col-span-2 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#20A4AC]" />
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => router.visit(route('customers.index'))} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                    Cancel
                </button>
                <button type="submit" disabled={loading} className="rounded-lg bg-[#20A4AC] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a8d95] disabled:bg-gray-400">
                    {loading ? 'Saving...' : isEdit ? 'Update Customer' : 'Create Customer'}
                </button>
            </div>
        </form>
    );
}
