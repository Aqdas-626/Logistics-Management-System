import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, router, usePage } from '@inertiajs/react';

const statusColors = {
    planned: 'bg-slate-100 text-slate-800',
    started: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function Show({ routePlan }) {
    const { flash } = usePage().props;

    const patchStatus = (status) => {
        router.patch(
            route('route-plans.update-status', routePlan.id),
            { status },
            { preserveScroll: true },
        );
    };

    const fmt = (v) => (v ? new Date(v).toLocaleString() : '—');

    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div>
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">{routePlan.route_name}</h2>
                        <p className="text-sm text-gray-500 font-mono">{routePlan.route_code}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Link href={route('route-plans.edit', routePlan.id)}>
                            <SecondaryButton type="button">Edit</SecondaryButton>
                        </Link>
                        <Link href={route('route-plans.index')}>
                            <SecondaryButton type="button">Back to list</SecondaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={routePlan.route_code} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    {flash?.success && <div className="rounded-md bg-green-50 p-4 text-green-800">{flash.success}</div>}
                    {flash?.error && <div className="rounded-md bg-red-50 p-4 text-red-800">{flash.error}</div>}

                    <div className="flex flex-wrap gap-2 rounded-lg bg-white p-4 shadow sm:rounded-lg">
                        {routePlan.status === 'planned' && (
                            <>
                                <PrimaryButton type="button" onClick={() => patchStatus('started')}>
                                    Start route
                                </PrimaryButton>
                                <SecondaryButton type="button" onClick={() => patchStatus('cancelled')}>
                                    Cancel
                                </SecondaryButton>
                            </>
                        )}
                        {routePlan.status === 'started' && (
                            <>
                                <PrimaryButton type="button" onClick={() => patchStatus('completed')}>
                                    Mark completed
                                </PrimaryButton>
                                <SecondaryButton type="button" onClick={() => patchStatus('cancelled')}>
                                    Cancel
                                </SecondaryButton>
                            </>
                        )}
                        {routePlan.status === 'cancelled' && (
                            <SecondaryButton type="button" onClick={() => patchStatus('planned')}>
                                Reopen as planned
                            </SecondaryButton>
                        )}
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="rounded-lg bg-white p-6 shadow sm:rounded-lg">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">Summary</h3>
                            <dl className="space-y-2 text-sm">
                                <div className="flex justify-between gap-4">
                                    <dt className="text-gray-500">Status</dt>
                                    <dd>
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[routePlan.status] || 'bg-gray-100'}`}
                                        >
                                            {routePlan.status}
                                        </span>
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-gray-500">Plan date</dt>
                                    <dd className="text-gray-900">{routePlan.plan_date}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-gray-500">Scheduled departure</dt>
                                    <dd className="text-gray-900">{fmt(routePlan.scheduled_departure_at)}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-gray-500">Est. duration</dt>
                                    <dd className="text-gray-900">
                                        {routePlan.estimated_duration_minutes != null
                                            ? `${routePlan.estimated_duration_minutes} min`
                                            : '—'}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-gray-500">Company</dt>
                                    <dd className="text-gray-900">{routePlan.company?.name ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-gray-500">Branch</dt>
                                    <dd className="text-gray-900">{routePlan.branch?.name ?? '—'}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-gray-500">Origin</dt>
                                    <dd className="text-gray-900">
                                        {routePlan.origin_location
                                            ? `${routePlan.origin_location.name}${routePlan.origin_location.city ? ` (${routePlan.origin_location.city})` : ''}`
                                            : '—'}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-gray-500">Destination</dt>
                                    <dd className="text-gray-900">
                                        {routePlan.destination_location
                                            ? `${routePlan.destination_location.name}${routePlan.destination_location.city ? ` (${routePlan.destination_location.city})` : ''}`
                                            : '—'}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-gray-500">Assignment</dt>
                                    <dd className="text-gray-900">
                                        {routePlan.driver_vehicle_assignment
                                            ? `${routePlan.driver_vehicle_assignment.driver?.name ?? '—'} → ${routePlan.driver_vehicle_assignment.vehicle?.registration_no ?? '—'}`
                                            : '—'}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-gray-500">Started</dt>
                                    <dd className="text-gray-900">{fmt(routePlan.started_at)}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-gray-500">Completed</dt>
                                    <dd className="text-gray-900">{fmt(routePlan.completed_at)}</dd>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <dt className="text-gray-500">Created by</dt>
                                    <dd className="text-gray-900">{routePlan.creator?.name ?? '—'}</dd>
                                </div>
                            </dl>
                            {routePlan.notes && (
                                <div className="mt-4 border-t border-gray-100 pt-4">
                                    <p className="text-xs font-semibold uppercase text-gray-500">Notes</p>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">{routePlan.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow sm:rounded-lg lg:col-span-2">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">Stops ({routePlan.stops?.length ?? 0})</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead>
                                        <tr>
                                            <th className="px-2 py-2 text-left text-gray-700">#</th>
                                            <th className="px-2 py-2 text-left text-gray-700">Name</th>
                                            <th className="px-2 py-2 text-left text-gray-700">Location</th>
                                            <th className="px-2 py-2 text-left text-gray-700">GPS</th>
                                            <th className="px-2 py-2 text-left text-gray-700">Shipment</th>
                                            <th className="px-2 py-2 text-left text-gray-700">Queue</th>
                                            <th className="px-2 py-2 text-left text-gray-700">ETA / ATA</th>
                                            <th className="px-2 py-2 text-left text-gray-700">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {(routePlan.stops ?? []).map((s) => (
                                            <tr key={s.id}>
                                                <td className="px-2 py-2">{s.stop_order}</td>
                                                <td className="px-2 py-2 font-medium">{s.stop_name}</td>
                                                <td className="px-2 py-2 text-gray-600">
                                                    {s.location ? `${s.location.name}${s.location.city ? ` (${s.location.city})` : ''}` : '—'}
                                                </td>
                                                <td className="px-2 py-2">
                                                    {s.latitude != null && s.longitude != null ? (
                                                        <a
                                                            href={`https://www.openstreetmap.org/?mlat=${s.latitude}&mlon=${s.longitude}&zoom=16`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[#178089] hover:underline"
                                                        >
                                                            Map
                                                        </a>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </td>
                                                <td className="px-2 py-2 text-gray-600">
                                                    {s.shipment ? s.shipment.shipment_no : '—'}
                                                </td>
                                                <td className="px-2 py-2 text-gray-600">
                                                    {s.job_queue_id ? `#${s.job_queue_id}` : '—'}
                                                </td>
                                                <td className="px-2 py-2 text-gray-600">
                                                    {fmt(s.eta_at)}
                                                    <br />
                                                    {fmt(s.ata_at)}
                                                </td>
                                                <td className="px-2 py-2">
                                                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">{s.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
