import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { PencilIcon, TrashIcon } from '@/Components/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { confirmDelete } from '@/Utils/confirmDelete';

export default function Index({ devices, filters }) {
    const { flash } = usePage().props;
    const { data, setData, get, processing } = useForm({
        search: filters?.search || '',
    });

    const submitSearch = (e) => {
        e.preventDefault();
        get(route('traccar-devices.index'), { preserveState: true, replace: true });
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Delete this Traccar device?',
            onConfirm: () => {
                router.delete(route('traccar-devices.destroy', id));
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Traccar Devices</h2>
                    <Link
                        href={route('traccar-devices.create')}
                        className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        Create Device
                    </Link>
                </div>
            }
        >
            <Head title="Traccar Devices" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">{flash.success}</div>}

                    <form onSubmit={submitSearch} className="mb-6 flex items-end gap-4">
                        <div>
                            <InputLabel htmlFor="search" value="Search" />
                            <TextInput
                                id="search"
                                className="mt-1 block w-72"
                                value={data.search}
                                onChange={(e) => setData('search', e.target.value)}
                                placeholder="Name, Traccar ID, IMEI"
                            />
                        </div>
                        <SecondaryButton type="submit" disabled={processing}>
                            Search
                        </SecondaryButton>
                    </form>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto p-6">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 text-left text-gray-700">Traccar ID</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Name</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Unique ID</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Model</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Last fix</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Position</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Status</th>
                                        <th className="px-3 py-2 text-right text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {devices.data.length === 0 && (
                                        <tr>
                                            <td colSpan={8} className="px-3 py-8 text-center text-gray-500">
                                                No Traccar devices found.
                                            </td>
                                        </tr>
                                    )}
                                    {devices.data.map((device) => (
                                        <tr key={device.id}>
                                            <td className="px-3 py-2">{device.traccar_device_id}</td>
                                            <td className="px-3 py-2">{device.name}</td>
                                            <td className="px-3 py-2">{device.unique_id || '—'}</td>
                                            <td className="px-3 py-2">{device.model || '—'}</td>
                                            <td className="px-3 py-2 text-gray-600">
                                                {device.last_fix_time
                                                    ? new Date(device.last_fix_time).toLocaleString()
                                                    : '—'}
                                            </td>
                                            <td className="px-3 py-2 text-gray-600">
                                                {device.last_latitude != null && device.last_longitude != null ? (
                                                    <a
                                                        href={`https://www.openstreetmap.org/?mlat=${device.last_latitude}&mlon=${device.last_longitude}&zoom=16`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-[#178089] hover:underline"
                                                    >
                                                        {Number(device.last_latitude).toFixed(5)},{' '}
                                                        {Number(device.last_longitude).toFixed(5)}
                                                    </a>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td className="px-3 py-2">
                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                        device.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                                                    }`}
                                                >
                                                    {device.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <Link
                                                    href={route('traccar-devices.edit', device.id)}
                                                    className="me-2 inline-flex items-center text-[#178089] hover:text-[#0f5c61]"
                                                    title="Edit"
                                                    aria-label="Edit traccar device"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center text-red-600 hover:text-red-800"
                                                    title="Delete"
                                                    aria-label="Delete traccar device"
                                                    onClick={() => destroy(device.id)}
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

