import { useMemo, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import MechanicManagementModal from '@/Components/MaintenanceManagement/MechanicManagementModal';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { PencilIcon, PlusIcon, TrashIcon } from '@/Components/Icons';
import { confirmDelete } from '@/Utils/confirmDelete';

const TEAL = '#20A4AC';
const TEAL_DARK = '#178089';

function ListViewIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}

function GridViewIcon({ className }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
            />
        </svg>
    );
}

function CategoryBadge({ label }) {
    if (!label) {
        return <span className="text-gray-400">—</span>;
    }
    return (
        <span className="inline-flex rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-gray-700">
            {label}
        </span>
    );
}

export default function Index({ mechanics, filters }) {
    const { url } = usePage();
    const [viewMode, setViewMode] = useState('list');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMechanic, setEditingMechanic] = useState(null);

    const { data, setData, get, processing } = useForm({
        search: filters?.search || '',
    });

    const submitSearch = (e) => {
        e.preventDefault();
        get(route('mechanic-management.index'), { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditingMechanic(null);
        setModalOpen(true);
    };

    const openEdit = (mechanic) => {
        setEditingMechanic(mechanic);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingMechanic(null);
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Delete this mechanic?',
            onConfirm: () => {
                router.delete(route('mechanic-management.destroy', id));
            },
        });
    };

    const totalMechanics = mechanics.total ?? 0;

    const breadcrumbTail = useMemo(() => {
        if (url.includes('mechanic-management')) return 'Mechanic';
        return 'Mechanic';
    }, [url]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl font-semibold text-gray-800 sm:text-3xl">Mechanic Management</h2>
                            <button
                                type="button"
                                onClick={openCreate}
                                className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
                                style={{ backgroundColor: TEAL }}
                            >
                                <PlusIcon className="h-4 w-4" />
                                Add New
                            </button>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            <Link href={route('dashboard')} className="text-[#178089] hover:underline">
                                Dashboard
                            </Link>
                            <span className="mx-1 text-gray-400">/</span>
                            <span className="text-gray-600">{breadcrumbTail}</span>
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Mechanic Management" />

            <div className="py-1">
                <div className="mx-auto max-w-7xl">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-gray-50/80 px-4 py-4 sm:px-6">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm"
                                    style={{ borderLeftWidth: 4, borderLeftColor: TEAL }}
                                >
                                    <span className="text-2xl font-bold tabular-nums" style={{ color: TEAL_DARK }}>
                                        {totalMechanics}
                                    </span>
                                    <span className="text-sm font-medium text-gray-600">Total Mechanics</span>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                                    <div className="flex items-center justify-end gap-1 rounded-lg border border-gray-200 bg-white p-1">
                                        <button
                                            type="button"
                                            title="List view"
                                            onClick={() => setViewMode('list')}
                                            className={`rounded-md p-2 transition-colors ${
                                                viewMode === 'list'
                                                    ? 'bg-[#E8F6F7] text-[#178089]'
                                                    : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            <ListViewIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            type="button"
                                            title="Grid view"
                                            onClick={() => setViewMode('grid')}
                                            className={`rounded-md p-2 transition-colors ${
                                                viewMode === 'grid'
                                                    ? 'bg-[#E8F6F7] text-[#178089]'
                                                    : 'text-gray-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            <GridViewIcon className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={submitSearch} className="flex flex-wrap items-center gap-2">
                                        <InputLabel htmlFor="mm-search" value="Search" className="sr-only" />
                                        <TextInput
                                            id="mm-search"
                                            className="min-w-[200px]"
                                            value={data.search}
                                            onChange={(e) => setData('search', e.target.value)}
                                            placeholder="Search Mechanic..."
                                        />
                                        <SecondaryButton type="submit" disabled={processing}>
                                            Go
                                        </SecondaryButton>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            {viewMode === 'list' ? (
                                <div className="overflow-x-auto rounded-lg border border-gray-100">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                    #
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                    Name
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                    Email
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                    Phone
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                    Category
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                    Created date
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {mechanics.data.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-10 text-center text-gray-500">
                                                        No mechanics found.
                                                    </td>
                                                </tr>
                                            )}
                                            {mechanics.data.map((mechanic, index) => (
                                                <tr key={mechanic.id} className="hover:bg-gray-50/80">
                                                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                                        {(mechanics.current_page - 1) * mechanics.per_page + index + 1}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-gray-900">{mechanic.name}</td>
                                                    <td className="px-4 py-3 text-gray-700">{mechanic.email || '—'}</td>
                                                    <td className="px-4 py-3 text-gray-700">{mechanic.phone || '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <CategoryBadge label={mechanic.category} />
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                                                        {mechanic.created_at
                                                            ? String(mechanic.created_at).replace('T', ' ').slice(0, 19)
                                                            : '—'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(mechanic)}
                                                            className="me-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-white shadow-sm transition-opacity hover:opacity-90"
                                                            style={{ backgroundColor: TEAL }}
                                                            title="Edit"
                                                            aria-label="Edit mechanic"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => destroy(mechanic.id)}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white shadow-sm transition-opacity hover:bg-red-700"
                                                            title="Delete"
                                                            aria-label="Delete mechanic"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {mechanics.data.length === 0 && (
                                        <p className="col-span-full py-10 text-center text-gray-500">No mechanics found.</p>
                                    )}
                                    {mechanics.data.map((mechanic) => (
                                        <div
                                            key={mechanic.id}
                                            className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                            style={{ borderTopWidth: 3, borderTopColor: TEAL }}
                                        >
                                            <h3 className="text-lg font-semibold text-gray-900">{mechanic.name}</h3>
                                            <p className="mt-1 text-sm text-gray-600">{mechanic.email || '—'}</p>
                                            <p className="text-sm text-gray-600">{mechanic.phone || '—'}</p>
                                            <div className="mt-2">
                                                <CategoryBadge label={mechanic.category} />
                                            </div>
                                            <p className="mt-2 text-xs text-gray-400">
                                                {mechanic.created_at
                                                    ? String(mechanic.created_at).replace('T', ' ').slice(0, 19)
                                                    : ''}
                                            </p>
                                            <div className="mt-4 flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(mechanic)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white shadow-sm"
                                                    style={{ backgroundColor: TEAL }}
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => destroy(mechanic.id)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white shadow-sm hover:bg-red-700"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {mechanics.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-end gap-2 text-sm">
                                    <button
                                        type="button"
                                        disabled={!mechanics.prev_page_url}
                                        onClick={() => mechanics.prev_page_url && router.visit(mechanics.prev_page_url)}
                                        className="rounded-lg px-3 py-1.5 disabled:opacity-40"
                                        style={{ border: `1px solid ${TEAL}`, color: TEAL_DARK }}
                                    >
                                        Previous
                                    </button>
                                    <span
                                        className="rounded-lg px-3 py-1.5 text-sm font-semibold text-white"
                                        style={{ backgroundColor: TEAL }}
                                    >
                                        {mechanics.current_page} / {mechanics.last_page}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={!mechanics.next_page_url}
                                        onClick={() => mechanics.next_page_url && router.visit(mechanics.next_page_url)}
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

            <MechanicManagementModal isOpen={modalOpen} onClose={closeModal} mechanic={editingMechanic} />
        </AuthenticatedLayout>
    );
}
