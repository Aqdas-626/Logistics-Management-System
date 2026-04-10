import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import LocationTable from '@/Components/Location/LocationTable';
import { MagnifyingGlassIcon, PlusIcon } from '@/Components/Icons';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { confirmDelete } from '@/Utils/confirmDelete';

export default function Index({ locations, filters }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');

    const handleDelete = (id) => {
        confirmDelete({
            message: 'Are you sure you want to delete this location?',
            onConfirm: () => {
            router.delete(route('locations.destroy', id));
            },
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('locations.index'),
            {
                search: searchTerm,
                status: statusFilter,
            },
            {
                preserveState: true,
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Locations" />

            <div>
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

                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Locations
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Manage all your locations
                        </p>
                    </div>
                    <Link
                        href={route('locations.create')}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        <PlusIcon className="h-5 w-5" />
                        New Location
                    </Link>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    <form onSubmit={handleSearch} className="md:col-span-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && handleSearch(e)
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#20A4AC] focus:outline-none"
                            />
                        </div>
                    </form>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            router.get(
                                route('locations.index'),
                                {
                                    search: searchTerm,
                                    status: e.target.value,
                                },
                                { preserveState: true },
                            );
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-[#20A4AC] focus:outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>

                <LocationTable
                    locations={locations}
                    onDelete={handleDelete}
                />

                {locations.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing{' '}
                            <span className="font-medium">
                                {locations.from}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">{locations.to}</span>{' '}
                            of{' '}
                            <span className="font-medium">
                                {locations.total}
                            </span>{' '}
                            locations
                        </div>
                        <div className="flex gap-2">
                            {locations.prev_page_url && (
                                <a
                                    href={locations.prev_page_url}
                                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Previous
                                </a>
                            )}
                            {locations.next_page_url && (
                                <a
                                    href={locations.next_page_url}
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
