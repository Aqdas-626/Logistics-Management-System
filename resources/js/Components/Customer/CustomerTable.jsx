import { EyeIcon, PencilIcon, TrashIcon } from '@/Components/Icons';

export default function CustomerTable({ customers, onEdit, onView, onDelete }) {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Contact</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {customers.data.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{customer.customer_code}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{customer.name}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                    customer.type === 'business' ? 'bg-[#20A4AC]/15 text-[#0f5c61]' : 'bg-green-100 text-green-800'
                                }`}>
                                    {customer.type}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                    customer.status === 'active' ? 'bg-green-100 text-green-800' :
                                    customer.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {customer.status}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                {customer.contacts.length > 0 && customer.contacts[0]?.phone}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                <div className="inline-flex items-center justify-end gap-0.5">
                                    {onView ? (
                                        <button
                                            type="button"
                                            onClick={() => onView(customer)}
                                            className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                            title="View"
                                            aria-label="View"
                                        >
                                            <EyeIcon className="h-5 w-5" />
                                        </button>
                                    ) : null}
                                    <button
                                        type="button"
                                        onClick={() => onEdit(customer)}
                                        className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                        title="Edit"
                                        aria-label="Edit"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(customer.id)}
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
                </tbody>
            </table>
        </div>
    );
}
