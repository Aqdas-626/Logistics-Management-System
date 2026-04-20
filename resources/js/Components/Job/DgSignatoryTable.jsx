import { PencilIcon, TrashIcon } from '@/Components/Icons';

export default function DgSignatoryTable({ dgSignatories, onEdit, onDelete }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Certificate No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expiry Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {dgSignatories.data && dgSignatories.data.length > 0 ? (
                        dgSignatories.data.map((dgSignatory) => (
                            <tr key={dgSignatory.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                    {dgSignatory.id}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {dgSignatory.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {dgSignatory.certificate_no}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {dgSignatory.expiry_date ? new Date(dgSignatory.expiry_date).toLocaleDateString() : '-'}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                            dgSignatory.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {dgSignatory.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(dgSignatory)}
                                            title="Edit"
                                            aria-label="Edit DG signatory"
                                            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-[#178089] shadow-sm hover:bg-gray-50"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onDelete(dgSignatory.id)}
                                            title="Delete"
                                            aria-label="Delete DG signatory"
                                            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-red-600 shadow-sm hover:bg-gray-50"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                No DG signatories found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

