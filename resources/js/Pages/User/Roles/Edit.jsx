import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({
    role,
    permissions,
    selectedPermissionIds,
}) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        name: role?.name || '',
        permissions: (selectedPermissionIds || []).map(Number),
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
        put(route('roles.update', role.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit role
                </h2>
            }
        >
            <Head title="Edit role" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
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
                                <InputLabel
                                    htmlFor="permissions"
                                    value="Permissions"
                                />
                                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                                <InputError
                                    message={errors.permissions}
                                    className="mt-2"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>
                                    Update
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

