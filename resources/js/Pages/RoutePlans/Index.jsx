import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { PencilIcon, TrashIcon, EyeIcon } from '@/Components/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { confirmDelete } from '@/Utils/confirmDelete';

const statusColors = {
    planned: 'bg-slate-100 text-slate-800',
    started: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function Index({ routePlans, filters }) {
    const { flash } = usePage().props;
    const { data, setData, get, processing } = useForm({
        search: filters?.search || '',
        status: filters?.status || '',
    });

    const submitSearch = (e) => {
        e.preventDefault();
        get(route('route-plans.index'), { preserveState: true, replace: true });
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Delete this route plan?',
            onConfirm: () => {
                router.delete(route('route-plans.destroy', id));
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Route Plans</h2>
                    <Link
                        href={route('route-plans.create')}
                        className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        New route plan
                    </Link>
                </div>
            }
        >
            <Head title="Route Plans" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">{flash.success}</div>}
                    {flash?.error && <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">{flash.error}</div>}
                    {flash?.error && <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">{flash.error}</div>}

                    <form onSubmit={submitSearch} className="mb-6 flex flex-wrap items-end gap-4">
                        <div>
                            <InputLabel htmlFor="search" value="Search" />
                            <TextInput
                                id="search"
                                className="mt-1 block w-72"
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                placeholder="Code or name"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="status" value="Status" />
                            <select
                                id="status"
                                className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm"
                                value={data.status}
                                onChange={(e) => setData('status', e.target.value)}
                            >
                                <option value="">All</option>
                                <option value="planned">Planned</option>
                                <option value="started">Started</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        <SecondaryButton type="submit" disabled={processing}>
                            Filter
                        </SecondaryButton>
                    </form>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto p-6">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 text-left text-gray-700">Code</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Name</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Plan date</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Stops</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Assignment</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Status</th>
                                        <th className="px-3 py-2 text-right text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {routePlans.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                                                No route plans found.
                                            </td>
                                        </tr>
                                    )}
                                    {routePlans.data.map((row) => (
                                        <tr key={row.id}>
                                            <td className="px-3 py-2 font-mono text-xs">{row.route_code}</td>
                                            <td className="px-3 py-2">{row.route_name}</td>
                                            <td className="px-3 py-2 text-gray-600">{row.plan_date}</td>
                                            <td className="px-3 py-2">{row.stops_count}</td>
                                            <td className="px-3 py-2 text-gray-600">
                                                {row.driver_vehicle_assignment
                                                    ? `${row.driver_vehicle_assignment.driver?.name ?? '—'} → ${row.driver_vehicle_assignment.vehicle?.registration_no ?? '—'}`
                                                    : '—'}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[row.status] || 'bg-gray-100 text-gray-700'}`}
                                                >
                                                    {row.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <Link
                                                    href={route('route-plans.show', row.id)}
                                                    className="me-2 inline-flex items-center text-[#178089] hover:text-[#0f5c61]"
                                                    title="View"
                                                    aria-label="View route plan"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={route('route-plans.edit', row.id)}
                                                    className="me-2 inline-flex items-center text-[#178089] hover:text-[#0f5c61]"
                                                    title="Edit"
                                                    aria-label="Edit route plan"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                    aria-label="Delete route plan"
                                                    onClick={() => destroy(row.id)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
