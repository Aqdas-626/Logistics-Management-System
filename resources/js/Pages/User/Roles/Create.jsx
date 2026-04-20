import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ permissions, role }) {
    const {
        data,
        setData,
        post,
        processing,
        errors,
    } = useForm({
        name: role?.name || '',
        permissions: [],
    });

    const togglePermission = (permissionId, checked) => {
        setData(
            'permissions',
            checked
                ? Array.from(new Set([...data.permissions, permissionId]))
                : data.permissions.filter((id) => id !== permissionId),
        );
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('roles.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            New role
                        </h2>
                    </div>
                    <div className="mb-4 flex justify-end">
                        <Link href={route('roles.index')}>
                            <SecondaryButton type="button">
                                Cancel
                            </SecondaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="New role" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel
                                    htmlFor="name"
                                    value="Role name *"
                                />
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
                                <div className="mb-3">
                                    <InputLabel
                                        htmlFor="permissions"
                                        value="Permissions"
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {permissions.map((p) => {
                                        const checked = data.permissions.includes(
                                            Number(p.id),
                                        );
                                        return (
                                            <label
                                                key={p.id}
                                                className="flex items-center gap-3 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onChange={(e) =>
                                                        togglePermission(
                                                            Number(p.id),
                                                            e.target.checked,
                                                        )
                                                    }
                                                />
                                                <span className="text-gray-800">
                                                    {p.name}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>
                                    Save
                                </PrimaryButton>
                                <Link href={route('roles.index')}>
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

