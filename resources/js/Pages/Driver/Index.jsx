import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PencilIcon, TrashIcon, CloudArrowUpIcon } from '@/Components/Icons';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ drivers, filters }) {
    const { flash } = usePage().props;
    const [openActionId, setOpenActionId] = useState(null);
    const { data, setData, get, processing } = useForm({
        search: filters?.search || '',
    });

    const searchSubmit = (e) => {
        e.preventDefault();
        get(route('drivers.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const destroy = (id) => {
        if (confirm('Delete this driver?')) {
            router.delete(route('drivers.destroy', id));
        }
    };

    const toggleActions = (id) => {
        setOpenActionId((prev) => (prev === id ? null : id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Drivers
                    </h2>
                    <Link
                        href={route('drivers.create')}
                        className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#20A4AC] focus:ring-offset-2 active:opacity-80"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        Add Driver
                    </Link>
                </div>
                </div>
            }
        >
            <Head title="Drivers" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
                            {flash.error}
                        </div>
                    )}
                    <div className="mb-6 flex w-full justify-end">
                        <form
                            onSubmit={searchSubmit}
                            className="flex max-w-full flex-wrap items-end justify-end gap-4"
                        >
                            <div>
                                <InputLabel htmlFor="search" value="Search" />
                                <TextInput
                                    id="search"
                                    className="mt-1 block w-64"
                                    value={data.search}
                                    onChange={(e) =>
                                        setData('search', e.target.value)
                                    }
                                    placeholder="Driver name, code, phone, email"
                                />
                            </div>
                            <SecondaryButton type="submit" disabled={processing}>
                                Search
                            </SecondaryButton>
                        </form>
                    </div>

                    <div className="overflow-visible bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-visible p-6">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Code
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Name
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Company
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Status
                                        </th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {drivers.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-3 py-8 text-center text-gray-500"
                                            >
                                                No drivers found.
                                            </td>
                                        </tr>
                                    )}
                                    {drivers.data.map((driver) => (
                                        <tr key={driver.id}>
                                            <td className="px-3 py-2 font-medium text-gray-900">
                                                {driver.driver_code}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                                {driver.name}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                                {driver.company?.name || '—'}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                                {driver.status}
                                            </td>
                                            <td className="relative overflow-visible px-3 py-2 text-right">
                                                <div className="relative inline-flex">
                                                    <button
                                                        type="button"
                                                        className="rounded px-2 py-1 text-lg font-bold leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                                        onClick={() => toggleActions(driver.id)}
                                                        aria-label="Open actions menu"
                                                    >
                                                        ...
                                                    </button>
                                                    {openActionId === driver.id && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                className="fixed inset-0 z-40 cursor-default"
                                                                onClick={() => setOpenActionId(null)}
                                                                aria-label="Close menu"
                                                            />
                                                            <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                                                                <Link
                                                                    href={route('drivers.edit', driver.id)}
                                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    <PencilIcon className="h-4 w-4 text-gray-500" />
                                                                    Edit
                                                                </Link>
                                                                <Link
                                                                    href={route('drivers.documents.index', driver.id)}
                                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                                >
                                                                    <CloudArrowUpIcon className="h-4 w-4 text-gray-500" />
                                                                    Documents
                                                                </Link>
                                                                <button
                                                                    type="button"
                                                                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                                                    onClick={() => {
                                                                        setOpenActionId(null);
                                                                        destroy(driver.id);
                                                                    }}
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
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

