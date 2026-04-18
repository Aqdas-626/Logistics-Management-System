import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import PmsRuleModal from '@/Components/MaintenanceManagement/PmsRuleModal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { PencilIcon, TrashIcon } from '@/Components/Icons';
import { confirmDelete } from '@/Utils/confirmDelete';

const TEAL = '#20A4AC';
const TEAL_DARK = '#178089';
const RUN_TEAL = '#0f766e';

function vehicleLabel(v) {
    if (!v) return '—';
    const reg = v.registration_no || '';
    const name = v.name || '';
    if (reg && name) return `${reg} — ${name}`;
    return reg || name || '—';
}

function formatDate(value) {
    if (!value) return '—';
    const s = String(value).slice(0, 10);
    const d = new Date(`${s}T12:00:00`);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function RefreshIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
        </svg>
    );
}

export default function Index({ rules, filters, vehicles }) {
    const [editingRule, setEditingRule] = useState(null);

    const searchForm = useForm({
        search: filters?.search || '',
    });

    const addForm = useForm({
        vehicle_id: '',
        service_name: '',
        interval_km: '',
        interval_days: '',
    });

    const submitSearch = (e) => {
        e.preventDefault();
        searchForm.get(route('pms-scheduler.index'), { preserveState: true, replace: true });
    };

    const submitAdd = (e) => {
        e.preventDefault();
        addForm.post(route('pms-scheduler.store'), {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                addForm.clearErrors();
            },
        });
    };

    const runCheck = () => {
        router.post(route('pms-scheduler.run-check'), {}, { preserveScroll: true });
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Delete this PMS rule?',
            onConfirm: () => {
                router.delete(route('pms-scheduler.destroy', id));
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <h2 className="text-2xl font-semibold text-gray-800 sm:text-3xl">
                        Preventive Maintenance Scheduler (PMS)
                    </h2>
                    <p className="text-sm text-gray-500 sm:text-right">
                        <Link href={route('dashboard')} className="text-[#178089] hover:underline">
                            Dashboard
                        </Link>
                        <span className="mx-1 text-gray-400">/</span>
                        <span className="text-gray-600">Maintenance</span>
                        <span className="mx-1 text-gray-400">/</span>
                        <span className="text-gray-600">PMS</span>
                    </p>
                </div>
            }
        >
            <Head title="PMS Scheduler" />

            <div className="py-1">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        <div className="space-y-6 lg:col-span-4">
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div
                                    className="px-4 py-3 text-center text-sm font-semibold text-white sm:text-left"
                                    style={{ backgroundColor: TEAL }}
                                >
                                    Add New PMS Rule
                                </div>
                                <form onSubmit={submitAdd} className="space-y-4 p-4 sm:p-5">
                                    <div>
                                        <InputLabel htmlFor="pms-vehicle" value="Vehicle" />
                                        <select
                                            id="pms-vehicle"
                                            value={addForm.data.vehicle_id}
                                            onChange={(e) => addForm.setData('vehicle_id', e.target.value)}
                                            className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                        >
                                            <option value="">Select Vehicle</option>
                                            {vehicles.map((v) => (
                                                <option key={v.id} value={v.id}>
                                                    {vehicleLabel(v)}
                                                </option>
                                            ))}
                                        </select>
                                        {addForm.errors.vehicle_id && (
                                            <p className="mt-1 text-sm text-red-600">{addForm.errors.vehicle_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="pms-service" value="Service Name" />
                                        <TextInput
                                            id="pms-service"
                                            className="mt-1.5 block w-full"
                                            value={addForm.data.service_name}
                                            onChange={(e) => addForm.setData('service_name', e.target.value)}
                                            placeholder="e.g. Oil Change, Tyre Rotation"
                                            maxLength={200}
                                        />
                                        {addForm.errors.service_name && (
                                            <p className="mt-1 text-sm text-red-600">{addForm.errors.service_name}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="pms-km" value="Interval (KM)" />
                                            <TextInput
                                                id="pms-km"
                                                type="number"
                                                min={0}
                                                className="mt-1.5 block w-full"
                                                value={addForm.data.interval_km}
                                                onChange={(e) => addForm.setData('interval_km', e.target.value)}
                                                placeholder="e.g. 10000"
                                            />
                                            {addForm.errors.interval_km && (
                                                <p className="mt-1 text-sm text-red-600">{addForm.errors.interval_km}</p>
                                            )}
                                        </div>
                                        <div>
                                            <InputLabel htmlFor="pms-days" value="Interval (Days)" />
                                            <TextInput
                                                id="pms-days"
                                                type="number"
                                                min={0}
                                                className="mt-1.5 block w-full"
                                                value={addForm.data.interval_days}
                                                onChange={(e) => addForm.setData('interval_days', e.target.value)}
                                                placeholder="e.g. 180"
                                            />
                                            {addForm.errors.interval_days && (
                                                <p className="mt-1 text-sm text-red-600">{addForm.errors.interval_days}</p>
                                            )}
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500">
                                        Leave blank if not applicable. At least one interval is recommended.
                                    </p>

                                    <button
                                        type="submit"
                                        disabled={addForm.processing}
                                        className="w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50"
                                        style={{ backgroundColor: TEAL }}
                                    >
                                        Add Rule
                                    </button>
                                </form>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                                <p className="text-sm text-gray-600">Manually check all rules against current vehicle status.</p>
                                <button
                                    type="button"
                                    onClick={runCheck}
                                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
                                    style={{ backgroundColor: RUN_TEAL }}
                                >
                                    <RefreshIcon className="h-4 w-4" />
                                    Run PMS Check
                                </button>
                            </div>
                        </div>

                        <div className="lg:col-span-8">
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
                                    <h3 className="text-base font-semibold text-gray-900">Existing Rules</h3>
                                    <form onSubmit={submitSearch} className="mt-3 flex flex-wrap items-end gap-2">
                                        <div className="min-w-[180px] flex-1">
                                            <InputLabel htmlFor="pms-search" value="Search:" />
                                            <TextInput
                                                id="pms-search"
                                                className="mt-1 block w-full"
                                                value={searchForm.data.search}
                                                onChange={(e) => searchForm.setData('search', e.target.value)}
                                                placeholder="Service, vehicle…"
                                            />
                                        </div>
                                        <SecondaryButton type="submit" disabled={searchForm.processing}>
                                            Go
                                        </SecondaryButton>
                                    </form>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Vehicle
                                                </th>
                                                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Service
                                                </th>
                                                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Interval
                                                </th>
                                                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Last Service
                                                </th>
                                                <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {rules.data.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                                                        No PMS rules yet.
                                                    </td>
                                                </tr>
                                            )}
                                            {rules.data.map((row, index) => (
                                                <tr
                                                    key={row.id}
                                                    className={index % 2 === 1 ? 'bg-gray-50/80' : 'bg-white'}
                                                >
                                                    <td className="px-4 py-2.5 text-gray-800">{vehicleLabel(row.vehicle)}</td>
                                                    <td className="px-4 py-2.5 font-medium text-gray-900">{row.service_name}</td>
                                                    <td className="px-4 py-2.5 text-gray-700">
                                                        <div>
                                                            {row.interval_km != null ? `${Number(row.interval_km).toLocaleString('en-GB')} KM` : '—'}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {row.interval_days != null ? `${row.interval_days} Days` : '—'}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2.5 text-gray-700">
                                                        <div>{formatDate(row.last_service_date)}</div>
                                                        {row.last_service_odometer_km != null && (
                                                            <div className="text-xs text-gray-500">
                                                                {Number(row.last_service_odometer_km).toLocaleString('en-GB')} km
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-2.5 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingRule(row)}
                                                            className="me-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-[#178089] shadow-sm hover:bg-gray-50"
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => destroy(row.id)}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700"
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {rules.last_page > 1 && (
                                    <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3 text-sm">
                                        <button
                                            type="button"
                                            disabled={!rules.prev_page_url}
                                            onClick={() => rules.prev_page_url && router.visit(rules.prev_page_url)}
                                            className="rounded-lg px-3 py-1.5 disabled:opacity-40"
                                            style={{ border: `1px solid ${TEAL}`, color: TEAL_DARK }}
                                        >
                                            Previous
                                        </button>
                                        <span
                                            className="rounded-lg px-3 py-1.5 font-semibold text-white"
                                            style={{ backgroundColor: TEAL }}
                                        >
                                            {rules.current_page} / {rules.last_page}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={!rules.next_page_url}
                                            onClick={() => rules.next_page_url && router.visit(rules.next_page_url)}
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
                </div>
            </div>

            <PmsRuleModal
                isOpen={editingRule != null}
                onClose={() => setEditingRule(null)}
                rule={editingRule}
                vehicles={vehicles}
            />
        </AuthenticatedLayout>
    );
}
