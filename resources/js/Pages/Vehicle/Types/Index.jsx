import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { PencilIcon, TrashIcon } from '@/Components/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { confirmDelete } from '@/Utils/confirmDelete';

export default function Index({ vehicleTypes, filters }) {
    const { flash } = usePage().props;
    const { data, setData, get, processing } = useForm({
        search: filters?.search || '',
    });

    const submitSearch = (e) => {
        e.preventDefault();
        get(route('vehicle-types.index'), { preserveState: true, replace: true });
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Delete this vehicle type?',
            onConfirm: () => {
            router.delete(route('vehicle-types.destroy', id));
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Vehicle Types
                    </h2>
                    <Link
                            href={route('vehicle-types.create')}
                            className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-90"
                            style={{ backgroundColor: '#20A4AC' }}
                        >
                            Create Vehicle Type
                        </Link>
                </div>
            }
        >
            <Head title="Vehicle Types" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={submitSearch} className="mb-6 flex items-end gap-4">
                        <div>
                            <InputLabel htmlFor="search" value="Search" />
                            <TextInput
                                id="search"
                                className="mt-1 block w-64"
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                placeholder="Type name"
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
                                        <th className="px-3 py-2 text-left text-gray-700">Name</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Max Weight (kg)</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Max Volume (m3)</th>
                                        <th className="px-3 py-2 text-right text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {vehicleTypes.data.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-3 py-8 text-center text-gray-500">
                                                No vehicle types found.
                                            </td>
                                        </tr>
                                    )}
                                    {vehicleTypes.data.map((type) => (
                                        <tr key={type.id}>
                                            <td className="px-3 py-2">{type.name}</td>
                                            <td className="px-3 py-2">{type.max_weight_kg ?? '—'}</td>
                                            <td className="px-3 py-2">{type.max_volume_m3 ?? '—'}</td>
                                            <td className="px-3 py-2 text-right">
                                                <Link
                                                    href={route('vehicle-types.edit', type.id)}
                                                    className="me-2 inline-flex items-center text-[#178089] hover:text-[#0f5c61]"
                                                    title="Edit"
                                                    aria-label="Edit vehicle type"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                    aria-label="Delete vehicle type"
                                                    onClick={() => destroy(type.id)}
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

