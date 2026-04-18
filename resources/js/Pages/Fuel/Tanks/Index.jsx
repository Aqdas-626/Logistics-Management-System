import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { PencilIcon, TrashIcon } from '@/Components/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { confirmDelete } from '@/Utils/confirmDelete';

const TEAL = '#20A4AC';
const TEAL_DARK = '#178089';
const TEAL_SOFT = '#E8F6F7';

export default function Index({ tanks, filters }) {
    const { flash } = usePage().props;
    const { data, setData, get, processing } = useForm({
        search: filters?.search || '',
    });

    const submitSearch = (e) => {
        e.preventDefault();
        get(route('fuel-tanks.index'), { preserveState: true, replace: true });
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Delete this fuel tank?',
            onConfirm: () => {
                router.delete(route('fuel-tanks.destroy', id));
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-4xl font-semibold leading-tight text-gray-800">
                        Fuel Tanks
                        <Link
                            href={route('fuel-tanks.create')}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white"
                            style={{ backgroundColor: TEAL }}
                            title="Add Fuel Tank"
                        >
                            +
                        </Link>
                    </h2>
                </div>
            }
        >
            <Head title="Fuel Tanks" />

            <div className="py-2">
                <div className="mx-auto max-w-7xl">
                    {flash?.success && (
                        <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">{flash.success}</div>
                    )}

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="p-4">
                            <div className="mb-4 flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-center">
                                <div className="text-sm font-semibold" style={{ color: TEAL_DARK }}>
                                    Total Tanks: {tanks.total}
                                </div>

                                <form onSubmit={submitSearch} className="flex flex-wrap items-center gap-2">
                                    <InputLabel htmlFor="search" value="Search:" />
                                    <TextInput
                                        id="search"
                                        className="block w-52"
                                        value={data.search}
                                        onChange={(e) => setData('search', e.target.value)}
                                    />
                                    <SecondaryButton type="submit" disabled={processing}>
                                        Go
                                    </SecondaryButton>
                                </form>
                            </div>

                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 text-left text-gray-700">S.NO</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Name</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Fuel Type</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Capacity</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Current Stock</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Unit</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Status</th>
                                        <th className="px-3 py-2 text-right text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {tanks.data.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                                                No fuel tanks found.
                                            </td>
                                        </tr>
                                    )}
                                    {tanks.data.map((tank, index) => (
                                        <tr key={tank.id}>
                                            <td className="px-3 py-2">
                                                {(tanks.current_page - 1) * tanks.per_page + index + 1}
                                            </td>
                                            <td className="px-3 py-2">{tank.name}</td>
                                            <td className="px-3 py-2 capitalize">{tank.fuel_type || '-'}</td>
                                            <td className="px-3 py-2">{tank.capacity}</td>
                                            <td className="px-3 py-2">{tank.current_stock}</td>
                                            <td className="px-3 py-2">{tank.unit}</td>
                                            <td className="px-3 py-2">
                                                <span
                                                    className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                                                    style={{ backgroundColor: TEAL_SOFT, color: TEAL_DARK }}
                                                >
                                                    {tank.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <Link
                                                    href={route('fuel-tanks.edit', tank.id)}
                                                    className="me-2 inline-flex items-center"
                                                    style={{ color: TEAL_DARK }}
                                                    title="Edit"
                                                    aria-label="Edit fuel tank"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                    aria-label="Delete fuel tank"
                                                    onClick={() => destroy(tank.id)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {tanks.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-end gap-2 text-sm">
                                    <button
                                        type="button"
                                        disabled={!tanks.prev_page_url}
                                        onClick={() => tanks.prev_page_url && router.visit(tanks.prev_page_url)}
                                        className="rounded px-3 py-1 disabled:opacity-40"
                                        style={{ border: `1px solid ${TEAL}` }}
                                    >
                                        Previous
                                    </button>
                                    <span className="rounded px-3 py-1 text-white" style={{ backgroundColor: TEAL }}>
                                        {tanks.current_page}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={!tanks.next_page_url}
                                        onClick={() => tanks.next_page_url && router.visit(tanks.next_page_url)}
                                        className="rounded px-3 py-1 disabled:opacity-40"
                                        style={{ border: `1px solid ${TEAL}` }}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
