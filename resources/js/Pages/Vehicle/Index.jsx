import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

export default function Index({ vehicles, filters }) {
    const { flash } = usePage().props;
    const { data, setData, get, processing } = useForm({
        search: filters?.search || '',
    });

    const submitSearch = (e) => {
        e.preventDefault();
        get(route('vehicles.index'), { preserveState: true, replace: true });
    };

    const destroy = (id) => {
        if (confirm('Delete this vehicle?')) {
            router.delete(route('vehicles.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Vehicles</h2>
                    <Link
                        href={route('vehicles.create')}
                        className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        Add Vehicle
                    </Link>
                </div>
            }
        >
            <Head title="Vehicles" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">{flash.success}</div>
                    )}

                    <div className="mb-4 flex justify-end">
                        <Link
                            href={route('vehicles.create')}
                            className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-90"
                            style={{ backgroundColor: '#20A4AC' }}
                        >
                            Create Vehicle
                        </Link>
                    </div>

                    <form onSubmit={submitSearch} className="mb-6 flex items-end gap-4">
                        <div>
                            <InputLabel htmlFor="search" value="Search" />
                            <TextInput
                                id="search"
                                className="mt-1 block w-64"
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                placeholder="Registration no or VIN"
                            />
                        </div>
                        <SecondaryButton type="submit" disabled={processing}>
                            Search
                        </SecondaryButton>
                    </form>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto p-6">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 text-left text-gray-700">Registration</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Type</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Company</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Branch</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Status</th>
                                        <th className="px-3 py-2 text-right text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {vehicles.data.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-3 py-8 text-center text-gray-500">
                                                No vehicles found.
                                            </td>
                                        </tr>
                                    )}
                                    {vehicles.data.map((v) => (
                                        <tr key={v.id}>
                                            <td className="px-3 py-2">{v.registration_no}</td>
                                            <td className="px-3 py-2">{v.vehicle_type?.name || '—'}</td>
                                            <td className="px-3 py-2">{v.company?.name || '—'}</td>
                                            <td className="px-3 py-2">{v.branch?.name || '—'}</td>
                                            <td className="px-3 py-2">{v.status}</td>
                                            <td className="px-3 py-2 text-right">
                                                <Link
                                                    href={route('vehicles.edit', v.id)}
                                                    className="me-2 inline-flex items-center rounded-md border border-[#20A4AC]/30 bg-[#20A4AC]/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-[#178089] hover:bg-[#20A4AC]/20"
                                                >
                                                    Edit
                                                </Link>
                                                <DangerButton
                                                    type="button"
                                                    className="text-xs"
                                                    onClick={() => destroy(v.id)}
                                                >
                                                    Delete
                                                </DangerButton>
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

