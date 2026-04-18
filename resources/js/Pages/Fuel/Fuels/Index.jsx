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

const SOURCE_COLORS = {
    tank:   { bg: '#ecfdf5', color: '#065f46' },
    vendor: { bg: '#eff6ff', color: '#1e40af' },
};

export default function Index({ fuels, filters }) {
    const { flash } = usePage().props;
    const { data, setData, get, processing } = useForm({
        search: filters?.search || '',
    });

    const submitSearch = (e) => {
        e.preventDefault();
        get(route('fuels.index'), { preserveState: true, replace: true });
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Delete this fuel entry?',
            onConfirm: () => {
                router.delete(route('fuels.destroy', id));
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-4xl font-semibold leading-tight text-gray-800">
                        Fuel Management
                        <Link
                            href={route('fuels.create')}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white"
                            style={{ backgroundColor: TEAL }}
                            title="Add Fuel"
                        >
                            +
                        </Link>
                    </h2>
                </div>
            }
        >
            <Head title="Fuel Management" />

            <div className="py-2">
                <div className="mx-auto max-w-7xl">
                    {flash?.success && (
                        <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">{flash.success}</div>
                    )}

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="p-4">
                            <div className="mb-4 flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-center">
                                <div className="text-sm font-semibold" style={{ color: TEAL_DARK }}>
                                    Total Entries: {fuels.total}
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
                                        <th className="px-3 py-2 text-left text-gray-700">Vehicle</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Driver</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Fuel Type</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Fill Date</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Quantity</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Odometer</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Amount</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Source</th>
                                        <th className="px-3 py-2 text-right text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {fuels.data.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="px-3 py-8 text-center text-gray-500">
                                                No fuel entries found.
                                            </td>
                                        </tr>
                                    )}
                                    {fuels.data.map((fuel, index) => {
                                        const srcStyle = SOURCE_COLORS[fuel.source_type] ?? { bg: TEAL_SOFT, color: TEAL_DARK };
                                        return (
                                            <tr key={fuel.id}>
                                                <td className="px-3 py-2">
                                                    {(fuels.current_page - 1) * fuels.per_page + index + 1}
                                                </td>
                                                <td className="px-3 py-2">{fuel.vehicle?.name || '-'}</td>
                                                <td className="px-3 py-2">{fuel.driver?.name || '-'}</td>
                                                <td className="px-3 py-2 capitalize">{fuel.fuel_type || '-'}</td>
                                                <td className="px-3 py-2">{fuel.fill_date || '-'}</td>
                                                <td className="px-3 py-2">{fuel.quantity}</td>
                                                <td className="px-3 py-2">{fuel.odometer}</td>
                                                <td className="px-3 py-2">{fuel.amount}</td>
                                                <td className="px-3 py-2">
                                                    <span
                                                        className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize"
                                                        style={{ backgroundColor: srcStyle.bg, color: srcStyle.color }}
                                                    >
                                                        {fuel.source_type === 'tank'
                                                            ? fuel.fuel_tank?.name ?? 'Tank'
                                                            : fuel.fuel_vendor?.name ?? 'Vendor'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-right">
                                                    <Link
                                                        href={route('fuels.edit', fuel.id)}
                                                        className="me-2 inline-flex items-center"
                                                        style={{ color: TEAL_DARK }}
                                                        title="Edit"
                                                        aria-label="Edit fuel entry"
                                                    >
                                                        <PencilIcon className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center text-red-600 hover:text-red-800"
                                                        title="Delete"
                                                        aria-label="Delete fuel entry"
                                                        onClick={() => destroy(fuel.id)}
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>

                            {fuels.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-end gap-2 text-sm">
                                    <button
                                        type="button"
                                        disabled={!fuels.prev_page_url}
                                        onClick={() => fuels.prev_page_url && router.visit(fuels.prev_page_url)}
                                        className="rounded px-3 py-1 disabled:opacity-40"
                                        style={{ border: `1px solid ${TEAL}` }}
                                    >
                                        Previous
                                    </button>
                                    <span className="rounded px-3 py-1 text-white" style={{ backgroundColor: TEAL }}>
                                        {fuels.current_page}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={!fuels.next_page_url}
                                        onClick={() => fuels.next_page_url && router.visit(fuels.next_page_url)}
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
