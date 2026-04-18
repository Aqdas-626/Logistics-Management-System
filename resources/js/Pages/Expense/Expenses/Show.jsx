import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link } from '@inertiajs/react';

export default function Show({ expense, receiptUrl }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">Expense detail</h2>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={route('expenses.edit', expense.id)}
                                className="inline-flex items-center justify-center rounded-lg bg-[#20A4AC] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#1a8d95]"
                            >
                                Edit
                            </Link>
                            <Link href={route('expenses.index')}>
                                <SecondaryButton type="button">Back to list</SecondaryButton>
                            </Link>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={expense.title} />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="space-y-6 bg-white p-6 shadow sm:rounded-lg">
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs font-semibold uppercase text-gray-500">Title</dt>
                                <dd className="mt-1 text-gray-900">{expense.title}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase text-gray-500">Status</dt>
                                <dd className="mt-1 text-gray-900">{expense.status}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase text-gray-500">Category</dt>
                                <dd className="mt-1 text-gray-900">{expense.expense_category?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase text-gray-500">Expense date</dt>
                                <dd className="mt-1 text-gray-900">
                                    {expense.expense_date ? String(expense.expense_date).slice(0, 10) : '—'}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase text-gray-500">Company</dt>
                                <dd className="mt-1 text-gray-900">{expense.company?.name ?? '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase text-gray-500">Branch</dt>
                                <dd className="mt-1 text-gray-900">{expense.branch?.name ?? '—'}</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-xs font-semibold uppercase text-gray-500">Amount</dt>
                                <dd className="mt-1 text-lg font-semibold text-gray-900">
                                    {new Intl.NumberFormat('en-NZ', {
                                        style: 'currency',
                                        currency: expense.currency || 'NZD',
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format(Number(expense.amount))}
                                </dd>
                            </div>
                            {expense.description && (
                                <div className="sm:col-span-2">
                                    <dt className="text-xs font-semibold uppercase text-gray-500">Description</dt>
                                    <dd className="mt-1 whitespace-pre-wrap text-gray-700">{expense.description}</dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-xs font-semibold uppercase text-gray-500">Payment method</dt>
                                <dd className="mt-1 text-gray-900">{expense.payment_method || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase text-gray-500">Reference</dt>
                                <dd className="mt-1 text-gray-900">{expense.reference_no || '—'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs font-semibold uppercase text-gray-500">Created by</dt>
                                <dd className="mt-1 text-gray-900">{expense.creator?.name ?? '—'}</dd>
                            </div>
                            {expense.approver && (
                                <div>
                                    <dt className="text-xs font-semibold uppercase text-gray-500">Approved by</dt>
                                    <dd className="mt-1 text-gray-900">{expense.approver.name}</dd>
                                </div>
                            )}
                        </dl>

                        {receiptUrl && (
                            <div className="border-t pt-4">
                                <p className="text-sm font-medium text-gray-700">Receipt</p>
                                <a
                                    href={receiptUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-2 inline-block text-[#20A4AC] hover:underline"
                                >
                                    Open receipt
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
