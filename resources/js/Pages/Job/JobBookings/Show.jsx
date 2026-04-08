import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

const get = (obj, a) => obj?.[a];

export default function Show({ jobBooking }) {
    const company = get(jobBooking, 'company');
    const branch = get(jobBooking, 'branch');
    const customer = get(jobBooking, 'customer');
    const senderCustomer =
        get(jobBooking, 'senderCustomer') ||
        get(jobBooking, 'sender_customer') ||
        customer;
    const receiverCustomer =
        get(jobBooking, 'receiverCustomer') ||
        get(jobBooking, 'receiver_customer') ||
        customer;
    const senderAddress = senderCustomer?.address || (Array.isArray(senderCustomer?.addresses) ? senderCustomer.addresses[0] : null);
    const receiverAddress = receiverCustomer?.address || (Array.isArray(receiverCustomer?.addresses) ? receiverCustomer.addresses[0] : null);
    const senderPrimaryContact = Array.isArray(senderCustomer?.contacts)
        ? (senderCustomer.contacts.find((c) => c?.is_primary) || senderCustomer.contacts[0])
        : null;
    const receiverPrimaryContact = Array.isArray(receiverCustomer?.contacts)
        ? (receiverCustomer.contacts.find((c) => c?.is_primary) || receiverCustomer.contacts[0])
        : null;
    const additionalInformation =
        get(jobBooking, 'additionalInformation') ?? get(jobBooking, 'additional_information');
    const trackingNotifications =
        get(jobBooking, 'trackingNotifications') ?? get(jobBooking, 'tracking_notifications');

    const insuranceType =
        additionalInformation?.insurance_type ??
        additionalInformation?.insuranceType ??
        null;

    const dgSignatoryName =
        additionalInformation?.dgSignatory?.name ??
        additionalInformation?.dg_signatory_id ??
        additionalInformation?.dgSignatoryId ??
        null;

    const branchName =
        branch?.name ??
        branch?.branch_name ??
        jobBooking?.branch_name ??
        null;
    const branchCode =
        branch?.code ??
        branch?.branch_code ??
        jobBooking?.branch_code ??
        null;

    const handleDelete = () => {
        if (!jobBooking?.id) return;
        if (confirm('Are you sure you want to delete this job booking?')) {
            router.delete(route('job-bookings.destroy', jobBooking.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Job Booking - ${jobBooking?.job_number || ''}`} />

            <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                    <Link
                        href={route('job-bookings.index')}
                        className="text-sm font-medium text-teal-700 hover:text-teal-800"
                    >
                        Back to Job Bookings
                    </Link>
                    <h1 className="mt-2 text-3xl font-bold text-gray-900">
                        {jobBooking?.job_number || jobBooking?.booking_id || '-'}
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Job Type: <span className="font-medium text-gray-800">{jobBooking?.job_type || '-'}</span>
                    </p>
                </div>

                <div className="flex gap-2">
                    <Link
                        href={route('job-bookings.edit', jobBooking?.id)}
                        className="inline-flex items-center rounded-lg bg-[#20A4AC] px-4 py-2 text-sm font-medium text-white hover:bg-[#1a8d95] transition-colors"
                    >
                        Edit
                    </Link>
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                    >
                        Delete
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <div className="text-sm font-medium text-gray-600">Company</div>
                            <div className="mt-1 text-gray-900">{company?.name || jobBooking?.company_id || '-'}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-600">Branch</div>
                            <div className="mt-1 text-gray-900">
                                {branchName ?? jobBooking?.branch_id ?? '-'}
                                {branchCode ? <span className="text-gray-500"> ({branchCode})</span> : null}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-600">Customer</div>
                            <div className="mt-1 text-gray-900">
                                {customer?.name || '-'}
                                {customer?.customer_code ? <span className="text-gray-500"> ({customer.customer_code})</span> : null}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-600">Booking ID</div>
                            <div className="mt-1 text-gray-900">{jobBooking?.booking_id || '-'}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-600">Customer Reference</div>
                            <div className="mt-1 text-gray-900">{jobBooking?.customer_reference || '-'}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-600">Receiver Reference</div>
                            <div className="mt-1 text-gray-900">{jobBooking?.receiver_reference || '-'}</div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Sender & Receiver</h2>
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded border border-gray-200 p-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Sender</div>
                            <div className="text-sm text-gray-900 space-y-1">
                                <div><span className="text-gray-600">Name:</span> {senderCustomer?.name || '-'}</div>
                                <div><span className="text-gray-600">Country:</span> {senderCustomer?.country?.name || senderCustomer?.country_id || '-'}</div>
                                <div><span className="text-gray-600">Address:</span> {senderAddress?.building || ''} {senderAddress?.street_no || ''} {senderAddress?.street || ''}</div>
                                <div><span className="text-gray-600">City:</span> {senderAddress?.city || '-'}</div>
                                <div><span className="text-gray-600">Contact:</span> {senderPrimaryContact?.name || senderAddress?.contact_person || '-'}</div>
                            </div>
                        </div>
                        <div className="rounded border border-gray-200 p-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Receiver</div>
                            <div className="text-sm text-gray-900 space-y-1">
                                <div><span className="text-gray-600">Name:</span> {receiverCustomer?.name || '-'}</div>
                                <div><span className="text-gray-600">Country:</span> {receiverCustomer?.country?.name || receiverCustomer?.country_id || '-'}</div>
                                <div><span className="text-gray-600">Address:</span> {receiverAddress?.building || ''} {receiverAddress?.street_no || ''} {receiverAddress?.street || ''}</div>
                                <div><span className="text-gray-600">City:</span> {receiverAddress?.city || '-'}</div>
                                <div><span className="text-gray-600">Contact:</span> {receiverPrimaryContact?.name || receiverAddress?.contact_person || '-'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Packages</h2>
                    {jobBooking?.packages?.length ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cubic (m3)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {jobBooking.packages.map((p, idx) => (
                                        <tr key={p.id || idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {p.package_type?.name || p.package_name || '-'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{p.units ?? '-'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{p.weight_kg ?? '-'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{p.cubic_m3 ?? '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-600">No packages.</div>
                    )}
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Tracking Notifications</h2>
                    {trackingNotifications?.length ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Communication</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Notification Type</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Contact Value</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Enabled</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {trackingNotifications.map((tn, idx) => (
                                        <tr key={tn.id || idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {tn.jobBooking?.booking_id ?? tn.jobBookingByBookingId?.booking_id ?? '-'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{tn.communication_type || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {tn.notificationType?.name || tn.notification_type_id || '-'}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900">{tn.contact_value || '-'}</td>
                                            <td className="px-4 py-2 text-sm text-gray-900">
                                                {tn.enabled === true ? 'Yes' : 'No'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-600">No tracking notifications.</div>
                    )}
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <div className="text-sm font-medium text-gray-600">Insurance Type</div>
                            <div className="mt-1 text-gray-900">{insuranceType || '-'}</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-600">DG Signatory</div>
                            <div className="mt-1 text-gray-900">
                                {dgSignatoryName || '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

