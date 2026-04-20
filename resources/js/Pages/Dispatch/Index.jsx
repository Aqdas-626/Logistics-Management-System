import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { MagnifyingGlassIcon, EyeIcon, TrashIcon } from '@/Components/Icons';
import { confirmDelete } from '@/Utils/confirmDelete';

export default function Index({ dispatches, filters }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [selectedIds, setSelectedIds] = useState([]);

    const pageIds = useMemo(
        () => dispatches?.data?.map((d) => d.id) || [],
        [dispatches?.data],
    );
    const isAllSelected =
        pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    const submitSearch = (e) => {
        e.preventDefault();
        router.get(
            route('dispatches.index'),
            { search, status },
            { preserveState: true, replace: true },
        );
    };

    const handleDelete = (id) => {
        confirmDelete({
            message: 'Are you sure you want to delete this dispatch?',
            onConfirm: () => {
                router.delete(route('dispatches.destroy', id));
            },
        });
    };

    const getExportUrl = (baseUrl) => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (status) params.set('status', status);
        return `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
    };

    const csvExportUrl = getExportUrl(route('dispatches.export.csv'));
    const excelExportUrl = getExportUrl(route('dispatches.export.excel'));
    const pdfExportUrl = getExportUrl(route('dispatches.export.pdf'));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds((prev) =>
                prev.filter((id) => !pageIds.includes(id)),
            );
            return;
        }
        setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    };

    const toggleSelectOne = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );
    };

    const downloadSelected = (type) => {
        if (selectedIds.length === 0) {
            window.alert('Please select at least one row to download.');
            return;
        }

        const baseUrl =
            type === 'excel'
                ? excelExportUrl
                : type === 'csv'
                  ? csvExportUrl
                  : pdfExportUrl;
        const separator = baseUrl.includes('?') ? '&' : '?';
        window.location.href = `${baseUrl}${separator}ids=${selectedIds.join(',')}`;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dispatches" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Dispatches</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        View dispatched jobs and driver assignments
                    </p>
                </div>

                <form
                    onSubmit={submitSearch}
                    className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                >
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => downloadSelected('excel')}
                            className="rounded px-2 py-1 text-xs font-semibold text-white"
                            style={{ backgroundColor: '#20A4AC' }}
                        >
                            Excel
                        </button>
                        <button
                            type="button"
                            onClick={() => downloadSelected('csv')}
                            className="rounded px-2 py-1 text-xs font-semibold text-white"
                            style={{ backgroundColor: '#1B8D95' }}
                        >
                            CSV
                        </button>
                        <button
                            type="button"
                            onClick={() => downloadSelected('pdf')}
                            className="rounded px-2 py-1 text-xs font-semibold text-white"
                            style={{ backgroundColor: '#146A70' }}
                        >
                            PDF
                        </button>
                    </div>

                    <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center md:justify-end">
                        <div className="relative w-full md:w-[22rem]">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search job, driver, vehicle, notes..."
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-[#20A4AC] focus:outline-none"
                            />
                        </div>

                        <select
                            value={status}
                            onChange={(e) => {
                                const v = e.target.value;
                                setStatus(v);
                                router.get(
                                    route('dispatches.index'),
                                    { search, status: v },
                                    { preserveState: true, replace: true },
                                );
                            }}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none md:w-48"
                        >
                            <option value="">All Status</option>
                            <option value="IN_PROCESS">IN_PROCESS</option>
                            <option value="COMPLETED">COMPLETED</option>
                        </select>

                        <button
                            type="submit"
                            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 md:w-auto"
                            title="Search"
                            aria-label="Search"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </div>
                </form>

                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-600">
                            <tr>
                                <th className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected && pageIds.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-400 text-[#20A4AC] focus:ring-[#20A4AC]"
                                        aria-label="Select all on this page"
                                    />
                                </th>
                                <th className="px-4 py-3">Job Type</th>
                                <th className="px-4 py-3">Job #</th>
                                <th className="px-4 py-3">Container #</th>
                                <th className="px-4 py-3">Driver</th>
                                <th className="px-4 py-3">Vehicle</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Dispatched At</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {dispatches?.data?.length ? (
                                dispatches.data.map((d) => (
                                    <tr key={d.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(d.id)}
                                                onChange={() => toggleSelectOne(d.id)}
                                                className="rounded border-gray-400 text-[#20A4AC] focus:ring-[#20A4AC]"
                                                aria-label={`Select dispatch ${d.id}`}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            {d.job_type_label || '—'}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {d.job_number || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {d.container_number || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-gray-900">
                                                {d.driver?.name ||
                                                    d.driver?.driver_code ||
                                                    '—'}
                                            </div>
                                            {d.driver?.email && (
                                                <div className="text-xs text-gray-500">
                                                    {d.driver.email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {d.vehicle?.registration_no || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                                                {d.status || '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {d.dispatched_at || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={route(
                                                        'dispatches.show',
                                                        d.id,
                                                    )}
                                                    className="inline-flex items-center justify-center text-[#178089]"
                                                    title="View"
                                                    aria-label="View dispatch"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(d.id)
                                                    }
                                                    className="inline-flex items-center justify-center text-red-600"
                                                    title="Delete"
                                                    aria-label="Delete dispatch"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-4 py-10 text-center text-gray-500"
                                    >
                                        No dispatch records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {dispatches?.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing{' '}
                            <span className="font-medium">
                                {dispatches.from}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">{dispatches.to}</span>{' '}
                            of{' '}
                            <span className="font-medium">
                                {dispatches.total}
                            </span>{' '}
                            dispatches
                        </div>
                        <div className="flex gap-2">
                            {dispatches.prev_page_url && (
                                <a
                                    href={dispatches.prev_page_url}
                                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Previous
                                </a>
                            )}
                            {dispatches.next_page_url && (
                                <a
                                    href={dispatches.next_page_url}
                                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

