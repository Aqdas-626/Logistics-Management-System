import { PencilIcon, TrashIcon } from '@/Components/Icons';

export default function PackageTypeTable({ packageTypes, onEdit, onDelete }) {
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
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {packageTypes.data && packageTypes.data.length > 0 ? (
                        packageTypes.data.map((packageType) => (
                            <tr key={packageType.id} className="hover:bg-gray-50">
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                    {packageType.id}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                    {packageType.name}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                    <div className="inline-flex items-center justify-end gap-0.5">
                                        <button
                                            type="button"
                                            onClick={() => onEdit(packageType)}
                                            className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                            title="Edit"
                                            aria-label="Edit"
                                        >
                                            <PencilIcon className="h-5 w-5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onDelete(packageType.id)
                                            }
                                            className="inline-flex rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-800"
                                            title="Delete"
                                            aria-label="Delete"
                                        >
                                            <TrashIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                No package types found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

