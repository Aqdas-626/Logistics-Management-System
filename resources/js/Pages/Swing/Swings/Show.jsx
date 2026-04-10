import JobLineFinancials from '@/Components/Job/JobLineFinancials';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { confirmDelete } from '@/Utils/confirmDelete';

const TEAL = '#20A4AC';
const SECTION_HEADER_BG = '#279ca1';

export default function Show({
    swingJob,
    jobServices = [],
    jobNotes = [],
    jobDocuments = [],
    revenues = [],
    costs = [],
    chargeTypes = [],
    jobableType = '',
}) {
    const { flash } = usePage().props;
    const [activeTab, setActiveTab] = useState('details');
    const containers = swingJob?.containers ?? [];
    const firstContainer = containers[0];

    const formatDateTime = (value) => {
        if (!value) return '-';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return String(value);
        return parsed.toLocaleString();
    };
    const formatDate = (value) => {
        if (!value) return '-';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return String(value);
        return parsed.toLocaleDateString();
    };
    const getDocumentUrl = (filePath) => {
        if (!filePath) return '#';
        if (String(filePath).startsWith('http://') || String(filePath).startsWith('https://')) return filePath;
        return `/storage/${String(filePath).replace(/^\/+/, '')}`;
    };
    const getDocumentName = (filePath) => {
        if (!filePath) return '-';
        const parts = String(filePath).split('/');
        return parts[parts.length - 1] || String(filePath);
    };

    const onDelete = () => {
        confirmDelete({
            message: 'Delete this swing job?',
            onConfirm: () => {
            router.delete(route('swings.destroy', swingJob.id));
            },
        });
    };

    const tabs = [
        { id: 'details', label: 'Job Details' },
        { id: 'notes', label: 'Notes' },
        { id: 'revenue', label: 'Revenue' },
        { id: 'cost', label: 'Cost' },
        { id: 'tracking', label: 'Tracking' },
    ];

    const renderContainerFields = (container) => (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
                <div className="text-sm font-medium text-gray-600">Reference</div>
                <div className="mt-1 break-words">{container?.reference || '-'}</div>
            </div>
            <div>
                <div className="text-sm font-medium text-gray-600">Container #</div>
                <div className="mt-1 break-words">{container?.container_number || '-'}</div>
            </div>
            <div>
                <div className="text-sm font-medium text-gray-600">ISO Code</div>
                <div className="mt-1 break-words">{container?.iso_code?.name || container?.iso_code?.code || '-'}</div>
            </div>
            <div>
                <div className="text-sm font-medium text-gray-600">Weight</div>
                <div className="mt-1 break-words">{container?.weight ?? '-'}</div>
            </div>
            <div>
                <div className="text-sm font-medium text-gray-600">Available</div>
                <div className="mt-1 break-words">{formatDate(container?.available_date)}</div>
            </div>
            <div>
                <div className="text-sm font-medium text-gray-600">Door</div>
                <div className="mt-1 break-words">{container?.door_type?.name || '-'}</div>
            </div>
            <div>
                <div className="text-sm font-medium text-gray-600">Service Type</div>
                <div className="mt-1 break-words">{container?.lift_type?.name || '-'}</div>
            </div>
            <div>
                <div className="text-sm font-medium text-gray-600">Ready Now</div>
                <div className="mt-1 break-words">{container?.ready_now ? 'Yes' : 'No'}</div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout>
            <Head title={`Swing - ${swingJob?.job_no || ''}`} />

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <Link href={route('swings.index')} className="text-sm font-medium text-teal-700 hover:text-teal-800">
                        Back to Swing Jobs
                    </Link>
                    <h1 className="mt-2 break-all text-2xl font-bold text-gray-900 sm:text-3xl">{swingJob?.job_no || '-'}</h1>
                    <p className="mt-2 text-gray-600">
                        Job Type: <span className="font-medium text-gray-800">swing</span>
                    </p>
                </div>
                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                    <Link
                        href={route('swings.edit', swingJob.id)}
                        className="rounded-lg bg-[#20A4AC] px-4 py-2 text-center text-sm font-medium text-white hover:bg-[#1a8d95]"
                    >
                        Edit
                    </Link>
                    <button type="button" onClick={onDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">
                        Delete
                    </button>
                </div>
            </div>

            {flash?.success && <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">{flash.success}</div>}

            <div className="mb-6 flex flex-wrap gap-1 border-b border-gray-200">
                {tabs.map((t) => {
                    const on = activeTab === t.id;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveTab(t.id)}
                            className={[
                                'rounded-t-md px-4 py-2 text-sm font-semibold transition-colors',
                                on ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                            ].join(' ')}
                            style={on ? { backgroundColor: TEAL } : undefined}
                        >
                            {t.label}
                        </button>
                    );
                })}
            </div>

            {activeTab === 'details' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="overflow-hidden rounded-lg bg-white shadow-md lg:col-span-4">
                            <div
                                className="px-4 py-3 text-base font-semibold text-white sm:px-5 sm:py-3.5"
                                style={{ backgroundColor: SECTION_HEADER_BG }}
                            >
                                Basic Information
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <div className="text-sm font-medium text-gray-600">Customer</div>
                                        <div className="mt-1 break-words">{swingJob?.customer?.name || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-600">Document Received</div>
                                        <div className="mt-1 break-words">{formatDateTime(swingJob?.document_received_at)}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-600">From</div>
                                        <div className="mt-1 break-words">{swingJob?.from_location || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg bg-white shadow-md lg:col-span-8">
                            <div
                                className="px-4 py-3 text-base font-semibold text-white sm:px-5 sm:py-3.5"
                                style={{ backgroundColor: SECTION_HEADER_BG }}
                            >
                                Container Details
                            </div>
                            <div className="p-4 sm:p-6">
                                {firstContainer ? renderContainerFields(firstContainer) : <p className="text-sm text-gray-600">No containers linked.</p>}
                            </div>
                        </div>
                    </div>

                    {containers.length > 1 &&
                        containers.slice(1).map((container, idx) => (
                            <div key={container.id ?? idx + 1} className="overflow-hidden rounded-lg bg-white shadow-md">
                                <div
                                    className="px-4 py-3 text-base font-semibold text-white sm:px-5 sm:py-3.5"
                                    style={{ backgroundColor: SECTION_HEADER_BG }}
                                >
                                    Container Details ({idx + 2})
                                </div>
                                <div className="p-4 sm:p-6">{renderContainerFields(container)}</div>
                            </div>
                        ))}

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        <div className="overflow-hidden rounded-lg bg-white shadow-md">
                            <div
                                className="px-4 py-3 text-base font-semibold text-white sm:px-5 sm:py-3.5"
                                style={{ backgroundColor: SECTION_HEADER_BG }}
                            >
                                Recent Services
                            </div>
                            <div className="p-4">
                                <ul className="space-y-1 break-words text-sm text-gray-700">
                                    {jobServices.length ? jobServices.map((s) => <li key={s.id}>- {s.service?.name || s.service_id}</li>) : <li>No records</li>}
                                </ul>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-lg bg-white shadow-md">
                            <div
                                className="px-4 py-3 text-base font-semibold text-white sm:px-5 sm:py-3.5"
                                style={{ backgroundColor: SECTION_HEADER_BG }}
                            >
                                Recent Notes
                            </div>
                            <div className="p-4">
                                <ul className="space-y-1 break-words text-sm text-gray-700">
                                    {jobNotes.length ? (
                                        jobNotes.map((n) => (
                                            <li key={n.id}>
                                                - {n.endorsement?.name || n.endorsement_id}
                                                {n.note ? `: ${n.note}` : ''}
                                            </li>
                                        ))
                                    ) : (
                                        <li>No records</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                        <div className="overflow-hidden rounded-lg bg-white shadow-md md:col-span-2 xl:col-span-1">
                            <div
                                className="px-4 py-3 text-base font-semibold text-white sm:px-5 sm:py-3.5"
                                style={{ backgroundColor: SECTION_HEADER_BG }}
                            >
                                Recent Documents
                            </div>
                            <div className="p-4">
                                <ul className="space-y-2 text-sm text-gray-700">
                                    {jobDocuments.length ? (
                                        jobDocuments.map((d) => {
                                            const fileUrl = getDocumentUrl(d.file);
                                            return (
                                                <li key={d.id} className="rounded border border-gray-200 p-2">
                                                    <p className="break-all text-xs text-gray-600">{getDocumentName(d.file)}</p>
                                                    <div className="mt-2 flex gap-3">
                                                        <a
                                                            href={fileUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-xs font-medium text-[#178089] hover:text-[#0f5c61]"
                                                        >
                                                            View
                                                        </a>
                                                        <a href={fileUrl} download className="text-xs font-medium text-teal-700 hover:text-teal-800">
                                                            Download
                                                        </a>
                                                    </div>
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <li>No records</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'notes' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="overflow-hidden rounded-lg bg-white shadow-md">
                        <div
                            className="px-4 py-3 text-base font-semibold text-white sm:px-5 sm:py-3.5"
                            style={{ backgroundColor: SECTION_HEADER_BG }}
                        >
                            Notes
                        </div>
                        <div className="p-4 sm:p-6">
                            <ul className="space-y-3 text-sm text-gray-700">
                                {jobNotes.length ? (
                                    jobNotes.map((n) => (
                                        <li key={n.id} className="rounded border border-gray-100 p-3">
                                            <span className="font-semibold text-gray-900">{n.endorsement?.name || '-'}</span>
                                            {n.note ? <p className="mt-1 text-gray-600">{n.note}</p> : null}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-gray-500">No notes for this job.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                    <div className="overflow-hidden rounded-lg bg-white shadow-md">
                        <div
                            className="px-4 py-3 text-base font-semibold text-white sm:px-5 sm:py-3.5"
                            style={{ backgroundColor: SECTION_HEADER_BG }}
                        >
                            Services
                        </div>
                        <div className="p-4 sm:p-6">
                            <ul className="space-y-2 text-sm text-gray-700">
                                {jobServices.length ? (
                                    jobServices.map((s) => <li key={s.id}>- {s.service?.name || s.service_id}</li>)
                                ) : (
                                    <li className="text-gray-500">No services.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'revenue' && jobableType && swingJob?.id != null && (
                <div className="overflow-hidden rounded-lg bg-white p-4 shadow-md sm:p-6">
                    <JobLineFinancials variant="revenue" jobableType={jobableType} jobableId={swingJob.id} lines={revenues} chargeTypes={chargeTypes} />
                </div>
            )}

            {activeTab === 'cost' && jobableType && swingJob?.id != null && (
                <div className="overflow-hidden rounded-lg bg-white p-4 shadow-md sm:p-6">
                    <JobLineFinancials variant="cost" jobableType={jobableType} jobableId={swingJob.id} lines={costs} chargeTypes={chargeTypes} />
                </div>
            )}

            {activeTab === 'tracking' && (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center text-sm text-gray-600">
                    Tracking for this job is not configured yet.
                </div>
            )}
        </AuthenticatedLayout>
    );
}
