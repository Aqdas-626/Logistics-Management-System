import { PencilIcon, TrashIcon } from '@/Components/Icons';

export default function VesselTable({ vessels, onEdit, onDelete }) {
    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'inactive':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">IMO</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Country</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Ship Type</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {vessels.data.map((vessel) => (
                        <tr key={vessel.id} className="hover:bg-gray-50 transition-colors">
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{vessel.name}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-mono text-gray-900">{vessel.imo_number}</td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                {vessel.country ? vessel.country.name : 'N/A'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                {vessel.shipType ? vessel.shipType.name : 'N/A'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(vessel.status)}`}>
                                    {vessel.status}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                <div className="inline-flex items-center justify-end gap-0.5">
                                    <button
                                        type="button"
                                        onClick={() => onEdit(vessel)}
                                        className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                        title="Edit"
                                        aria-label="Edit"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDelete(vessel.id)}
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
                    {vessels.data.length === 0 && (
                        <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 text-sm">
                                No vessels found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

