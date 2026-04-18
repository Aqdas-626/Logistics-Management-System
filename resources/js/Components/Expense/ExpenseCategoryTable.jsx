import { PencilIcon, TrashIcon } from '@/Components/Icons';

export default function ExpenseCategoryTable({ expenseCategories, onEdit, onDelete }) {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Sort
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {expenseCategories.data.map((row) => (
                        <tr key={row.id} className="transition-colors hover:bg-gray-50">
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                                {row.company?.name ?? '—'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                {row.name}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                {row.code || '—'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                {row.sort_order ?? 0}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                <span
                                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        row.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {row.status}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                {new Date(row.created_at).toLocaleDateString()}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                <div className="inline-flex items-center justify-end gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(row)}
                                        className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                        title="Edit"
                                        aria-label="Edit"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(row.id)}
                                        className="inline-flex rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-800"
                                        title="Delete"
                                        aria-label="Delete"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {expenseCategories.data.length === 0 && (
                        <tr>
                            <td colSpan="7" className="px-6 py-12 text-center text-sm text-gray-500">
                                No expense categories found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
