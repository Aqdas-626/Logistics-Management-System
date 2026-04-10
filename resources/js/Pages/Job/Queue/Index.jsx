import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import JobQueueExportModal from '@/Components/Job/JobQueueExportModal';
import JobQueueEditModal from '@/Components/Job/JobQueueEditModal';
import JobQueueDispatchModal from '@/Components/Job/JobQueueDispatchModal';
import JobQueueHubModal from '@/Components/Job/JobQueueHubModal';
import JobQueueDocumentModal from '@/Components/Job/JobQueueDocumentModal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { EyeIcon, PencilIcon, TrashIcon } from '@/Components/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { confirmDelete } from '@/Utils/confirmDelete';

const TEAL = '#17a2b8';

const STATUS_LABELS = {
    PENDING_TBA: 'Pending TBA',
    ACTIVE: 'Active',
    IN_PROCESS: 'In Process',
    DISPATCH: 'Dispatch',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
};

// Status cards include some "derived" states that are not stored in JobQueue.status,
// so we display the active filter label when a card is selected.
const STATUS_FILTER_LABELS = {
    IN_PROCESS: 'In Process',
    PENDING_TBA: 'Pending TBA',
    ACTIVE: 'Active',
    URGENT: 'Urgent',
    DEMURRAGE: 'Demurrage',
    DETENTION: 'Detention',
    DG: 'DG',
    LIVE_UL: 'LiveUnLoad',
};

/** Maps JobQueue.jobable_type (model class) to Laravel resource route prefix */
const JOBABLE_ROUTE_PREFIX = {
    'App\\Models\\Import': 'imports',
    'App\\Models\\Export': 'exports',
    'App\\Models\\Cart': 'carts',
    'App\\Models\\Swing': 'swings',
};

function getJobableRoutePrefix(jobableType) {
    if (!jobableType) return null;
    return JOBABLE_ROUTE_PREFIX[jobableType] ?? null;
}

function IconLocationPin(props) {
    return (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );
}

function IconDocument(props) {
    return (
        <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
        </svg>
    );
}

function JobQueueRowActions({ queue, onEdit, onDelete, onAddHub, onAddDocument }) {
    const prefix = getJobableRoutePrefix(queue.jobable_type);
    const jid = queue.jobable_id;
    if (!prefix || jid == null) {
        return <span className="text-xs text-gray-400">—</span>;
    }
    return (
        <div className="flex flex-wrap items-center gap-1">
            {/* <Link
                href={route(`${prefix}.show`, jid)}
                className="inline-flex  items-center justify-center text-sky-700"
                title="View"
                aria-label="View job"
            >
                <EyeIcon className="h-4 w-4" />
            </Link> */}
            <button
                title="Edit"
                aria-label="Edit job"
                type="button"
                onClick={onEdit}
                className="inline-flex items-center justify-center text-[#178089]"
            >
                <PencilIcon className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={onAddHub}
                className="inline-flex items-center justify-center text-[#178089]"
                title="Add hub"
                aria-label="Add hub"
            >
                <IconLocationPin className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={onAddDocument}
                className="inline-flex items-center justify-center text-[#178089]"
                title="Upload document"
                aria-label="Upload document"
            >
                <IconDocument className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={onDelete}
                className="inline-flex items-center justify-center  text-red-600 "
                title="Delete job queue"
                aria-label="Delete job"
            >
                <TrashIcon className="h-4 w-4" />
            </button>
        </div>
    );
}

function SortArrows() {
    return (
        <span className="ml-1 inline-flex flex-col align-middle text-[9px] leading-none text-gray-400">
            <span className="-mb-0.5">▲</span>
            <span>▼</span>
        </span>
    );
}

function IconRefresh() {
    return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
        </svg>
    );
}

function IconTruck() {
    return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
        </svg>
    );
}

function IconExport() {
    return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
        </svg>
    );
}

export default function Index({
    jobQueues,
    filters,
    movementTypeOptions,
    statusCounts,
    jobQueueChargeTypes = [],
    dispatchAssignments = [],
    hubLocations = [],
}) {
    const getMovementLabel = (value) =>
        movementTypeOptions?.[value] || value?.split('\\').pop() || '—';
    const { flash } = usePage().props;
    const { data, setData, processing } = useForm({
        status: filters?.status || '',
        movement_type: filters?.movement_type || '',
        search: filters?.search || '',
        per_page: String(filters?.per_page ?? 25),
    });

    const [selectedIds, setSelectedIds] = useState(() => new Set());
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
    const [documentModalOpen, setDocumentModalOpen] = useState(false);
    const [hubModalOpen, setHubModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editQueue, setEditQueue] = useState(null);
    const [hubQueue, setHubQueue] = useState(null);
    const [documentQueue, setDocumentQueue] = useState(null);
    const masterRef = useRef(null);

    const pageIds = jobQueues.data.map((q) => q.id);
    const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
    const someOnPageSelected = pageIds.some((id) => selectedIds.has(id));

    useEffect(() => {
        if (masterRef.current) {
            masterRef.current.indeterminate = someOnPageSelected && !allOnPageSelected;
        }
    }, [someOnPageSelected, allOnPageSelected]);

    const filterQuery = () => ({
        status: data.status,
        movement_type: data.movement_type,
        search: data.search,
        per_page: data.per_page,
    });

    const applyFilters = (overrides = {}) => {
        router.get(route('job-queues.index'), { ...filterQuery(), ...overrides }, { preserveState: true, replace: true });
    };

    const openEditModal = (queue) => {
        setEditQueue(queue);
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditQueue(null);
    };

    const openHubModal = (queue) => {
        setHubQueue(queue);
        setHubModalOpen(true);
    };

    const closeHubModal = () => {
        setHubModalOpen(false);
        setHubQueue(null);
    };

    const openDocumentModal = (queue) => {
        setDocumentQueue(queue);
        setDocumentModalOpen(true);
    };

    const closeDocumentModal = () => {
        setDocumentModalOpen(false);
        setDocumentQueue(null);
    };

    const handleDelete = (queue) => {
        if (!queue?.id) return;
        confirmDelete({
            message: 'Delete this job completely? This will remove the job, containers, and related records.',
            onConfirm: () => {
                router.delete(route('job-queues.destroy', queue.id), {
                    onSuccess: () => {
                        // Re-fetch the list while keeping current filters.
                        const nextPage = jobQueues?.current_page ?? 1;
                        router.get(route('job-queues.index'), { ...filterQuery(), page: nextPage }, { preserveState: false, replace: true });
                    },
                });
            },
        });
    };

    const submitSearch = (e) => {
        e.preventDefault();
        router.get(route('job-queues.index'), { ...filterQuery(), page: 1 }, { preserveState: true, replace: true });
    };

    const formatDate = (value) => {
        if (!value) return '—';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatWeight = (w) => {
        if (w == null || w === '') return '—';
        const n = Number(w);
        return Number.isFinite(n) ? n.toFixed(2) : w;
    };

    const toggleSelectAll = (checked) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                pageIds.forEach((id) => next.add(id));
            } else {
                pageIds.forEach((id) => next.delete(id));
            }
            return next;
        });
    };

    const toggleRow = (id, checked) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    const goToPage = (page) => {
        const q = { ...filterQuery() };
        if (page > 1) q.page = page;
        router.get(route('job-queues.index'), q, { preserveState: true, replace: true });
    };

    const statusCards = [
        ['IN_PROCESS', 'In Process'],
        ['PENDING_TBA', 'Pending TBA'],
        ['ACTIVE', 'Active'],
        ['URGENT', 'Urgent'],
        ['DEMURRAGE', 'Demurrage'],
        ['DETENTION', 'Detention'],
        ['DG', 'DG'],
        ['LIVE_UL', 'LiveUnLoad'],
    ];

    const total = jobQueues.total ?? 0;
    const from = total === 0 ? 0 : jobQueues.from ?? 0;
    const to = jobQueues.to ?? 0;
    const lastPage = jobQueues.last_page ?? 1;
    const currentPage = jobQueues.current_page ?? 1;
    const hasSelection = selectedIds.size > 0;
    const selectedDispatchQueue = useMemo(() => {
        if (selectedIds.size !== 1) return null;
        const id = [...selectedIds][0];
        return jobQueues.data.find((row) => row.id === id) ?? null;
    }, [selectedIds, jobQueues.data]);
    const canDispatch = selectedDispatchQueue != null && dispatchAssignments.length > 0;
    const hasExportableRows = jobQueues.data.some((q) => selectedIds.has(q.id));
    const exportRows = useMemo(
        () => jobQueues.data.filter((q) => selectedIds.has(q.id)),
        [jobQueues.data, selectedIds],
    );

    const selectClass =
        'mt-1 block w-full rounded border border-gray-300 bg-white py-1.5 pl-2 pr-8 text-sm text-gray-800 shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]';

    return (
        <AuthenticatedLayout>
            <Head title="Job Queue" />

            <div className="min-w-0 max-w-full space-y-6 font-sans text-gray-800">
                <h2 className="text-2xl font-semibold text-gray-800">Job Queue</h2>

                {flash?.success && (
                    <div className="rounded-md bg-green-50 p-4 text-green-800">{flash.success}</div>
                )}

                <div className="max-w-full overflow-x-auto rounded-lg border border-gray-200 bg-white p-3">
                    <div className="grid min-w-[980px] grid-cols-8 gap-3">
                        {statusCards.map(([key, label]) => {
                            const active = data.status === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                        const nextStatus = active ? '' : key;
                                        setData('status', nextStatus);
                                        applyFilters({ status: nextStatus, page: 1 });
                                    }}
                                    aria-pressed={active}
                                    className={[
                                        'rounded-md border px-3 py-2 text-center shadow-sm transition-colors',
                                        active ? 'border-[#17a2b8] bg-[#17a2b8]/10' : 'border-gray-200 bg-white',
                                    ].join(' ')}
                                >
                                    <div className={active ? 'text-lg font-semibold text-[#17a2b8]' : 'text-lg font-semibold text-gray-900'}>
                                        {statusCounts?.[key] || 0}
                                    </div>
                                    <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="flex h-[calc(100vh-16rem)] min-h-[320px] w-full min-w-0 max-w-full flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    {/* Toolbar */}
                    <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-3">
                        <p className="text-sm font-bold text-gray-900">
                            Displaying {total} {total === 1 ? 'Job' : 'Jobs'}
                        </p>
                        <div className="flex flex-wrap items-end gap-3">
                            <div className="w-[8.5rem]">
                                <InputLabel htmlFor="movement_type" value="Movement Type" className="text-xs font-normal text-gray-700" />
                                <select
                                    id="movement_type"
                                    className={selectClass}
                                    value={data.movement_type}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        setData('movement_type', v);
                                        applyFilters({ movement_type: v, page: 1 });
                                    }}
                                >
                                    <option value="">All</option>
                                    {Object.entries(movementTypeOptions || {}).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-[8.5rem]">
                                <InputLabel htmlFor="search_by" value="Search By" className="text-xs font-normal text-gray-700" />
                                <select id="search_by" className={selectClass} defaultValue="all">
                                    <option value="all">All</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2 pb-0.5">
                                <button
                                    type="button"
                                    title="Refresh"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded border border-gray-300 bg-white text-gray-600 shadow-sm hover:bg-gray-50"
                                    onClick={() => {
                                        // Force a real navigation (full page refresh) without query params.
                                        // User wants: http://.../job-queues (not including status/per_page/page).
                                        const path = route('job-queues.index');
                                        const url = new URL(path, window.location.origin);
                                        window.location.assign(url.toString());
                                    }}
                                >
                                    <IconRefresh />
                                </button>
                                <button
                                    type="button"
                                    disabled={!canDispatch}
                                    onClick={() => canDispatch && setDispatchModalOpen(true)}
                                    title={
                                        !hasSelection
                                            ? 'Select a job'
                                            : selectedIds.size > 1
                                              ? 'Select only one job to dispatch'
                                              : !dispatchAssignments.length
                                                ? 'No driver–vehicle assignments available'
                                                : 'Dispatch selected job'
                                    }
                                    className={[
                                        'inline-flex items-center gap-2 rounded border px-3 py-2 text-sm font-medium shadow-sm disabled:cursor-not-allowed disabled:opacity-60',
                                        canDispatch
                                            ? 'border-transparent text-white hover:opacity-95'
                                            : 'border-gray-300 bg-gray-100 text-gray-500',
                                    ].join(' ')}
                                    style={canDispatch ? { backgroundColor: TEAL } : undefined}
                                >
                                    <IconTruck />
                                    Dispatch
                                </button>
                                <button
                                    type="button"
                                    disabled={!hasExportableRows}
                                    onClick={() => setExportModalOpen(true)}
                                    className="inline-flex items-center gap-2 rounded border border-transparent px-3 py-2 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                                    style={{ backgroundColor: TEAL }}
                                >
                                    <IconExport />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table controls */}
                    <form
                        onSubmit={submitSearch}
                        className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-4 py-2.5"
                    >
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span>Show</span>
                            <select
                                className="rounded border border-gray-300 bg-white py-1 pl-2 pr-7 text-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                value={data.per_page}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setData('per_page', v);
                                    applyFilters({ per_page: v, page: 1 });
                                }}
                            >
                                {[10, 25, 50, 100].map((n) => (
                                    <option key={n} value={String(n)}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                            <span>entries</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-700">Search:</span>
                            <TextInput
                                id="search"
                                className="block w-52 rounded-md border-gray-300 py-1.5 text-sm shadow-sm"
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                placeholder=""
                            />
                            <button
                                type="submit"
                                className="sr-only"
                                tabIndex={-1}
                                disabled={processing}
                            >
                                Apply search
                            </button>
                        </div>
                    </form>

                    <div className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-x-contain">
                        <table className="w-max min-w-full border-collapse text-sm">
                            <thead className="sticky top-0 z-10 shadow-[0_1px_0_0_rgb(209_213_219)]">
                                <tr className="border-b border-gray-300 bg-gray-100">
                                    <th className="border border-gray-200 px-2 py-2 text-left">
                                        <input
                                            ref={masterRef}
                                            type="checkbox"
                                            className="rounded border-gray-400 text-[#17a2b8] focus:ring-[#17a2b8]"
                                            checked={allOnPageSelected && pageIds.length > 0}
                                            onChange={(e) => toggleSelectAll(e.target.checked)}
                                            aria-label="Select all on this page"
                                        />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Container Number
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        From
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        To
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Job Number
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        ISO Code
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Weight
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Truck
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Available Date
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        DG
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Branch Name
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        E/F
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Release / Random
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        ECN
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Job Type
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Trip Code
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Job Status
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Created Date
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        L/UL
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Demurrage Date
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Detention Days
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Do After Date
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        ShippingLine
                                        <SortArrows />
                                    </th>
                                    <th className="border border-gray-200 px-2 py-2 text-left font-semibold text-gray-800">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobQueues.data.length === 0 && (
                                    <tr>
                                        <td colSpan={24} className="border border-gray-200 px-3 py-10 text-center text-gray-500">
                                            No job queue records found.
                                        </td>
                                    </tr>
                                )}

                                {jobQueues.data.map((queue, rowIndex) => (
                                    <tr
                                        key={queue.id}
                                        className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                    >
                                        <td className="border border-gray-200 px-2 py-1.5 align-middle">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-400 text-[#17a2b8] focus:ring-[#17a2b8]"
                                                checked={selectedIds.has(queue.id)}
                                                onChange={(e) => toggleRow(queue.id, e.target.checked)}
                                                aria-label={`Select job ${queue.id}`}
                                            />
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.container_number || '—'}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.from_location || '—'}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.to_location || '—'}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left font-medium text-gray-900">
                                            {queue.job_number || `#${queue.jobable_id}`}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.iso_code || '—'}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {formatWeight(queue.weight)}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.truck || '—'}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {formatDate(queue.available_date)}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.dg ? 'Yes' : 'No'}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.branch_name || '—'}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.ef || '—'}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.release_random || '—'}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.ecn || '—'}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.job_type || getMovementLabel(queue.jobable_type)}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.trip_code || '—'}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                                                {data.status && STATUS_FILTER_LABELS[data.status]
                                                    ? STATUS_FILTER_LABELS[data.status]
                                                    : STATUS_LABELS[queue.status] || queue.status}
                                            </span>
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {formatDate(queue.created_date)}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.live_ul ? 'Yes' : 'No'}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {formatDate(queue.demurrage_date)}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.detention_days ?? '—'}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {formatDate(queue.do_after_date)}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            {queue.shipping_line || '—'}
                                        </td>
                                        <td className="border border-gray-200 px-2 py-1.5 text-left text-gray-800">
                                            <JobQueueRowActions
                                                queue={queue}
                                                onEdit={() => openEditModal(queue)}
                                                onAddHub={() => openHubModal(queue)}
                                                onAddDocument={() => openDocumentModal(queue)}
                                                onDelete={() => handleDelete(queue)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-white px-4 py-3">
                        <p className="text-sm text-gray-700">
                            Showing {from} to {to} of {total} entries
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={currentPage <= 1}
                                onClick={() => goToPage(currentPage - 1)}
                                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {Array.from({ length: lastPage }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => goToPage(page)}
                                    className="min-w-[2.25rem] rounded border px-3 py-1.5 text-sm shadow-sm"
                                    style={
                                        page === currentPage
                                            ? { backgroundColor: TEAL, borderColor: TEAL, color: '#fff' }
                                            : { borderColor: '#d1d5db', backgroundColor: '#fff', color: '#4b5563' }
                                    }
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                type="button"
                                disabled={currentPage >= lastPage}
                                onClick={() => goToPage(currentPage + 1)}
                                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <JobQueueExportModal
                isOpen={exportModalOpen}
                onClose={() => setExportModalOpen(false)}
                rows={exportRows}
                getMovementLabel={getMovementLabel}
                formatDate={formatDate}
                formatWeight={formatWeight}
                statusLabels={STATUS_LABELS}
            />

            <JobQueueEditModal
                isOpen={editModalOpen}
                onClose={closeEditModal}
                queue={editQueue}
                chargeTypes={jobQueueChargeTypes}
            />

            <JobQueueDispatchModal
                isOpen={dispatchModalOpen}
                onClose={() => setDispatchModalOpen(false)}
                queue={selectedDispatchQueue}
                assignments={dispatchAssignments}
            />

            <JobQueueHubModal
                isOpen={hubModalOpen}
                onClose={closeHubModal}
                queue={hubQueue}
                locations={hubLocations}
            />

            <JobQueueDocumentModal
                isOpen={documentModalOpen}
                onClose={closeDocumentModal}
                queue={documentQueue}
            />
        </AuthenticatedLayout>
    );
}
