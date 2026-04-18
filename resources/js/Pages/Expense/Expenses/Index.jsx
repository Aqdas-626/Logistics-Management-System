import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ExpenseTable from '@/Components/Expense/ExpenseTable';
import { MagnifyingGlassIcon, PlusIcon } from '@/Components/Icons';
import { confirmDelete } from '@/Utils/confirmDelete';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ expenses, companies, filters }) {
    const { flash } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [companyFilter, setCompanyFilter] = useState(
        filters?.company_id != null && filters?.company_id !== '' ? String(filters.company_id) : '',
    );

    const applyFilters = (e) => {
        e?.preventDefault?.();
        router.get(
            route('expenses.index'),
            {
                search: searchTerm || undefined,
                status: statusFilter || undefined,
                company_id: companyFilter || undefined,
            },
            { preserveState: true },
        );
    };

    const handleDelete = (id) => {
        confirmDelete({
            message: 'Are you sure you want to delete this expense?',
            onConfirm: () => {
                router.delete(route('expenses.destroy', id));
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Expenses" />

            <div>
                {flash?.success && (
                    <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">{flash.success}</div>
                )}
                {flash?.error && (
                    <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">{flash.error}</div>
                )}

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
                        <p className="mt-2 text-gray-600">Record and track operational expenses</p>
                    </div>
                    <Link
                        href={route('expenses.create')}
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        <PlusIcon className="h-5 w-5" />
                        New expense
                    </Link>
                </div>

                <form
                    onSubmit={applyFilters}
                    className="mb-6 flex flex-col flex-wrap gap-3 md:flex-row md:items-end"
                >
                    <div className="min-w-0 flex-1 md:max-w-xs">
                        <label className="mb-1 block text-xs font-medium text-gray-500">Company</label>
                        <select
                            value={companyFilter}
                            onChange={(e) => setCompanyFilter(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-[#20A4AC] focus:outline-none"
                        >
                            <option value="">All</option>
                            {companies.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="min-w-0 flex-1 md:max-w-xs">
                        <label className="mb-1 block text-xs font-medium text-gray-500">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-[#20A4AC] focus:outline-none"
                        >
                            <option value="">All</option>
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    <div className="relative min-w-0 flex-1 md:max-w-md">
                        <label className="mb-1 block text-xs font-medium text-gray-500">Search</label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Title, description, reference…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#20A4AC] focus:outline-none"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 md:mb-0.5"
                        title="Apply filters"
                        aria-label="Apply filters"
                    >
                        <MagnifyingGlassIcon className="h-5 w-5" />
                    </button>
                </form>

                <ExpenseTable expenses={expenses} onDelete={handleDelete} />

                {expenses?.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
                        <div>
                            Showing <span className="font-medium">{expenses.from}</span> to{' '}
                            <span className="font-medium">{expenses.to}</span> of{' '}
                            <span className="font-medium">{expenses.total}</span>
                        </div>
                        <div className="flex gap-2">
                            {expenses.prev_page_url && (
                                <a
                                    href={expenses.prev_page_url}
                                    className="rounded-lg border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-50"
                                >
                                    Previous
                                </a>
                            )}
                            {expenses.next_page_url && (
                                <a
                                    href={expenses.next_page_url}
                                    className="rounded-lg border border-gray-300 px-3 py-1 text-gray-700 hover:bg-gray-50"
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
