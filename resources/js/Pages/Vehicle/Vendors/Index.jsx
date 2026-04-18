import { useMemo, useState } from 'react';
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

export default function Index({ vendors, filters }) {
    const { flash } = usePage().props;
    const [selectedIds, setSelectedIds] = useState([]);
    const { data, setData, get, processing } = useForm({
        search: filters?.search || '',
    });

    const submitSearch = (e) => {
        e.preventDefault();
        get(route('vehicle-vendors.index'), { preserveState: true, replace: true });
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Delete this vehicle vendor?',
            onConfirm: () => {
                router.delete(route('vehicle-vendors.destroy', id));
            },
        });
    };

    const getExportUrl = (baseUrl) => {
        const params = new URLSearchParams();
        if (data.search) params.set('search', data.search);
        return `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
    };

    const csvExportUrl = getExportUrl(route('vehicle-vendors.export.csv'));
    const excelExportUrl = getExportUrl(route('vehicle-vendors.export.excel'));
    const pdfExportUrl = getExportUrl(route('vehicle-vendors.export.pdf'));
    const currentPageIds = useMemo(() => vendors.data.map((vendor) => vendor.id), [vendors.data]);
    const isAllSelected = currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.includes(id));

    const copyTable = async () => {
        const header = ['S.NO', 'COMPANY', 'CONTACT PERSON', 'MOBILE', 'DATE OF CONTRACT', 'CONTRACT DOC', 'ADDRESS', 'IS ACTIVE'];
        const rows = vendors.data.map((vendor, index) => [
            index + 1,
            vendor.vendor_name,
            vendor.contact_person,
            vendor.mobile_number,
            vendor.date_of_contract || '-',
            vendor.contract_document ? 'Yes' : '-',
            vendor.address,
            String(vendor.status).replace('_', ' '),
        ]);
        const content = [header, ...rows].map((row) => row.join('\t')).join('\n');
        await navigator.clipboard.writeText(content);
    };

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
            return;
        }

        setSelectedIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
    };

    const toggleSelectOne = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    };

    const downloadSelected = (type) => {
        if (selectedIds.length === 0) {
            window.alert('Please select at least one row to download.');
            return;
        }

        const baseUrl = type === 'excel' ? excelExportUrl : type === 'csv' ? csvExportUrl : pdfExportUrl;
        const separator = baseUrl.includes('?') ? '&' : '?';
        window.location.href = `${baseUrl}${separator}ids=${selectedIds.join(',')}`;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-4xl font-semibold leading-tight text-gray-800">
                        Vehicle Vendors Info
                        <Link
                            href={route('vehicle-vendors.create')}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-white"
                            style={{ backgroundColor: TEAL }}
                            title="Add Vehicle Vendor"
                        >
                            +
                        </Link>
                    </h2>
                </div>
            }
        >
            <Head title="Vehicle Vendors Info" />

            <div className="py-2">
                <div className="mx-auto max-w-7xl">
                    {flash?.success && <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">{flash.success}</div>}

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="p-4">
                            <div className="mb-4 flex flex-col items-start justify-between gap-3 lg:flex-row lg:items-center">
                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={copyTable}
                                        className="rounded px-2 py-1 text-xs font-semibold text-white"
                                        style={{ backgroundColor: TEAL_DARK }}
                                    >
                                        Copy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => downloadSelected('excel')}
                                        className="rounded px-2 py-1 text-xs font-semibold text-white"
                                        style={{ backgroundColor: TEAL }}
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
                                        <th className="px-3 py-2 text-left text-gray-700">
                                            <input type="checkbox" checked={isAllSelected} onChange={toggleSelectAll} />
                                        </th>
                                        <th className="px-3 py-2 text-left text-gray-700">S.NO</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Company</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Contact Person</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Mobile</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Contract Date</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Contract Doc</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Address</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Status</th>
                                        <th className="px-3 py-2 text-right text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {vendors.data.length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="px-3 py-8 text-center text-gray-500">
                                                No vehicle vendors found.
                                            </td>
                                        </tr>
                                    )}
                                    {vendors.data.map((vendor, index) => (
                                        <tr key={vendor.id}>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(vendor.id)}
                                                    onChange={() => toggleSelectOne(vendor.id)}
                                                />
                                            </td>
                                            <td className="px-3 py-2">{(vendors.current_page - 1) * vendors.per_page + index + 1}</td>
                                            <td className="px-3 py-2">{vendor.vendor_name}</td>
                                            <td className="px-3 py-2">{vendor.contact_person}</td>
                                            <td className="px-3 py-2">{vendor.mobile_number}</td>
                                            <td className="px-3 py-2">{vendor.date_of_contract}</td>
                                            <td className="px-3 py-2">{vendor.contract_document ? 'Yes' : '-'}</td>
                                            <td className="px-3 py-2">{vendor.address}</td>
                                            <td className="px-3 py-2 capitalize">
                                                <span
                                                    className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
                                                    style={{ backgroundColor: TEAL_SOFT, color: TEAL_DARK }}
                                                >
                                                    {String(vendor.status).replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <Link
                                                    href={route('vehicle-vendors.edit', vendor.id)}
                                                    className="me-2 inline-flex items-center text-[#178089] hover:text-[#0f5c61]"
                                                    title="Edit"
                                                    aria-label="Edit vehicle vendor"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                    aria-label="Delete vehicle vendor"
                                                    onClick={() => destroy(vendor.id)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {vendors.last_page > 1 && (
                                <div className="mt-4 flex items-center justify-end gap-2 text-sm">
                                    <button
                                        type="button"
                                        disabled={!vendors.prev_page_url}
                                        onClick={() => vendors.prev_page_url && router.visit(vendors.prev_page_url)}
                                        className="rounded px-3 py-1 disabled:opacity-40"
                                        style={{ border: `1px solid ${TEAL}` }}
                                    >
                                        Previous
                                    </button>
                                    <span className="rounded px-3 py-1 text-white" style={{ backgroundColor: TEAL }}>
                                        {vendors.current_page}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={!vendors.next_page_url}
                                        onClick={() => vendors.next_page_url && router.visit(vendors.next_page_url)}
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

