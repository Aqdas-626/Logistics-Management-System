import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const get = (obj, a, b) => obj?.[a] ?? obj?.[b];

export default function Show({ customer }) {
    const company = get(customer, 'company', null);
    const billing = get(customer, 'billing_profile', 'billingProfile') || {};
    const contactNotes = get(customer, 'contact_notes', 'contactNotes') || [];
    const address = customer?.address || (Array.isArray(customer?.addresses) ? customer.addresses[0] : customer?.addresses) || null;

    return (
        <AuthenticatedLayout>
            <Head title={`Customer - ${customer?.name || ''}`} />

            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <Link
                        href={route('customers.index')}
                        className="text-sm font-medium text-[#20A4AC] hover:text-[#178089]"
                    >
                        Back to Customers
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        {customer?.name}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Code: <span className="font-medium text-gray-800">{customer?.customer_code}</span>
                    </p>
                </div>

                <div className="flex items-start gap-2">
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            customer?.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : customer?.status === 'inactive'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                        }`}
                    >
                        {customer?.status}
                    </span>
                    <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            customer?.type === 'business'
                                ? 'bg-[#20A4AC]/15 text-[#0f5c61]'
                                : 'bg-green-100 text-green-800'
                        }`}
                    >
                        {customer?.type}
                    </span>
                </div>
            </div>

            <div className="space-y-6">
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <div className="text-sm font-medium text-gray-600">Company</div>
                            <div className="mt-1 text-gray-900">{company?.name || '-'}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-600">Country</div>
                            <div className="mt-1 text-gray-900">{customer?.country?.name || customer?.country_id || '-'}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-600">Customer Code</div>
                            <div className="mt-1 text-gray-900">{customer?.customer_code}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-600">Type</div>
                            <div className="mt-1 text-gray-900 capitalize">{customer?.type}</div>
                        </div>
                        <div className="md:col-span-2">
                            <div className="text-sm font-medium text-gray-600">Notes</div>
                            <div className="mt-1 whitespace-pre-wrap text-gray-900">{customer?.notes || '-'}</div>
                        </div>
                        <div className="md:col-span-2 flex gap-6">
                            <div className="text-sm text-gray-700">
                                <span className="font-medium text-gray-900">Consignor:</span>{' '}
                                {customer?.is_consignor ? 'Yes' : 'No'}
                            </div>
                            <div className="text-sm text-gray-700">
                                <span className="font-medium text-gray-900">Consignee:</span>{' '}
                                {customer?.is_consignee ? 'Yes' : 'No'}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Address</h2>
                    {address ? (
                        <div className="rounded border border-gray-200 p-4">
                            <div className="text-sm text-gray-900">
                                <div>
                                    {[address.building, address.street_no, address.street].filter(Boolean).join(' ')}
                                </div>
                                <div>
                                    {[address.suburb].filter(Boolean).join(', ')}
                                </div>
                                <div>
                                    {[address.city, address.state, address.postcode].filter(Boolean).join(', ')}
                                </div>
                                {address.contact_person ? (
                                    <div className="mt-2">
                                        <span className="font-medium text-gray-700">Contact Person:</span> {address.contact_person}
                                    </div>
                                ) : null}
                                {address.instructions ? (
                                    <div className="mt-2 whitespace-pre-wrap">
                                        <span className="font-medium text-gray-700">Instructions:</span>
                                        <div>{address.instructions}</div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-600">No address.</div>
                    )}
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Contacts</h2>
                    {customer?.contacts?.length ? (
                        <div className="space-y-3">
                            {customer.contacts.map((contact, idx) => (
                                <div key={contact.id || idx} className="rounded border border-gray-200 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="text-sm font-medium text-gray-700">
                                            Contact {idx + 1}: {contact.name}
                                        </div>
                                        {contact.is_primary ? (
                                            <span className="rounded-full bg-[#20A4AC]/15 px-3 py-1 text-xs font-semibold text-[#0f5c61]">
                                                Primary
                                            </span>
                                        ) : null}
                                    </div>
                                    <div className="mt-2 text-sm text-gray-900">
                                        {contact.designation ? <div>{contact.designation}</div> : null}
                                        {contact.email ? <div>Email: {contact.email}</div> : null}
                                        {contact.phone ? <div>Phone: {contact.phone}</div> : null}
                                        {contact.mobile ? <div>Mobile: {contact.mobile}</div> : null}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-600">No contacts.</div>
                    )}
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Notes</h2>
                    {contactNotes?.length ? (
                        <div className="space-y-3">
                            {contactNotes.map((note, idx) => (
                                <div key={note.id || idx} className="rounded border border-gray-200 p-4">
                                    <div className="text-sm font-medium text-gray-700">
                                        Note {idx + 1}
                                    </div>
                                    <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                                        {note.note}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-600">
                                        Type: {note.interaction_type || '-'} · Date:{' '}
                                        {note.interaction_date ? note.interaction_date.toString().split('T')[0] : '-'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-600">No contact notes.</div>
                    )}
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Documents</h2>
                    {customer?.documents?.length ? (
                        <div className="space-y-3">
                            {customer.documents.map((doc, idx) => (
                                <div key={doc.id || idx} className="rounded border border-gray-200 p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="text-sm font-medium text-gray-700">{doc.title || `Document ${idx + 1}`}</div>
                                        {doc.file_type ? (
                                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                                                {doc.file_type}
                                            </span>
                                        ) : null}
                                    </div>
                                    {(doc.public_url || doc.file_path) ? (
                                        <div className="mt-3">
                                            <a
                                                href={doc.public_url || `/storage/${String(doc.file_path).replace(/^\/storage\//, '').replace(/^storage\//, '')}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm font-medium text-[#20A4AC] hover:text-[#178089]"
                                            >
                                                Download/View
                                            </a>
                                        </div>
                                    ) : (
                                        <div className="mt-3 text-sm text-gray-600">No file attached.</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-600">No documents.</div>
                    )}
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h2>
                    {billing ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <div className="text-sm font-medium text-gray-600">Billing Name</div>
                                <div className="mt-1 text-gray-900">{billing.billing_name || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-600">NTN</div>
                                <div className="mt-1 text-gray-900">{billing.ntn || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-600">Tax Number</div>
                                <div className="mt-1 text-gray-900">{billing.tax_number || '-'}</div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-600">Payment Terms</div>
                                <div className="mt-1 text-gray-900">{billing.payment_terms || '-'}</div>
                            </div>
                            <div className="md:col-span-2">
                                <div className="text-sm font-medium text-gray-600">Credit Limit</div>
                                <div className="mt-1 text-gray-900">{billing.credit_limit ?? '-'}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-600">No billing info.</div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

