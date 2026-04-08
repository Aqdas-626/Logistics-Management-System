import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'blocked', label: 'Blocked' },
];

export default function Create({ companies, branches, department }) {
    const { data, setData, post, processing, errors } = useForm({
        company_id: department.company_id,
        branch_id: department.branch_id,
        name: department.name,
        code: department.code,
        status: department.status,
    });

    const branchOptions = useMemo(() => {
        if (!data.company_id) {
            return [];
        }
        return branches.filter(
            (b) => String(b.company_id) === String(data.company_id),
        );
    }, [branches, data.company_id]);

    const submit = (e) => {
        e.preventDefault();
        post(route('departments.store'));
    };

    return (
        <AuthenticatedLayout
            header={
               <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            New department
                        </h2>
                        <Link href={route('departments.index')}>
                        <SecondaryButton type="button">
                            Back to list
                        </SecondaryButton>
                    </Link>
                    </div>
                    
                </div>
            }
        >
            <Head title="New department" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="company_id" value="Company *" />
                                <select
                                    id="company_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                    value={data.company_id}
                                    onChange={(e) => {
                                        setData('company_id', e.target.value);
                                        setData('branch_id', '');
                                    }}
                                    required
                                >
                                    <option value="">Select company</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.company_id}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="branch_id" value="Branch (optional)" />
                                <select
                                    id="branch_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                    value={data.branch_id}
                                    onChange={(e) =>
                                        setData('branch_id', e.target.value)
                                    }
                                    disabled={!data.company_id}
                                >
                                    <option value="">Company-wide (no branch)</option>
                                    {branchOptions.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name} ({b.code})
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.branch_id}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Name *" />
                                    <TextInput
                                        id="name"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.name}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="code"
                                        value="Code * (globally unique)"
                                    />
                                    <TextInput
                                        id="code"
                                        className="mt-1 block w-full font-mono"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData(
                                                'code',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.code}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="status" value="Status *" />
                                <select
                                    id="status"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                    value={data.status}
                                    onChange={(e) =>
                                        setData('status', e.target.value)
                                    }
                                    required
                                >
                                    {statusOptions.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.status}
                                    className="mt-2"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <PrimaryButton disabled={processing}>
                                    Save
                                </PrimaryButton>
                                <Link href={route('departments.index')}>
                                    <SecondaryButton type="button">
                                        Cancel
                                    </SecondaryButton>
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
