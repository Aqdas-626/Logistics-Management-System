import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import IncidentReportModal from '@/Components/MaintenanceManagement/IncidentReportModal';
import MaintenanceTicketModal from '@/Components/MaintenanceManagement/MaintenanceTicketModal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon } from '@/Components/Icons';
import { confirmDelete } from '@/Utils/confirmDelete';

const TEAL = '#20A4AC';
const TEAL_DARK = '#178089';

function vehicleLabel(v) {
    if (!v) return '—';
    const reg = v.registration_no || '';
    const name = v.name || '';
    if (reg && name) return `${reg} — ${name}`;
    return reg || name || '—';
}

function formatReportDate(value) {
    if (!value) return '—';
    const s = String(value).slice(0, 10);
    const d = new Date(`${s}T12:00:00`);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusLabel(status) {
    const map = {
        open: 'Open',
        converted_to_maintenance: 'Converted To Maintenance',
        closed: 'Closed',
        cancelled: 'Cancelled',
    };
    return map[status] || status;
}

function StatusBadge({ status }) {
    const label = statusLabel(status);
    let bg = '#e5e7eb';
    let color = '#374151';
    if (status === 'converted_to_maintenance') {
        bg = '#20A4AC';
        color = '#fff';
    } else if (status === 'open') {
        bg = '#E8F6F7';
        color = '#178089';
    } else if (status === 'closed') {
        bg = '#f3f4f6';
        color = '#6b7280';
    } else if (status === 'cancelled') {
        bg = '#fee2e2';
        color = '#b91c1c';
    }
    return (
        <span
            className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
            style={{ backgroundColor: bg, color }}
        >
            {label}
        </span>
    );
}

function LinkChainIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
        </svg>
    );
}

export default function Index({ incidents, filters, vehicles }) {
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [editingIncident, setEditingIncident] = useState(null);
    const [ticketModalIncident, setTicketModalIncident] = useState(null);

    const searchForm = useForm({
        search: filters?.search || '',
    });

    const submitSearch = (e) => {
        e.preventDefault();
        searchForm.get(route('incident-reports.index'), { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditingIncident(null);
        setReportModalOpen(true);
    };

    const openEdit = (row) => {
        setEditingIncident(row);
        setReportModalOpen(true);
    };

    const closeReportModal = () => {
        setReportModalOpen(false);
        setEditingIncident(null);
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Remove this incident report?',
            onConfirm: () => {
                router.delete(route('incident-reports.destroy', id));
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-semibold text-gray-800 sm:text-3xl">Incident Reports</h2>
                        <button
                            type="button"
                            onClick={openCreate}
                            className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
                            style={{ backgroundColor: TEAL }}
                        >
                            <PlusIcon className="h-4 w-4" />
                            Report Issue
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 sm:text-right">
                        <Link href={route('dashboard')} className="text-[#178089] hover:underline">
                            Dashboard
                        </Link>
                        <span className="mx-1 text-gray-400">/</span>
                        <span className="text-gray-600">Incidents</span>
                    </p>
                </div>
            }
        >
            <Head title="Incident Reports" />

            <div className="py-1">
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 px-4 py-3 sm:px-6">
                            <form onSubmit={submitSearch} className="flex flex-wrap items-end gap-2">
                                <div className="min-w-[200px] flex-1">
                                    <InputLabel htmlFor="inc-search" value="Search:" />
                                    <TextInput
                                        id="inc-search"
                                        className="mt-1 block w-full"
                                        value={searchForm.data.search}
                                        onChange={(e) => searchForm.setData('search', e.target.value)}
                                        placeholder="Description, vehicle, reporter…"
                                    />
                                </div>
                                <SecondaryButton type="submit" disabled={searchForm.processing}>
                                    Go
                                </SecondaryButton>
                            </form>
                        </div>

                        <div className="overflow-x-auto p-2 sm:p-4">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            S.No
                                        </th>
                                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Vehicle
                                        </th>
                                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Reported By
                                        </th>
                                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Description
                                        </th>
                                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Date
                                        </th>
                                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {incidents.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-3 py-10 text-center text-gray-500">
                                                No incident reports found.
                                            </td>
                                        </tr>
                                    )}
                                    {incidents.data.map((row, index) => (
                                        <tr key={row.id} className="hover:bg-gray-50/80">
                                            <td className="whitespace-nowrap px-3 py-2.5 text-gray-700">
                                                {(incidents.current_page - 1) * incidents.per_page + index + 1}
                                            </td>
                                            <td className="max-w-[140px] truncate px-3 py-2.5 text-gray-800" title={vehicleLabel(row.vehicle)}>
                                                {vehicleLabel(row.vehicle)}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-gray-700">
                                                {row.reporter?.name || 'Unknown'}
                                            </td>
                                            <td className="max-w-xs px-3 py-2.5 text-gray-700">
                                                <span className="line-clamp-2" title={row.description}>
                                                    {row.description}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">
                                                {formatReportDate(row.report_date)}
                                            </td>
                                            <td className="px-3 py-2.5">
                                                <StatusBadge status={row.status} />
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-right">
                                                <div className="flex flex-wrap items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setTicketModalIncident(row)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
                                                    >
                                                        <LinkChainIcon className="h-3.5 w-3.5" />
                                                        View Ticket
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(row)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white shadow-sm"
                                                        style={{ backgroundColor: TEAL }}
                                                        title="Edit"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => destroy(row.id)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white shadow-sm hover:bg-red-700"
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

                        {incidents.last_page > 1 && (
                            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3 text-sm">
                                <button
                                    type="button"
                                    disabled={!incidents.prev_page_url}
                                    onClick={() => incidents.prev_page_url && router.visit(incidents.prev_page_url)}
                                    className="rounded-lg px-3 py-1.5 disabled:opacity-40"
                                    style={{ border: `1px solid ${TEAL}`, color: TEAL_DARK }}
                                >
                                    Previous
                                </button>
                                <span
                                    className="rounded-lg px-3 py-1.5 font-semibold text-white"
                                    style={{ backgroundColor: TEAL }}
                                >
                                    {incidents.current_page} / {incidents.last_page}
                                </span>
                                <button
                                    type="button"
                                    disabled={!incidents.next_page_url}
                                    onClick={() => incidents.next_page_url && router.visit(incidents.next_page_url)}
                                    className="rounded-lg px-3 py-1.5 disabled:opacity-40"
                                    style={{ border: `1px solid ${TEAL}`, color: TEAL_DARK }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <IncidentReportModal
                isOpen={reportModalOpen}
                onClose={closeReportModal}
                incident={editingIncident}
                vehicles={vehicles}
            />
            <MaintenanceTicketModal
                isOpen={ticketModalIncident != null}
                onClose={() => setTicketModalIncident(null)}
                incident={ticketModalIncident}
            />
        </AuthenticatedLayout>
    );
}
