import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import { EyeIcon, PencilIcon, TrashIcon } from '@/Components/Icons';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { confirmDelete } from '@/Utils/confirmDelete';

export default function Index({ countries, filters }) {
    const { flash } = usePage().props;
    const { data, setData, get, processing } = useForm({
        search: filters.search || '',
    });

    const searchSubmit = (e) => {
        e.preventDefault();
        get(route('countries.index'), {
            preserveState: true,
            replace: true,
        });
    };

    const destroy = (id) => {
        confirmDelete({
            message: 'Delete this country?',
            onConfirm: () => {
            router.delete(route('countries.destroy', id));
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
               <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="flex items-center justify-between shadow bg-white p-4 rounded-lg">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Countries
                    </h2>
                    <Link
                        href={route('countries.create')}
                        className="inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#20A4AC] focus:ring-offset-2 active:opacity-80"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        Add country
                    </Link>
                </div>
                </div>
            }
        >
            <Head title="Countries" />

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

                    <div className="mb-6 flex justify-end">
                        <form
                            onSubmit={searchSubmit}
                            className="flex flex-wrap items-end justify-end gap-4"
                        >
                            <div>
                                <InputLabel htmlFor="search" value="Search" />
                                <TextInput
                                    id="search"
                                    className="mt-1 block w-64"
                                    value={data.search}
                                    onChange={(e) =>
                                        setData('search', e.target.value)
                                    }
                                    placeholder="Name or ISO code"
                                />
                            </div>
                            <SecondaryButton type="submit" disabled={processing}>
                                Search
                            </SecondaryButton>
                        </form>
                    </div>

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto p-6">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Name
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            ISO2
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            ISO3
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Phone
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Currency
                                        </th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">
                                            Active
                                        </th>
                                        <th className="px-3 py-2 text-right font-medium text-gray-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {countries.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={7}
                                                className="px-3 py-8 text-center text-gray-500"
                                            >
                                                No countries found.
                                            </td>
                                        </tr>
                                    )}
                                    {countries.data.map((c) => (
                                        <tr key={c.id}>
                                            <td className="px-3 py-2 font-medium text-gray-900">
                                                {c.name}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                                {c.iso_alpha2}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                                {c.iso_alpha3}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                                {c.phone_code || '—'}
                                            </td>
                                            <td className="px-3 py-2 text-gray-700">
                                                {c.currency_code || '—'}
                                            </td>
                                            <td className="px-3 py-2">
                                                {c.is_active ? (
                                                    <span className="text-green-600">
                                                        Yes
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">
                                                        No
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-3 py-2 text-right">
                                                <div className="inline-flex items-center justify-end gap-0.5">
                                                    <Link
                                                        href={route(
                                                            'countries.show',
                                                            c.id,
                                                        )}
                                                        className="inline-flex rounded-md p-1.5 text-[#20A4AC] hover:bg-[#20A4AC]/10 hover:text-[#0d4f54]"
                                                        title="View"
                                                        aria-label="View"
                                                    >
                                                        <EyeIcon className="h-5 w-5" />
                                                    </Link>
                                                    <Link
                                                        href={route(
                                                            'countries.edit',
                                                            c.id,
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
                                                            destroy(c.id)
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

                        {countries.links.length > 3 && (
                            <div className="flex flex-wrap gap-1 border-t border-gray-100 px-6 py-4">
                                {countries.links.map((link, i) =>
                                    link.url ? (
                                        <Link
                                            key={i}
                                            href={link.url}
                                            className={
                                                link.active
                                                    ? 'rounded border border-[#20A4AC] bg-[#20A4AC]/10 px-3 py-1 text-sm text-[#178089]'
                                                    : 'rounded border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50'
                                            }
                                            preserveState
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ) : (
                                        <span
                                            key={i}
                                            className="rounded border border-gray-100 px-3 py-1 text-sm text-gray-400"
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
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
