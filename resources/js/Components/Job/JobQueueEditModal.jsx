import JobLineFinancials from '@/Components/Job/JobLineFinancials';
import JobLineNotes from '@/Components/Job/JobLineNotes';
import { Dialog, Transition } from '@headlessui/react';
import { router, useForm } from '@inertiajs/react';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { XMarkIcon } from '@/Components/Icons';

const TEAL = '#20A4AC';

const JOBABLE_WITH_FINANCIALS = new Set([
    'App\\Models\\Import',
    'App\\Models\\Export',
    'App\\Models\\Cart',
    'App\\Models\\Swing',
]);

function Field({ label, value }) {
    const display = value == null || value === '' ? '—' : String(value);
    return (
        <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
            <div className="mt-1 truncate text-sm font-semibold text-gray-900">{display}</div>
        </div>
    );
}

export default function JobQueueEditModal({ isOpen, onClose, queue, chargeTypes = [] }) {
    const q = queue || {};

    const [activeTab, setActiveTab] = useState('details');
    const [revenues, setRevenues] = useState([]);
    const [costs, setCosts] = useState([]);
    const [jobNotes, setJobNotes] = useState([]);
    const [endorsements, setEndorsements] = useState([]);
    const [financialsLoading, setFinancialsLoading] = useState(false);
    const [resolvedJobableType, setResolvedJobableType] = useState('');
    const [resolvedJobableId, setResolvedJobableId] = useState(null);

    const supportsFinancials = JOBABLE_WITH_FINANCIALS.has(q.jobable_type);

    const loadFinancials = useCallback(async () => {
        if (!q.id || !supportsFinancials) return;
        setFinancialsLoading(true);
        try {
            const res = await fetch(route('job-queues.financials', q.id), {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });
            if (!res.ok) throw new Error('Failed to load financials');
            const data = await res.json();
            setRevenues(Array.isArray(data.revenues) ? data.revenues : []);
            setCosts(Array.isArray(data.costs) ? data.costs : []);
            setJobNotes(Array.isArray(data.jobNotes) ? data.jobNotes : []);
            setEndorsements(Array.isArray(data.endorsements) ? data.endorsements : []);
            setResolvedJobableType(data.jobable_type || q.jobable_type || '');
            setResolvedJobableId(data.jobable_id ?? q.jobable_id ?? null);
        } catch {
            setRevenues([]);
            setCosts([]);
            setJobNotes([]);
            setEndorsements([]);
            setResolvedJobableType(q.jobable_type || '');
            setResolvedJobableId(q.jobable_id ?? null);
        } finally {
            setFinancialsLoading(false);
        }
    }, [q.id, q.jobable_type, q.jobable_id, supportsFinancials]);

    useEffect(() => {
        if (!isOpen) return;
        setActiveTab('details');
    }, [isOpen, q.id]);

    useEffect(() => {
        if (!isOpen || !supportsFinancials) return;
        loadFinancials();
    }, [isOpen, q.id, supportsFinancials, loadFinancials]);

    const STATUSES = ['PENDING_TBA', 'IN_PROCESS', 'ACTIVE', 'DISPATCH', 'DELIVERED', 'CANCELLED'];
    const STATUS_LABELS = {
        PENDING_TBA: 'Pending TBA',
        IN_PROCESS: 'In Process',
        ACTIVE: 'Active',
        DISPATCH: 'Dispatch',
        DELIVERED: 'Delivered',
        CANCELLED: 'Cancelled',
    };

    const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

    const { data, setData, patch, processing } = useForm({
        status: q.status || '',
        customer_code: q.customer_code || '',
        container_number: q.container_number || '',
        from_location: q.from_location || '',
        to_location: q.to_location || '',
        weight: q.weight ?? '',
        available_date: toDateInput(q.available_date),
        dgs: !!q.dg,
        live_ul: !!q.live_ul,
        demurrage_date: toDateInput(q.demurrage_date),
        detention_days: q.detention_days ?? 0,
        random_number: q.release_random || '',
        release_ecn_number: q.ecn || '',
    });

    useEffect(() => {
        if (!isOpen) return;
        setData('status', q.status || '');
        setData('customer_code', q.customer_code || '');
        setData('container_number', q.container_number || '');
        setData('from_location', q.from_location || '');
        setData('to_location', q.to_location || '');
        setData('weight', q.weight ?? '');
        setData('available_date', toDateInput(q.available_date));
        setData('dgs', !!q.dg);
        setData('live_ul', !!q.live_ul);
        setData('demurrage_date', toDateInput(q.demurrage_date));
        setData('detention_days', q.detention_days ?? 0);
        setData('random_number', q.release_random || '');
        setData('release_ecn_number', q.ecn || '');
    }, [isOpen, q.id]);

    const customerName = q.customer_name || q.receiver_customer_name || q.sender_customer_name || '—';
    const customerCountry = q.customer_country || q.receiver_customer_country || q.sender_customer_country || '—';
    const customerCode = data.customer_code || q.customer_code || '';

    const jobableTypeForLines = resolvedJobableType || q.jobable_type || '';
    const jobableIdForLines = resolvedJobableId ?? q.jobable_id ?? null;
    const canRenderLineForms = Boolean(jobableTypeForLines && jobableIdForLines != null);

    const tabIds = supportsFinancials ? ['details', 'notes', 'revenue', 'cost'] : ['details'];
    const tabLabel = { details: 'Details', notes: 'Notes', revenue: 'Revenue', cost: 'Cost' };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-7xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between bg-gradient-to-r from-[#20A4AC] to-[#1a8d95] px-5 py-3">
                                    <Dialog.Title className="text-lg font-bold text-white">Job Details</Dialog.Title>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded p-1 text-white hover:bg-white/10"
                                        aria-label="Close"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="border-b border-gray-100 px-5 py-3 text-sm text-gray-600">
                                    Queue ID <span className="font-semibold text-gray-900">{q.id ?? '—'}</span> • Job #
                                    <span className="font-semibold text-gray-900">
                                        {' '}
                                        {q.job_number || (q.jobable_id != null ? `#${q.jobable_id}` : '—')}
                                    </span>
                                </div>

                                {tabIds.length > 1 && (
                                    <div className="flex flex-wrap gap-1 border-b border-gray-200 px-5 pt-3">
                                        {tabIds.map((tid) => {
                                            const on = activeTab === tid;
                                            return (
                                                <button
                                                    key={tid}
                                                    type="button"
                                                    onClick={() => setActiveTab(tid)}
                                                    className={[
                                                        'rounded-t-md px-4 py-2 text-sm font-semibold transition-colors',
                                                        on ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                                                    ].join(' ')}
                                                    style={on ? { backgroundColor: TEAL } : undefined}
                                                >
                                                    {tabLabel[tid] || tid}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="max-h-[min(620px,72vh)] overflow-y-auto px-5 py-4">
                                    {activeTab === 'details' && (
                                        <>
                                            <section className="rounded-lg border border-gray-200 bg-white p-4">
                                                <h4 className="text-sm font-semibold text-gray-800">Container</h4>
                                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Container Number</div>
                                                        <input
                                                            type="text"
                                                            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                            value={data.container_number}
                                                            onChange={(e) => setData('container_number', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">From</div>
                                                        <input
                                                            type="text"
                                                            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                            value={data.from_location}
                                                            onChange={(e) => setData('from_location', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">To</div>
                                                        <input
                                                            type="text"
                                                            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                            value={data.to_location}
                                                            onChange={(e) => setData('to_location', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Weight</div>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                            value={data.weight}
                                                            onChange={(e) => setData('weight', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Available Date</div>
                                                        <input
                                                            type="date"
                                                            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                            value={data.available_date}
                                                            onChange={(e) => setData('available_date', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={data.dgs}
                                                            onChange={(e) => setData('dgs', e.target.checked)}
                                                            className="h-4 w-4 rounded border-gray-300 text-[#20A4AC] focus:ring-[#20A4AC]"
                                                        />
                                                        <div className="text-sm font-medium text-gray-700">DG</div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={data.live_ul}
                                                            onChange={(e) => setData('live_ul', e.target.checked)}
                                                            className="h-4 w-4 rounded border-gray-300 text-[#20A4AC] focus:ring-[#20A4AC]"
                                                        />
                                                        <div className="text-sm font-medium text-gray-700">L/UL</div>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Demurrage Date</div>
                                                        <input
                                                            type="date"
                                                            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                            value={data.demurrage_date}
                                                            onChange={(e) => setData('demurrage_date', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Detention Days</div>
                                                        <input
                                                            type="number"
                                                            step="1"
                                                            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                            value={data.detention_days}
                                                            onChange={(e) => setData('detention_days', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Release / Random</div>
                                                        <input
                                                            type="text"
                                                            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                            value={data.random_number}
                                                            onChange={(e) => setData('random_number', e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">ECN</div>
                                                        <input
                                                            type="text"
                                                            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                            value={data.release_ecn_number}
                                                            onChange={(e) => setData('release_ecn_number', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </section>

                                            <section className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
                                                <h4 className="text-sm font-semibold text-gray-800">Customer</h4>
                                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                                                    <div className="min-w-0">
                                                        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">Customer Code</div>
                                                        <input
                                                            type="text"
                                                            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                            value={customerCode}
                                                            onChange={(e) => setData('customer_code', e.target.value)}
                                                        />
                                                    </div>
                                                    <Field label="Name" value={customerName} />
                                                    <Field label="Country" value={customerCountry} />
                                                    <Field label="Job Type" value={q.job_type} />
                                                </div>
                                            </section>
                                        </>
                                    )}

                                    {activeTab === 'notes' && supportsFinancials && (
                                        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                                            {financialsLoading && <p className="mb-3 text-sm text-gray-500">Loading notes…</p>}
                                            {!financialsLoading && canRenderLineForms && (
                                                <JobLineNotes
                                                    jobableType={jobableTypeForLines}
                                                    jobableId={jobableIdForLines}
                                                    lines={jobNotes}
                                                    endorsements={endorsements}
                                                    onAfterMutation={loadFinancials}
                                                />
                                            )}
                                            {!financialsLoading && !canRenderLineForms && (
                                                <p className="text-sm text-gray-500">Unable to load notes for this queue row.</p>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'revenue' && supportsFinancials && (
                                        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                                            {financialsLoading && <p className="mb-3 text-sm text-gray-500">Loading revenue…</p>}
                                            {!financialsLoading && canRenderLineForms && (
                                                <JobLineFinancials
                                                    variant="revenue"
                                                    jobableType={jobableTypeForLines}
                                                    jobableId={jobableIdForLines}
                                                    lines={revenues}
                                                    chargeTypes={chargeTypes}
                                                    onAfterMutation={loadFinancials}
                                                />
                                            )}
                                            {!financialsLoading && !canRenderLineForms && (
                                                <p className="text-sm text-gray-500">Unable to load revenue for this queue row.</p>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'cost' && supportsFinancials && (
                                        <div className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4">
                                            {financialsLoading && <p className="mb-3 text-sm text-gray-500">Loading cost…</p>}
                                            {!financialsLoading && canRenderLineForms && (
                                                <JobLineFinancials
                                                    variant="cost"
                                                    jobableType={jobableTypeForLines}
                                                    jobableId={jobableIdForLines}
                                                    lines={costs}
                                                    chargeTypes={chargeTypes}
                                                    onAfterMutation={loadFinancials}
                                                />
                                            )}
                                            {!financialsLoading && !canRenderLineForms && (
                                                <p className="text-sm text-gray-500">Unable to load cost for this queue row.</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap justify-between gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3">
                                    {activeTab === 'details' ? (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="text-sm font-medium text-gray-700">Status</div>
                                                <select
                                                    className="rounded border border-gray-300 bg-white px-8 py-1.5 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                                    value={data.status}
                                                    onChange={(e) => setData('status', e.target.value)}
                                                >
                                                    {STATUSES.map((s) => (
                                                        <option key={s} value={s}>
                                                            {STATUS_LABELS[s] || s}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={onClose}
                                                    className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (!q.id) return;
                                                        patch(route('job-queues.update-details', q.id), {
                                                            onSuccess: () => {
                                                                onClose();
                                                                router.reload({ only: ['jobQueues', 'statusCounts', 'filters'] });
                                                            },
                                                        });
                                                    }}
                                                    disabled={processing || !q.id}
                                                    className="rounded-md bg-gradient-to-r from-[#20A4AC] to-[#1a8d95] px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-[#1a8d95] hover:to-[#126f76] disabled:cursor-not-allowed disabled:opacity-50"
                                                >
                                                    Save Changes
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="ml-auto flex flex-wrap items-center gap-2">
                                            <p className="mr-auto max-w-xl text-xs text-gray-500 sm:text-sm">
                                                Notes, revenue, and cost save immediately. Use the <span className="font-semibold">Details</span> tab to update
                                                container, customer, and status.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
