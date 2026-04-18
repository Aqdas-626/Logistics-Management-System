import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ExpenseCategoryModal from '@/Components/Expense/ExpenseCategoryModal';
import ExpenseCategoryTable from '@/Components/Expense/ExpenseCategoryTable';
import {
    ArrowRightIcon,
    MagnifyingGlassIcon,
    PlusIcon,
} from '@/Components/Icons';
import { confirmDelete } from '@/Utils/confirmDelete';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Index({ expenseCategories, companies, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [companyFilter, setCompanyFilter] = useState(
        filters?.company_id != null && filters?.company_id !== '' ? String(filters.company_id) : '',
    );

    const handleCreate = () => {
        setSelected(null);
        setIsModalOpen(true);
    };

    const handleEdit = (row) => {
        setSelected(row);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        confirmDelete({
            message: 'Are you sure you want to delete this expense category?',
            onConfirm: () => {
                router.delete(route('expense-categories.destroy', id));
            },
        });
    };

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(
            route('expense-categories.index'),
            {
                search: searchTerm || undefined,
                company_id: companyFilter || undefined,
            },
            { preserveState: true },
        );
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelected(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Expense Categories" />

            <div>
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Expense Categories</h1>
                        <p className="mt-2 text-gray-600">Define categories for expenses (optionally per company)</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        <PlusIcon className="h-5 w-5" />
                        New Category
                    </button>
                </div>

                <form
                    onSubmit={handleFilter}
                    className="mb-6 flex w-full flex-col flex-wrap items-stretch justify-end gap-2 sm:flex-row sm:items-center"
                >
                    <div className="relative min-w-0 w-full max-w-md flex-1 sm:max-w-xs">
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
                    <div className="relative min-w-0 w-full max-w-md flex-1 md:max-w-md">
                        <label className="mb-1 block text-xs font-medium text-gray-500">Search</label>
                        <div className="relative">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#20A4AC] focus:outline-none"
                            />
                        </div>
                    </div>
                    <div className="flex items-end gap-2">
                        <button
                            type="submit"
                            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 focus:border-[#20A4AC] focus:outline-none"
                            title="Apply filters"
                            aria-label="Apply filters"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </div>
                </form>

                <ExpenseCategoryTable
                    expenseCategories={expenseCategories}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                {expenseCategories?.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium">{expenseCategories.from}</span> to{' '}
                            <span className="font-medium">{expenseCategories.to}</span> of{' '}
                            <span className="font-medium">{expenseCategories.total}</span> categories
                        </div>
                        <div className="flex gap-2">
                            {expenseCategories.prev_page_url && (
                                <a
                                    href={expenseCategories.prev_page_url}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <ArrowRightIcon className="h-4 w-4 rotate-180" aria-hidden />
                                    Previous
                                </a>
                            )}
                            {expenseCategories.next_page_url && (
                                <a
                                    href={expenseCategories.next_page_url}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                    <ArrowRightIcon className="h-4 w-4" aria-hidden />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                <ExpenseCategoryModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    expenseCategory={selected}
                    companies={companies}
                />
            </div>
        </AuthenticatedLayout>
    );
}
