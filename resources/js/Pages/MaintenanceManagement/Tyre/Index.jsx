import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { TrashIcon } from '@/Components/Icons';
import { confirmDelete } from '@/Utils/confirmDelete';

const TEAL = '#20A4AC';
const TEAL_DARK = '#178089';

const POSITION_OPTIONS = [
    'Front-Left',
    'Front-Right',
    'Rear-Left',
    'Rear-Right',
    'Rear-Left-Inner',
    'Rear-Right-Inner',
    'Rear-Left-Outer',
    'Rear-Right-Outer',
    'Spare',
];

function vehicleLabel(v) {
    const reg = v.registration_no || '';
    const name = v.name || '';
    if (reg && name) return `${reg} — ${name}`;
    return reg || name || `Vehicle #${v.id}`;
}

function formatInstallDate(value) {
    if (!value) return '—';
    const s = String(value).slice(0, 10);
    const d = new Date(`${s}T12:00:00`);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatOdometer(km) {
    if (km === null || km === undefined || km === '') return '';
    const n = Number(km);
    if (Number.isNaN(n)) return '';
    return `${n.toLocaleString('en-GB')} km`;
}

export default function Index({ tyres, filters, vehicles }) {
    const searchForm = useForm({
        search: filters?.search || '',
    });

    const addForm = useForm({
        vehicle_id: '',
        position: '',
        serial_number: '',
        brand_model: '',
        install_date: '',
        install_odometer_km: '',
    });

    const submitSearch = (e) => {
        e.preventDefault();
        searchForm.get(route('tyre-management.index'), { preserveState: true, replace: true });
    };

    const submitAdd = (e) => {
        e.preventDefault();
        addForm.post(route('tyre-management.store'), {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset();
                addForm.clearErrors();
            },
        });
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Remove this tyre record?',
            onConfirm: () => {
                router.delete(route('tyre-management.destroy', id));
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 sm:text-3xl">Tyre Management</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        <Link href={route('dashboard')} className="text-[#178089] hover:underline">
                            Dashboard
                        </Link>
                        <span className="mx-1 text-gray-400">/</span>
                        <span className="text-gray-600">Tyres</span>
                    </p>
                </div>
            }
        >
            <Head title="Tyre Management" />

            <div className="py-1">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                        {/* Add New Tyre — left column */}
                        <div className="lg:col-span-4">
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div
                                    className="px-4 py-3 text-center text-sm font-semibold text-white sm:text-base"
                                    style={{ backgroundColor: TEAL }}
                                >
                                    Add New Tyre
                                </div>
                                <form onSubmit={submitAdd} className="space-y-4 p-4 sm:p-5">
                                    <div>
                                        <InputLabel htmlFor="tyre-vehicle" value="Vehicle" />
                                        <select
                                            id="tyre-vehicle"
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
                                        <InputLabel htmlFor="tyre-position" value="Position" />
                                        <select
                                            id="tyre-position"
                                            value={addForm.data.position}
                                            onChange={(e) => addForm.setData('position', e.target.value)}
                                            className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                        >
                                            <option value="">Select position</option>
                                            {POSITION_OPTIONS.map((p) => (
                                                <option key={p} value={p}>
                                                    {p}
                                                </option>
                                            ))}
                                        </select>
                                        {addForm.errors.position && (
                                            <p className="mt-1 text-sm text-red-600">{addForm.errors.position}</p>
                                        )}
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="tyre-serial" value="Serial Number" />
                                        <TextInput
                                            id="tyre-serial"
                                            className="mt-1.5 block w-full"
                                            value={addForm.data.serial_number}
                                            onChange={(e) => addForm.setData('serial_number', e.target.value)}
                                            placeholder="Unique SN"
                                            maxLength={120}
                                        />
                                        {addForm.errors.serial_number && (
                                            <p className="mt-1 text-sm text-red-600">{addForm.errors.serial_number}</p>
                                        )}
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="tyre-brand" value="Brand / Model" />
                                        <TextInput
                                            id="tyre-brand"
                                            className="mt-1.5 block w-full"
                                            value={addForm.data.brand_model}
                                            onChange={(e) => addForm.setData('brand_model', e.target.value)}
                                            placeholder="e.g. Michelin X Multi"
                                            maxLength={160}
                                        />
                                        {addForm.errors.brand_model && (
                                            <p className="mt-1 text-sm text-red-600">{addForm.errors.brand_model}</p>
                                        )}
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="tyre-install-date" value="Install Date" />
                                        <TextInput
                                            id="tyre-install-date"
                                            type="date"
                                            className="mt-1.5 block w-full"
                                            value={addForm.data.install_date}
                                            onChange={(e) => addForm.setData('install_date', e.target.value)}
                                        />
                                        {addForm.errors.install_date && (
                                            <p className="mt-1 text-sm text-red-600">{addForm.errors.install_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="tyre-odo" value="Install Odometer" />
                                        <TextInput
                                            id="tyre-odo"
                                            type="number"
                                            min={0}
                                            className="mt-1.5 block w-full"
                                            value={addForm.data.install_odometer_km}
                                            onChange={(e) => addForm.setData('install_odometer_km', e.target.value)}
                                            placeholder="KM at installation"
                                        />
                                        {addForm.errors.install_odometer_km && (
                                            <p className="mt-1 text-sm text-red-600">{addForm.errors.install_odometer_km}</p>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={addForm.processing}
                                        className="w-full rounded-lg py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:opacity-50"
                                        style={{ backgroundColor: TEAL }}
                                    >
                                        Add Tyre
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Table — right column */}
                        <div className="lg:col-span-8">
                            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                                <div className="border-b border-gray-100 px-4 py-3 sm:px-5">
                                    <form onSubmit={submitSearch} className="flex flex-wrap items-end gap-2">
                                        <div className="min-w-[180px] flex-1">
                                            <InputLabel htmlFor="tyre-search" value="Search:" />
                                            <TextInput
                                                id="tyre-search"
                                                className="mt-1 block w-full"
                                                value={searchForm.data.search}
                                                onChange={(e) => searchForm.setData('search', e.target.value)}
                                                placeholder="Serial, brand, position, vehicle…"
                                            />
                                        </div>
                                        <SecondaryButton type="submit" disabled={searchForm.processing}>
                                            Go
                                        </SecondaryButton>
                                    </form>
                                </div>

                                <div className="overflow-x-auto p-2 sm:p-4">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead>
                                            <tr className="bg-gray-50">
                                                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Vehicle
                                                </th>
                                                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Position
                                                </th>
                                                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Serial No.
                                                </th>
                                                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Brand
                                                </th>
                                                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Install Date
                                                </th>
                                                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {tyres.data.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="px-3 py-10 text-center text-gray-500">
                                                        No tyres found.
                                                    </td>
                                                </tr>
                                            )}
                                            {tyres.data.map((tyre) => (
                                                <tr key={tyre.id} className="hover:bg-gray-50/80">
                                                    <td className="px-3 py-2.5 text-gray-800">
                                                        {tyre.vehicle ? vehicleLabel(tyre.vehicle) : '—'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-2.5 text-gray-700">{tyre.position}</td>
                                                    <td className="px-3 py-2.5 text-gray-700">{tyre.serial_number || '—'}</td>
                                                    <td className="px-3 py-2.5 text-gray-700">{tyre.brand_model || '—'}</td>
                                                    <td className="px-3 py-2.5 text-gray-700">
                                                        <div>{formatInstallDate(tyre.install_date)}</div>
                                                        {tyre.install_odometer_km != null && tyre.install_odometer_km !== '' && (
                                                            <div className="text-xs text-gray-500">{formatOdometer(tyre.install_odometer_km)}</div>
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => destroy(tyre.id)}
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white shadow-sm transition-colors hover:bg-red-700"
                                                            title="Delete"
                                                            aria-label="Delete tyre"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {tyres.last_page > 1 && (
                                    <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-4 py-3 text-sm">
                                        <button
                                            type="button"
                                            disabled={!tyres.prev_page_url}
                                            onClick={() => tyres.prev_page_url && router.visit(tyres.prev_page_url)}
                                            className="rounded-lg px-3 py-1.5 disabled:opacity-40"
                                            style={{ border: `1px solid ${TEAL}`, color: TEAL_DARK }}
                                        >
                                            Previous
                                        </button>
                                        <span
                                            className="rounded-lg px-3 py-1.5 font-semibold text-white"
                                            style={{ backgroundColor: TEAL }}
                                        >
                                            {tyres.current_page} / {tyres.last_page}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={!tyres.next_page_url}
                                            onClick={() => tyres.next_page_url && router.visit(tyres.next_page_url)}
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
        </AuthenticatedLayout>
    );
}
