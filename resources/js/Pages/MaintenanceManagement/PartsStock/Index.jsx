import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import SecondaryButton from '@/Components/SecondaryButton';
import InputLabel from '@/Components/InputLabel';
import PartStockModal from '@/Components/MaintenanceManagement/PartStockModal';
import { Head, Link, router, useForm } from '@inertiajs/react';
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

function formatMoney(value) {
    if (value === null || value === undefined || value === '') return '—';
    const n = Number(value);
    if (Number.isNaN(n)) return '—';
    return new Intl.NumberFormat('en-NZ', {
        style: 'currency',
        currency: 'NZD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(n);
}

export default function Index({ parts, filters }) {
    const [viewMode, setViewMode] = useState('list');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPart, setEditingPart] = useState(null);

    const { data, setData, get, processing } = useForm({
        search: filters?.search || '',
    });

    const submitSearch = (e) => {
        e.preventDefault();
        get(route('part-stocks.index'), { preserveState: true, replace: true });
    };

    const openCreate = () => {
        setEditingPart(null);
        setModalOpen(true);
    };

    const openEdit = (row) => {
        setEditingPart(row);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingPart(null);
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Delete this part stock record?',
            onConfirm: () => {
                router.delete(route('part-stocks.destroy', id));
            },
        });
    };

    const totalParts = parts.total ?? 0;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-2xl font-semibold text-gray-800 sm:text-3xl">Parts Stock</h2>
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
                            <span className="text-gray-600">Parts Stock</span>
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Parts Stock" />

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
                                        {totalParts}
                                    </span>
                                    <span className="text-sm font-medium text-gray-600">Total Parts</span>
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
                                        <InputLabel htmlFor="ps-search" value="Search" className="sr-only" />
                                        <TextInput
                                            id="ps-search"
                                            className="min-w-[200px]"
                                            value={data.search}
                                            onChange={(e) => setData('search', e.target.value)}
                                            placeholder="Search parts…"
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
                                                    SKU
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                    Name
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                    Unit
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                    Unit cost
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                    Stock
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                    Created
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-600">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {parts.data.length === 0 && (
                                                <tr>
                                                    <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                                                        No parts found.
                                                    </td>
                                                </tr>
                                            )}
                                            {parts.data.map((row, index) => (
                                                <tr key={row.id} className="hover:bg-gray-50/80">
                                                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                                                        {(parts.current_page - 1) * parts.per_page + index + 1}
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-700">{row.sku || '—'}</td>
                                                    <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                                                    <td className="px-4 py-3 text-gray-700">{row.unit}</td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">{formatMoney(row.unit_cost)}</td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-gray-700">{row.stock_qty}</td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                                                        {row.created_at
                                                            ? String(row.created_at).replace('T', ' ').slice(0, 19)
                                                            : '—'}
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-3 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEdit(row)}
                                                            className="me-2 inline-flex h-8 w-8 items-center justify-center rounded-md text-white shadow-sm"
                                                            style={{ backgroundColor: TEAL }}
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => destroy(row.id)}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-red-600 text-white shadow-sm hover:bg-red-700"
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
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {parts.data.length === 0 && (
                                        <p className="col-span-full py-10 text-center text-gray-500">No parts found.</p>
                                    )}
                                    {parts.data.map((row) => (
                                        <div
                                            key={row.id}
                                            className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                                            style={{ borderTopWidth: 3, borderTopColor: TEAL }}
                                        >
                                            <p className="text-xs text-gray-500">{row.sku || 'No SKU'}</p>
                                            <h3 className="text-lg font-semibold text-gray-900">{row.name}</h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                {row.unit} · Qty {row.stock_qty}
                                            </p>
                                            <p className="text-sm text-gray-600">Cost: {formatMoney(row.unit_cost)}</p>
                                            <div className="mt-4 flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openEdit(row)}
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white shadow-sm"
                                                    style={{ backgroundColor: TEAL }}
                                                    title="Edit"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => destroy(row.id)}
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

                            {parts.last_page > 1 && (
                                <div className="mt-6 flex items-center justify-end gap-2 text-sm">
                                    <button
                                        type="button"
                                        disabled={!parts.prev_page_url}
                                        onClick={() => parts.prev_page_url && router.visit(parts.prev_page_url)}
                                        className="rounded-lg px-3 py-1.5 disabled:opacity-40"
                                        style={{ border: `1px solid ${TEAL}`, color: TEAL_DARK }}
                                    >
                                        Previous
                                    </button>
                                    <span
                                        className="rounded-lg px-3 py-1.5 font-semibold text-white"
                                        style={{ backgroundColor: TEAL }}
                                    >
                                        {parts.current_page} / {parts.last_page}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={!parts.next_page_url}
                                        onClick={() => parts.next_page_url && router.visit(parts.next_page_url)}
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

            <PartStockModal isOpen={modalOpen} onClose={closeModal} part={editingPart} />
        </AuthenticatedLayout>
    );
}
