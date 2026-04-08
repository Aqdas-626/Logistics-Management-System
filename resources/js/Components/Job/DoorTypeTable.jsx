import { PencilIcon, TrashIcon } from '@/Components/Icons';

export default function DoorTypeTable({ doorTypes, onEdit, onDelete }) {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Created</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {doorTypes.data.map((doorType) => (
                        <tr key={doorType.id} className="hover:bg-gray-50 transition-colors">
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{doorType.name}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                {new Date(doorType.created_at).toLocaleDateString()}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                <div className="inline-flex items-center justify-end gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(doorType)}
                                        className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                        title="Edit"
                                        aria-label="Edit"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(doorType.id)}
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
                    {doorTypes.data.length === 0 && (
                        <tr>
                            <td colSpan="3" className="px-6 py-12 text-center text-gray-500 text-sm">
                                No door types found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

