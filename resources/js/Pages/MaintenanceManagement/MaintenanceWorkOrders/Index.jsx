import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { EyeIcon, PencilIcon, TrashIcon } from '@/Components/Icons';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { confirmDelete } from '@/Utils/confirmDelete';
import { useState } from 'react';

const TEAL = '#20A4AC';
const TEAL_DARK = '#178089';

function vehicleLabel(v) {
    if (!v) return '—';
    const reg = v.registration_no || '';
    const name = v.name || '';
    if (reg && name) return `${reg} — ${name}`;
    return reg || name || '—';
}

function vehicleThumb(v) {
    if (!v?.image) return null;
    const src = v.image.startsWith('http') ? v.image : `/storage/${v.image}`;
    return src;
}

function formatDateRange(start, end) {
    const fmt = (s) => {
        if (!s) return '';
        const d = new Date(`${String(s).slice(0, 10)}T12:00:00`);
        if (Number.isNaN(d.getTime())) return String(s).slice(0, 10);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const a = fmt(start);
    const b = fmt(end);
    if (a && b) return `${a} to ${b}`;
    return a || b || '—';
}

function formatMaintMoney(currency, amount) {
    const code = (currency || 'NZD').toUpperCase();
    const n = Number(amount);
    const safe = Number.isFinite(n) ? n : 0;
    try {
        return new Intl.NumberFormat('en-NZ', {
            style: 'currency',
            currency: code,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(safe);
    } catch {
        return `${code} ${safe.toFixed(2)}`;
    }
}

function priorityBadge(priority) {
    let bg = '#e5e7eb';
    let color = '#374151';
    if (priority === 'high') {
        bg = '#fef3c7';
        color = '#b45309';
    } else if (priority === 'critical') {
        bg = '#fee2e2';
        color = '#b91c1c';
    }
    return (
        <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize" style={{ backgroundColor: bg, color }}>
            {priority}
        </span>
    );
}

function statusLabel(s) {
    const map = {
        planned: 'Planned',
        in_progress: 'In Progress',
        completed: 'Completed',
        cancelled: 'Cancelled',
    };
    return map[s] || s;
}

function PaperclipIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
        </svg>
    );
}

function DocumentListIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    );
}

function NavCard({ href, title, icon, accent }) {
    return (
        <Link
            href={href}
            className="flex flex-1 min-w-[140px] items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
            style={{ borderTopWidth: 3, borderTopColor: accent }}
        >
            <span className="text-2xl" aria-hidden>
                {icon}
            </span>
            <span className="text-sm font-semibold text-gray-800">{title}</span>
        </Link>
    );
}

export default function Index({ records, filters, counts }) {
    const [viewMode, setViewMode] = useState('table');

    const searchForm = useForm({
        search: filters?.search || '',
        status: filters?.status || '',
    });

    const submitSearch = (e) => {
        e.preventDefault();
        searchForm.get(route('maintenance-management.index'), { preserveState: true, replace: true });
    };

    const setStatusFilter = (status) => {
        router.get(
            route('maintenance-management.index'),
            { search: filters?.search || '', status: status || '' },
            { preserveState: true, replace: true },
        );
    };

    const patchStatus = (id, status) => {
        router.patch(
            route('maintenance-management.update-status', id),
            { status },
            { preserveScroll: true },
        );
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Remove this maintenance record?',
            onConfirm: () => {
                router.delete(route('maintenance-management.destroy', id));
            },
        });
    };

    const activeStatus = filters?.status || '';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Maintenance Management</h2>
                        <p className="mt-1 text-sm text-gray-500">
                            <Link href={route('dashboard')} className="hover:underline">
                                Dashboard
                            </Link>
                            <span className="mx-1">/</span>
                            <span>Maintenance</span>
                        </p>
                    </div>
                    <Link
                        href={route('maintenance-management.create')}
                        className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95"
                        style={{ backgroundColor: TEAL }}
                    >
                        + Add Maintenance
                    </Link>
                </div>
            }
        >
            <Head title="Maintenance Management" />

            <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex flex-wrap gap-3">
                    <NavCard href={route('pms-scheduler.index')} title="PMS Scheduler" icon="📅" accent="#2563eb" />
                    <NavCard href={route('incident-reports.index')} title="Incident Reports" icon="⚠" accent="#dc2626" />
                    <NavCard href={route('tyre-management.index')} title="Tyre Management" icon="🛞" accent="#eab308" />
                    <NavCard href={route('maintenance-analytics.index')} title="Cost Analytics" icon="📊" accent={TEAL} />
                </div>

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('')}
                            className={`font-semibold ${activeStatus === '' ? 'underline decoration-2' : 'text-gray-600 hover:text-gray-900'}`}
                            style={activeStatus === '' ? { color: '#2563eb' } : {}}
                        >
                            <span className="mr-1 text-lg font-bold" style={{ color: '#2563eb' }}>
                                {counts?.all ?? 0}
                            </span>
                            All Statuses
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('planned')}
                            className={`font-semibold ${activeStatus === 'planned' ? 'underline decoration-2' : 'text-gray-600 hover:text-gray-900'}`}
                            style={activeStatus === 'planned' ? { color: TEAL } : {}}
                        >
                            <span className="mr-1 text-lg font-bold" style={{ color: TEAL }}>
                                {counts?.planned ?? 0}
                            </span>
                            Planned
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('in_progress')}
                            className={`font-semibold ${activeStatus === 'in_progress' ? 'underline decoration-2' : 'text-gray-600 hover:text-gray-900'}`}
                            style={activeStatus === 'in_progress' ? { color: '#ca8a04' } : {}}
                        >
                            <span className="mr-1 text-lg font-bold text-amber-600">{counts?.in_progress ?? 0}</span>
                            In Progress
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('completed')}
                            className={`font-semibold ${activeStatus === 'completed' ? 'underline decoration-2' : 'text-gray-600 hover:text-gray-900'}`}
                            style={activeStatus === 'completed' ? { color: '#16a34a' } : {}}
                        >
                            <span className="mr-1 text-lg font-bold text-green-600">{counts?.completed ?? 0}</span>
                            Completed
                        </button>
                    </div>

                    <form onSubmit={submitSearch} className="flex flex-wrap items-end gap-3">
                        <div>
                            <InputLabel htmlFor="search" value="Search" />
                            <TextInput
                                id="search"
                                className="mt-1 w-56"
                                placeholder="Vehicle name…"
                                value={searchForm.data.search}
                                onChange={(e) => searchForm.setData('search', e.target.value)}
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="fstatus" value="Status" />
                            <select
                                id="fstatus"
                                className="mt-1 block w-44 rounded-md border-gray-300 shadow-sm"
                                value={searchForm.data.status}
                                onChange={(e) => searchForm.setData('status', e.target.value)}
                            >
                                <option value="">All Statuses</option>
                                <option value="planned">Planned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <SecondaryButton type="submit" disabled={searchForm.processing}>
                            Filter
                        </SecondaryButton>
                        <div className="flex gap-1 rounded-md border border-gray-200 p-1">
                            <button
                                type="button"
                                className={`rounded px-2 py-1 text-xs font-semibold ${viewMode === 'table' ? 'text-white' : 'bg-white text-gray-600'}`}
                                style={viewMode === 'table' ? { backgroundColor: TEAL_DARK } : {}}
                                onClick={() => setViewMode('table')}
                            >
                                List
                            </button>
                            <button
                                type="button"
                                className={`rounded px-2 py-1 text-xs font-semibold ${viewMode === 'grid' ? 'text-white' : 'bg-white text-gray-600'}`}
                                style={viewMode === 'grid' ? { backgroundColor: TEAL_DARK } : {}}
                                onClick={() => setViewMode('grid')}
                            >
                                Grid
                            </button>
                        </div>
                    </form>
                </div>

                {viewMode === 'table' ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">#</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Vehicle</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Priority</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Date</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Vendor</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Service</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Cost</th>
                                        <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                                        <th className="px-3 py-2 text-right font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {records.data?.map((row, idx) => (
                                        <tr key={row.id} className={idx % 2 === 1 ? 'bg-gray-50/80' : 'bg-white'}>
                                            <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                                                {(records.current_page - 1) * records.per_page + idx + 1}
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex items-center gap-2">
                                                    {vehicleThumb(row.vehicle) ? (
                                                        <img
                                                            src={vehicleThumb(row.vehicle)}
                                                            alt=""
                                                            className="h-9 w-9 rounded object-cover"
                                                        />
                                                    ) : (
                                                        <div
                                                            className="flex h-9 w-9 items-center justify-center rounded text-xs text-white"
                                                            style={{ backgroundColor: TEAL_DARK }}
                                                        >
                                                            🚚
                                                        </div>
                                                    )}
                                                    <span className="font-medium text-gray-900">{vehicleLabel(row.vehicle)}</span>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2">{priorityBadge(row.priority)}</td>
                                            <td className="whitespace-nowrap px-3 py-2 text-gray-700">
                                                {formatDateRange(row.start_date, row.end_date)}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">{row.maintenance_vendor?.name || '—'}</td>
                                            <td className="max-w-xs truncate px-3 py-2 text-gray-700" title={row.service_details}>
                                                {row.service_details || '—'}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 font-medium text-gray-900">
                                                {formatMaintMoney(row.currency, row.total_cost)}
                                                {row.invoice_receipt_path ? (
                                                    <PaperclipIcon className="ml-1 inline h-4 w-4 text-gray-500" />
                                                ) : null}
                                            </td>
                                            <td className="px-3 py-2">
                                                <select
                                                    className="rounded-md border-gray-300 text-xs shadow-sm"
                                                    value={row.status}
                                                    onChange={(e) => patchStatus(row.id, e.target.value)}
                                                >
                                                    <option value="planned">{statusLabel('planned')}</option>
                                                    <option value="in_progress">{statusLabel('in_progress')}</option>
                                                    <option value="completed">{statusLabel('completed')}</option>
                                                    <option value="cancelled">{statusLabel('cancelled')}</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <div className="flex justify-end gap-1">
                                                    <Link
                                                        href={route('maintenance-management.show', row.id)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded bg-gray-900 text-white hover:opacity-90"
                                                        title="Job card"
                                                    >
                                                        <DocumentListIcon className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={route('maintenance-management.show', row.id)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded text-white hover:opacity-90"
                                                        style={{ backgroundColor: TEAL }}
                                                        title="View"
                                                    >
                                                        <EyeIcon className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={route('maintenance-management.edit', row.id)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-white hover:bg-blue-700"
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => destroy(row.id)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded bg-red-600 text-white hover:bg-red-700"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {records.links?.length > 3 && (
                            <div className="flex flex-wrap gap-2 border-t border-gray-100 px-4 py-3 text-sm">
                                {records.links.map((l, i) =>
                                    l.url ? (
                                        <Link
                                            key={i}
                                            href={l.url}
                                            className={`rounded px-2 py-1 ${l.active ? 'font-semibold text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                            style={l.active ? { backgroundColor: TEAL } : {}}
                                            dangerouslySetInnerHTML={{ __html: l.label }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="px-2 py-1 text-gray-400"
                                            dangerouslySetInnerHTML={{ __html: l.label }}
                                        />
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {records.data?.map((row) => (
                            <div
                                key={row.id}
                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                                style={{ borderTopWidth: 4, borderTopColor: TEAL }}
                            >
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <div className="font-semibold text-gray-900">{vehicleLabel(row.vehicle)}</div>
                                    {priorityBadge(row.priority)}
                                </div>
                                <p className="mb-2 text-xs text-gray-500">{formatDateRange(row.start_date, row.end_date)}</p>
                                <p className="mb-3 line-clamp-2 text-sm text-gray-700">{row.service_details || '—'}</p>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{formatMaintMoney(row.currency, row.total_cost)}</span>
                                    <select
                                        className="rounded border-gray-300 text-xs"
                                        value={row.status}
                                        onChange={(e) => patchStatus(row.id, e.target.value)}
                                    >
                                        <option value="planned">Planned</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="mt-3 flex justify-end gap-1">
                                    <Link
                                        href={route('maintenance-management.show', row.id)}
                                        className="rounded bg-gray-900 px-2 py-1 text-xs text-white"
                                    >
                                        View
                                    </Link>
                                    <Link
                                        href={route('maintenance-management.edit', row.id)}
                                        className="rounded bg-blue-600 px-2 py-1 text-xs text-white"
                                    >
                                        Edit
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
