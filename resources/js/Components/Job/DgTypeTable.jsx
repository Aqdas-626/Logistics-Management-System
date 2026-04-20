import { PencilIcon, TrashIcon } from '@/Components/Icons';

export default function DgTypeTable({ dgTypes, onEdit, onDelete }) {
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
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {dgTypes.data && dgTypes.data.length > 0 ? (
                        dgTypes.data.map((dgType) => (
                            <tr key={dgType.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                    {dgType.id}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {dgType.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                    <span
                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                            dgType.status
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {dgType.status ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                    <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onEdit(dgType)}
                                        type="button"
                                        title="Edit"
                                        aria-label="Edit DG type"
                                        className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white p-2 text-[#178089] shadow-sm hover:bg-gray-50"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(dgType.id)}
                                        type="button"
                                        title="Delete"
                                        aria-label="Delete DG type"
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
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                No DG types found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

