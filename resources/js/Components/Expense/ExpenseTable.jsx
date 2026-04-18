import { Link } from '@inertiajs/react';
import { EyeIcon, PencilIcon, TrashIcon } from '@/Components/Icons';

const statusClass = (status) => {
    switch (status) {
        case 'approved':
            return 'bg-emerald-100 text-emerald-800';
        case 'submitted':
            return 'bg-blue-100 text-blue-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

export default function ExpenseTable({ expenses, onDelete }) {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                Date
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                Title
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                Category
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                Company
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                                Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                                Status
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {expenses.data.map((row) => (
                            <tr key={row.id} className="transition-colors hover:bg-gray-50">
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                    {row.expense_date
                                        ? String(row.expense_date).slice(0, 10)
                                        : '—'}
                                </td>
                                <td className="max-w-[200px] truncate px-4 py-3 text-sm font-medium text-gray-900">
                                    {row.title}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                    {row.expense_category?.name ?? '—'}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">
                                    {row.company?.name ?? '—'}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-gray-900">
                                    {new Intl.NumberFormat('en-NZ', {
                                        style: 'currency',
                                        currency: row.currency || 'NZD',
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    }).format(Number(row.amount))}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(row.status)}`}
                                    >
                                        {row.status}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                                    <div className="inline-flex items-center justify-end gap-0.5">
                                        <Link
                                            href={route('expenses.show', row.id)}
                                            className="inline-flex rounded-md p-1.5 text-gray-600 hover:bg-gray-100"
                                            title="View"
                                            aria-label="View"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </Link>
                                        <Link
                                            href={route('expenses.edit', row.id)}
                                            className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10"
                                            title="Edit"
                                            aria-label="Edit"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(row.id)}
                                            className="inline-flex rounded-md p-1.5 text-red-600 hover:bg-red-50"
                                            title="Delete"
                                            aria-label="Delete"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {expenses.data.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500">
                                    No expenses found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
