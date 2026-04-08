import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import CustomerTable from '@/Components/Customer/CustomerTable';
import {
    ArrowRightIcon,
    MagnifyingGlassIcon,
    PlusIcon,
} from '@/Components/Icons';

export default function Index({ customers, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [typeFilter, setTypeFilter] = useState(filters.type || '');

    const handleCreate = () => {
        router.visit(route('customers.create'));
    };

    const handleEdit = (customer) => {
        router.visit(route('customers.edit', customer.id));
    };

    const handleView = (customer) => {
        router.visit(route('customers.show', customer.id));
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this customer?')) {
            router.delete(route('customers.destroy', id), {
                onSuccess: () => {
                    // Success notification will be shown by Laravel
                },
            });
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('customers.index'), {
            search: searchTerm,
            status: statusFilter,
            type: typeFilter,
        }, {
            preserveState: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Customers" />

            <div>
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                        <p className="mt-2 text-gray-600">Manage all your customers in one place</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        <PlusIcon className="h-5 w-5" />
                        New Customer
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <form
                        onSubmit={handleSearch}
                        className="flex gap-2 md:col-span-2"
                    >
                        <div className="relative min-w-0 flex-1">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
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
                        <button
                            type="submit"
                            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 focus:border-[#20A4AC] focus:outline-none"
                            title="Search"
                            aria-label="Search"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </form>

                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            router.get(route('customers.index'), {
                                search: searchTerm,
                                status: e.target.value,
                                type: typeFilter,
                            }, { preserveState: true });
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-[#20A4AC] focus:outline-none"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="blocked">Blocked</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => {
                            setTypeFilter(e.target.value);
                            router.get(route('customers.index'), {
                                search: searchTerm,
                                status: statusFilter,
                                type: e.target.value,
                            }, { preserveState: true });
                        }}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-[#20A4AC] focus:outline-none"
                    >
                        <option value="">All Types</option>
                        <option value="business">Business</option>
                        <option value="individual">Individual</option>
                    </select>
                </div>

                {/* Table */}
                <CustomerTable
                    customers={customers}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                />

                {/* Pagination */}
                {customers.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium">{customers.from}</span> to{' '}
                            <span className="font-medium">{customers.to}</span> of{' '}
                            <span className="font-medium">{customers.total}</span> customers
                        </div>
                        <div className="flex gap-2">
                            {customers.prev_page_url && (
                                <a
                                    href={customers.prev_page_url}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <ArrowRightIcon className="h-4 w-4 rotate-180" aria-hidden />
                                    Previous
                                </a>
                            )}
                            {customers.next_page_url && (
                                <a
                                    href={customers.next_page_url}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                    <ArrowRightIcon className="h-4 w-4" aria-hidden />
                                </a>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </AuthenticatedLayout>
    );
}
