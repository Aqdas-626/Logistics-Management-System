import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import {
    MagnifyingGlassIcon,
    PencilIcon,
    PlusIcon,
    TrashIcon,
} from '@/Components/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { confirmDelete } from '@/Utils/confirmDelete';

export default function Index({ assignments, filters }) {
    const { flash } = usePage().props;
    const { data, setData, get, processing } = useForm({
        search: filters?.search || '',
    });

    const submitSearch = (e) => {
        e.preventDefault();
        get(route('driver-vehicle-assignments.index'), { preserveState: true, replace: true });
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Delete this assignment?',
            onConfirm: () => {
            router.delete(route('driver-vehicle-assignments.destroy', id));
            },
        });
    };

    const formatDate = (value) => {
        if (!value) return '—';
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) return value;
        return parsed.toISOString().slice(0, 10);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Driver Assignments</h2>
                    <Link
                        href={route('driver-vehicle-assignments.create')}
                        className="inline-flex items-center gap-2 rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        <PlusIcon className="h-4 w-4" aria-hidden />
                        Add Assignment
                    </Link>
                </div>
                 </div>
            }
        >
            <Head title="Driver Assignments" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">{flash.success}</div>
                    )}

                    <div className="mb-6 flex w-full justify-end">
                        <form
                            onSubmit={submitSearch}
                            className="flex max-w-full flex-wrap items-end justify-end gap-4"
                        >
                            <div>
                                <InputLabel htmlFor="search" value="Search" />
                                <div className="relative mt-1">
                                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                    <TextInput
                                        id="search"
                                        className="block w-64 pl-10"
                                        value={data.search}
                                        onChange={(e) =>
                                            setData('search', e.target.value)
                                        }
                                        placeholder="Driver name/code or vehicle"
                                    />
                                </div>
                            </div>
                            <SecondaryButton
                                type="submit"
                                disabled={processing}
                                className="gap-2"
                            >
                                <MagnifyingGlassIcon
                                    className="h-4 w-4 text-gray-600"
                                    aria-hidden
                                />
                                Search
                            </SecondaryButton>
                        </form>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto p-6">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 text-left text-gray-700">Company</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Driver</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Vehicle</th>
                                        <th className="px-3 py-2 text-left text-gray-700">From</th>
                                        <th className="px-3 py-2 text-left text-gray-700">To</th>
                                        <th className="px-3 py-2 text-left text-gray-700">Status</th>
                                        <th className="px-3 py-2 text-right text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {assignments.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                                                <div className="flex flex-col items-center gap-3">
                                                    <span>No assignments found.</span>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                    {assignments.data.map((assignment) => (
                                        <tr key={assignment.id}>
                                            <td className="px-3 py-2">{assignment.company?.name || '—'}</td>
                                            <td className="px-3 py-2">
                                                {assignment.driver?.name || '—'}
                                                {assignment.driver?.driver_code ? ` (${assignment.driver.driver_code})` : ''}
                                            </td>
                                            <td className="px-3 py-2">{assignment.vehicle?.registration_no || '—'}</td>
                                            <td className="px-3 py-2">{formatDate(assignment.assigned_from)}</td>
                                            <td className="px-3 py-2">{formatDate(assignment.assigned_to)}</td>
                                            <td className="px-3 py-2">{assignment.status}</td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="inline-flex items-center justify-end gap-0.5">
                                                    <Link
                                                        href={route(
                                                            'driver-vehicle-assignments.edit',
                                                            assignment.id,
                                                        )}
                                                        className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                                        title="Edit"
                                                        aria-label="Edit"
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        className="inline-flex rounded-md p-1.5 text-red-600 hover:bg-red-50 hover:text-red-800"
                                                        title="Delete"
                                                        aria-label="Delete"
                                                        onClick={() =>
                                                            destroy(assignment.id)
                                                        }
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
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
