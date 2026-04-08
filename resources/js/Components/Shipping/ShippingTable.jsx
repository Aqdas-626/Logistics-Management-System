import { PencilIcon, TrashIcon } from '@/Components/Icons';

export default function ShippingTable({ shippings, onEdit, onDelete }) {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Created</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {shippings.data.map((shipping) => (
                        <tr key={shipping.id} className="hover:bg-gray-50 transition-colors">
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{shipping.name}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{shipping.code || '-'}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                    shipping.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {shipping.status ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                {new Date(shipping.created_at).toLocaleDateString()}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                <div className="inline-flex items-center justify-end gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(shipping)}
                                        className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                        title="Edit"
                                        aria-label="Edit"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(shipping.id)}
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
                    {shippings.data.length === 0 && (
                        <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-sm">
                                No shippings found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

