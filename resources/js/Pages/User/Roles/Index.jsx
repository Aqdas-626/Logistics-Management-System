import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { PlusIcon, TrashIcon, ShieldCheckIcon } from '@/Components/Icons';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { confirmDelete } from '@/Utils/confirmDelete';

export default function Index({ roles, filters }) {
const { flash } = usePage().props;
const { data, setData, get, processing } = useForm({
search: filters?.search || '',
});

const searchSubmit = (e) => {
e.preventDefault();
get(route('roles.index'), {
preserveState: true,
replace: true,
});
};

const destroy = (id) => {
confirmDelete({
message: 'Delete this role?',
onConfirm: () => {
router.delete(route('roles.destroy', id));
},
});
};

return (
<AuthenticatedLayout header={ <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
    <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
            Roles
        </h2>
        <div className="mb-4 flex justify-end">
            <Link href={route('roles.create')}
                className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#20A4AC] focus:ring-offset-2 active:opacity-80"
                style={{ backgroundColor: '#20A4AC' }}>
                     <PlusIcon className="h-5 w-5" />
             Role
            </Link>
        </div>
    </div>
    </div>
    }
    >

    <Head title="Roles" />

    <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            {flash?.success && (
            <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">
                {flash.success}
            </div>
            )}
            {flash?.error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-red-800">
                {flash.error}
            </div>
            )}



            <form onSubmit={searchSubmit} className="mb-6 flex flex-wrap items-end justify-end gap-4">
                <div>
                    <InputLabel htmlFor="search" value="Search" />
                    <TextInput id="search" className="mt-1 block w-64" value={data.search} onChange={(e)=>
                        setData('search', e.target.value)}
                        placeholder="Role name"
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
                                <th className="px-3 py-2 text-left font-medium text-gray-700">
                                    Name
                                </th>
                                <th className="px-3 py-2 text-left font-medium text-gray-700">
                                    Guard
                                </th>
                                <th className="px-3 py-2 text-right font-medium text-gray-700">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {roles.data.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-3 py-8 text-center text-gray-500">
                                    No roles found.
                                </td>
                            </tr>
                            )}
                            {roles.data.map((r) => (
                            <tr key={r.id}>
                                <td className="px-3 py-2 font-medium text-gray-900">
                                    {r.name}
                                </td>
                                <td className="px-3 py-2 text-gray-700">
                                    {r.guard_name}
                                </td>
                                <td className="px-3 py-2 text-right">
                                    <Link
                                        href={route('roles.edit', r.id)}
                                        className="me-2 inline-flex items-center text-[#20A4AC] hover:text-[#0d4f54]"
                                        title="Manage Permissions"
                                        aria-label="Manage permissions"
                                    >
                                        <ShieldCheckIcon className="h-5 w-5" />
                                    </Link>
                                    <DangerButton type="button" className="bg-transparent hover:bg-transparent p-0" onClick={()=> destroy(r.id)}
                                        >
                                       <TrashIcon className="h-5 w-5 text-red-500" />
                                    </DangerButton>
                                </td>
                            </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {roles.links?.length > 3 && (
                <div className="flex flex-wrap gap-1 border-t border-gray-100 px-6 py-4">
                    {roles.links.map((link, i) =>
                    link.url ? (
                    <Link key={i} href={link.url} className={ link.active
                        ? 'rounded border border-[#20A4AC] bg-[#20A4AC]/10 px-3 py-1 text-sm text-[#178089]'
                        : 'rounded border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50' }
                        preserveState dangerouslySetInnerHTML={{ __html: link.label, }} />
                    ) : (
                    <span key={i} className="rounded border border-gray-100 px-3 py-1 text-sm text-gray-400"
                        dangerouslySetInnerHTML={{ __html: link.label, }} />
                    ),
                    )}
                </div>
                )}
            </div>
        </div>
    </div>
</AuthenticatedLayout>
);
}