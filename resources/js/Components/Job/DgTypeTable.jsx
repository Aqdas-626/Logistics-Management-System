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
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium space-x-2">
                                    <button
                                        onClick={() => onEdit(dgType)}
                                        className="inline-flex items-center rounded-lg bg-[#20A4AC] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1a8d95] transition-colors"
                                    >
                                        <PencilIcon className="mr-1 h-3 w-3" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => onDelete(dgType.id)}
                                        className="inline-flex items-center rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                                    >
                                        <TrashIcon className="mr-1 h-3 w-3" />
                                        Delete
                                    </button>
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

