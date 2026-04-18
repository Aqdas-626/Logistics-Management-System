import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { EyeIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon } from '@/Components/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { confirmDelete } from '@/Utils/confirmDelete';
import { useEffect, useState } from 'react';

const TEAL = '#20A4AC';
const TEAL_DARK = '#178089';

const OWNERSHIP_LABEL = {
    company_owned: 'Owned',
    leased: 'Leased',
    rented: 'Rented',
    vendor_owned: 'Vendor owned',
};

function vehicleImageSrc(v) {
    if (!v?.image) return null;
    return v.image.startsWith('http') ? v.image : `/storage/${v.image}`;
}

function displayName(v) {
    return v.name?.trim() || v.registration_no || `Vehicle #${v.id}`;
}

function subtitleLine(v) {
    const reg = v.registration_no || '—';
    const year = v.created_at ? String(v.created_at).slice(0, 4) : '—';
    const type = v.vehicle_type?.name || '—';
    return `${reg} | ${year} | ${type}`;
}

function firstActiveDriver(v) {
    const list = v.driver_assignments || v.driverAssignments || [];
    const row = list[0];
    return row?.driver?.name || null;
}

function earliestExpiryDates(docs) {
    let reg = null;
    let ins = null;
    for (const d of docs || []) {
        if (d.registration_expiry) {
            const s = String(d.registration_expiry).slice(0, 10);
            if (!reg || s < reg) reg = s;
        }
        if (d.insurance_expiry) {
            const s = String(d.insurance_expiry).slice(0, 10);
            if (!ins || s < ins) ins = s;
        }
    }
    return { reg, ins };
}

function formatShortDate(iso) {
    if (!iso) return '—';
    const d = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(iso) {
    if (!iso) return null;
    const d = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
}

function fuelPercent(v) {
    const cap = Number(v.fuel_capacity);
    const cur = Number(v.current_fuel);
    if (!cap || cap <= 0 || cur == null || Number.isNaN(cur)) return null;
    return Math.min(100, Math.max(0, (cur / cap) * 100));
}

function FleetChip({ active, onClick, children, className = '', ringClass = 'ring-blue-400' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-semibold transition ${
                active ? `ring-2 ring-offset-1 ${ringClass}` : 'hover:opacity-90'
            } ${className}`}
        >
            {children}
        </button>
    );
}

function VehicleRow({ v, onDestroy }) {
    const img = vehicleImageSrc(v);
    const driverName = firstActiveDriver(v);
    const pct = fuelPercent(v);
    const { reg, ins } = earliestExpiryDates(v.documents || []);
    const regDays = daysUntil(reg);
    const insDays = daysUntil(ins);
    const warn = (d) => d != null && d <= 30;
    const ownership = v.financial?.ownership_type;
    const ownLabel = ownership ? OWNERSHIP_LABEL[ownership] || ownership : '—';
    const isActive = String(v.status || '').toLowerCase() === 'active';

    return (
        <tr className="border-b border-gray-100 bg-white last:border-0">
            <td className="px-4 py-4 align-top">
                <div className="flex items-start gap-3">
                    {img ? (
                        <img src={img} alt="" className="h-14 w-20 flex-shrink-0 rounded-md object-cover" />
                    ) : (
                        <div
                            className="flex h-14 w-20 flex-shrink-0 items-center justify-center rounded-md text-xl text-white"
                            style={{ backgroundColor: TEAL_DARK }}
                        >
                            🚚
                        </div>
                    )}
                    <div>
                        <div className="font-semibold text-gray-900">{displayName(v)}</div>
                        <div className="mt-0.5 text-xs text-gray-500">{subtitleLine(v)}</div>
                    </div>
                </div>
            </td>
            <td className="px-4 py-4 align-top">
                <div className="flex items-center gap-1.5 text-sm text-gray-800">
                    <span className="text-gray-400" aria-hidden>
                        👤
                    </span>
                    <span>{driverName || 'Unassigned'}</span>
                </div>
                <div className="mt-2 flex items-center gap-1.5 text-sm text-gray-700">
                    <span aria-hidden>⛽</span>
                    <span>{v.current_fuel != null ? `${Number(v.current_fuel).toLocaleString()} L` : '—'}</span>
                </div>
                {pct != null && (
                    <div className="mt-2">
                        <div className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">Fuel inventory</div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                                className="h-full rounded-full transition-all"
                                style={{
                                    width: `${pct}%`,
                                    backgroundColor: pct < 20 ? '#dc2626' : pct < 45 ? '#eab308' : '#16a34a',
                                }}
                            />
                        </div>
                    </div>
                )}
            </td>
            <td className="px-4 py-4 align-top text-sm text-gray-800">
                <div className="text-gray-500">Group</div>
                <div className="font-medium text-gray-900">{v.branch?.name || v.company?.name || '—'}</div>
                <div className="mt-2 text-gray-500">Owner</div>
                <div className="font-medium">{ownLabel}</div>
            </td>
            <td className="px-4 py-4 align-top">
                <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'
                    }`}
                >
                    {isActive ? 'Active' : String(v.status || 'Inactive').replace(/_/g, ' ')}
                </span>
                <div className="mt-3 space-y-1 text-xs">
                    <div className={warn(regDays) ? 'font-medium text-amber-700' : 'text-gray-600'}>
                        Reg Exp: {formatShortDate(reg)}
                    </div>
                    <div className={warn(insDays) ? 'font-medium text-amber-700' : 'text-gray-600'}>
                        Ins Exp: {formatShortDate(ins)}
                    </div>
                </div>
            </td>
            <td className="px-4 py-4 align-top text-right">
                <div className="inline-flex gap-1 rounded-md border border-gray-200 bg-gray-50 p-1">
                    <Link
                        href={route('vehicles.edit', v.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-blue-600 hover:bg-blue-50"
                        title="View"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                        href={route('vehicles.edit', v.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-amber-600 hover:bg-amber-50"
                        title="Edit"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => onDestroy(v.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded text-red-600 hover:bg-red-50"
                        title="Delete"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
}

function VehicleCard({ v, onDestroy }) {
    return (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-4">
                <div className="flex gap-3">
                    {vehicleImageSrc(v) ? (
                        <img src={vehicleImageSrc(v)} alt="" className="h-16 w-24 rounded object-cover" />
                    ) : (
                        <div
                            className="flex h-16 w-24 items-center justify-center rounded text-xl text-white"
                            style={{ backgroundColor: TEAL_DARK }}
                        >
                            🚚
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-gray-900">{displayName(v)}</div>
                        <div className="truncate text-xs text-gray-500">{subtitleLine(v)}</div>
                    </div>
                </div>
            </div>
            <div className="space-y-2 p-4 text-sm text-gray-700">
                <div>👤 {firstActiveDriver(v) || 'Unassigned'}</div>
                <div>⛽ {v.current_fuel != null ? `${Number(v.current_fuel).toLocaleString()} L` : '—'}</div>
            </div>
            <div className="flex justify-end gap-1 border-t border-gray-100 p-2">
                <Link href={route('vehicles.edit', v.id)} className="rounded p-2 text-blue-600 hover:bg-blue-50">
                    <EyeIcon className="h-4 w-4" />
                </Link>
                <Link href={route('vehicles.edit', v.id)} className="rounded p-2 text-amber-600 hover:bg-amber-50">
                    <PencilIcon className="h-4 w-4" />
                </Link>
                <button type="button" onClick={() => onDestroy(v.id)} className="rounded p-2 text-red-600 hover:bg-red-50">
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

export default function Index({ vehicles, filters, fleetCounts = {} }) {
    const { flash } = usePage().props;
    const [viewMode, setViewMode] = useState('list');
    const { data, setData, get, processing } = useForm({
        search: filters?.search || '',
        fleet: filters?.fleet || '',
    });

    useEffect(() => {
        setData('search', filters?.search || '');
        setData('fleet', filters?.fleet || '');
    }, [filters?.search, filters?.fleet, setData]);

    const submitSearch = (e) => {
        e.preventDefault();
        get(route('vehicles.index'), { preserveState: true, replace: true });
    };

    const setFleet = (fleet) => {
        setData('fleet', fleet);
        router.get(
            route('vehicles.index'),
            { search: data.search, fleet },
            { preserveState: true, replace: true },
        );
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Delete this vehicle?',
            onConfirm: () => {
                router.delete(route('vehicles.destroy', id));
            },
        });
    };

    const fleet = filters?.fleet || data.fleet || '';
    const dropdownFleet = ['', 'active', 'inactive'].includes(fleet) ? fleet : '';

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Vehicle Management</h2>
                        <p className="mt-1 text-right text-xs text-gray-500 sm:text-left">
                            <Link href={route('dashboard')} className="hover:underline">
                                Dashboard
                            </Link>
                            <span className="mx-1">/</span>
                            <span>Vehicle&apos;s Management</span>
                        </p>
                    </div>
                    <Link
                        href={route('vehicles.create')}
                        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow hover:opacity-95"
                        style={{ backgroundColor: TEAL }}
                    >
                        + Add Vehicle
                    </Link>
                </div>
            }
        >
            <Head title="Vehicle Management" />

            <div className="mx-auto max-w-7xl space-y-6">
                {flash?.success && <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">{flash.success}</div>}

                <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
                    <div className="flex flex-wrap gap-2">
                        <FleetChip
                            active={fleet === ''}
                            onClick={() => setFleet('')}
                            className="border-blue-500 text-blue-600"
                            ringClass="ring-blue-400"
                        >
                            <span>All Vehicles</span>
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800">
                                {fleetCounts?.all ?? 0}
                            </span>
                        </FleetChip>
                        <FleetChip
                            active={fleet === 'active'}
                            onClick={() => setFleet('active')}
                            className="border-green-600 text-green-700"
                            ringClass="ring-green-500"
                        >
                            <span>Active</span>
                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                                {fleetCounts?.active ?? 0}
                            </span>
                        </FleetChip>
                        <FleetChip
                            active={fleet === 'inactive'}
                            onClick={() => setFleet('inactive')}
                            className="border-red-500 text-red-600"
                            ringClass="ring-red-400"
                        >
                            <span>Inactive</span>
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">
                                {fleetCounts?.inactive ?? 0}
                            </span>
                        </FleetChip>
                        <FleetChip
                            active={fleet === 'low_fuel'}
                            onClick={() => setFleet('low_fuel')}
                            className="border-red-500 text-red-600"
                            ringClass="ring-red-400"
                        >
                            <span>⛽ Low Fuel</span>
                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">
                                {fleetCounts?.low_fuel ?? 0}
                            </span>
                        </FleetChip>
                        <FleetChip
                            active={fleet === 'expiries'}
                            onClick={() => setFleet('expiries')}
                            className="border-amber-500 text-amber-700"
                            ringClass="ring-amber-400"
                        >
                            <span>⚠ Expiries</span>
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                                {fleetCounts?.expiries ?? 0}
                            </span>
                        </FleetChip>
                    </div>
                </div>

                <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                    <div className="relative min-w-[200px] flex-1 sm:max-w-md">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <TextInput
                            className="w-full pl-9"
                            value={data.search}
                            onChange={(e) => setData('search', e.target.value)}
                            placeholder="Search vehicle name, model, reg no..."
                        />
                    </div>
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <InputLabel htmlFor="fleet_status" value="Status" />
                            <select
                                id="fleet_status"
                                className="mt-1 block w-44 rounded-md border-gray-300 text-sm shadow-sm"
                                value={dropdownFleet}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setData('fleet', v);
                                    router.get(route('vehicles.index'), { search: data.search, fleet: v }, { preserveState: true, replace: true });
                                }}
                            >
                                <option value="">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>
                        <SecondaryButton type="submit" disabled={processing}>
                            Search
                        </SecondaryButton>
                        <div className="flex gap-1 rounded-md border border-gray-200 p-1">
                            <button
                                type="button"
                                className={`rounded px-2 py-1.5 text-xs font-semibold ${viewMode === 'grid' ? 'text-white' : 'bg-white text-gray-600'}`}
                                style={viewMode === 'grid' ? { backgroundColor: TEAL_DARK } : {}}
                                onClick={() => setViewMode('grid')}
                                title="Grid"
                            >
                                ▦
                            </button>
                            <button
                                type="button"
                                className={`rounded px-2 py-1.5 text-xs font-semibold ${viewMode === 'list' ? 'text-white' : 'bg-white text-gray-600'}`}
                                style={viewMode === 'list' ? { backgroundColor: TEAL_DARK } : {}}
                                onClick={() => setViewMode('list')}
                                title="List"
                            >
                                ☰
                            </button>
                        </div>
                    </div>
                </form>

                {viewMode === 'list' ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                            Vehicle
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                            Driver &amp; Fuel
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                            Group &amp; Owner
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                            Status &amp; Expiry
                                        </th>
                                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vehicles.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                                                No vehicles found.
                                            </td>
                                        </tr>
                                    )}
                                    {vehicles.data.map((v) => (
                                        <VehicleRow key={v.id} v={v} onDestroy={destroy} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {vehicles.data.length === 0 && (
                            <div className="col-span-full rounded-lg border border-dashed border-gray-300 py-12 text-center text-gray-500">
                                No vehicles found.
                            </div>
                        )}
                        {vehicles.data.map((v) => (
                            <VehicleCard key={v.id} v={v} onDestroy={destroy} />
                        ))}
                    </div>
                )}

                {vehicles.links?.length > 3 && (
                    <div className="flex flex-wrap justify-center gap-2">
                        {vehicles.links.map((l, i) =>
                            l.url ? (
                                <Link
                                    key={i}
                                    href={l.url}
                                    className={`rounded px-3 py-1 text-sm ${l.active ? 'font-semibold text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                    style={l.active ? { backgroundColor: TEAL } : {}}
                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                />
                            ) : (
                                <span
                                    key={i}
                                    className="px-3 py-1 text-sm text-gray-400"
                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                />
                            ),
                        )}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
