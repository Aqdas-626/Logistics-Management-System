import { Link } from '@inertiajs/react';
import { PencilIcon, TrashIcon } from '@/Components/Icons';

export default function LocationTable({ locations, onDelete }) {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Code
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {locations.data.map((location) => (
                        <tr
                            key={location.id}
                            className="transition-colors hover:bg-gray-50"
                        >
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                {location.name}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                {location.location_code || '-'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                                {location.company?.name}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                        location.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}
                                >
                                    {location.status}
                                </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                <Link
                                    href={route(
                                        'locations.edit',
                                        location.id,
                                    )}
                                    className="mr-3 inline-flex text-[#20A4AC] hover:text-[#0d4f54]"
                                    title="Edit"
                                    aria-label="Edit location"
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => onDelete(location.id)}
                                    className="inline-flex text-red-600 hover:text-red-900"
                                    title="Delete"
                                    aria-label="Delete location"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {locations.data.length === 0 && (
                        <tr>
                            <td
                                colSpan="5"
                                className="px-6 py-12 text-center text-sm text-gray-500"
                            >
                                No locations found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
