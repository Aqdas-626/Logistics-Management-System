import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Checkbox from '@/Components/Checkbox';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ user, roles, selectedRoleIds }) {
    const {
        data,
        setData,
        put,
        processing,
        errors,
    } = useForm({
        roles: (selectedRoleIds || []).map(Number),
    });

    const toggleRole = (roleId, checked) => {
        setData(
            'roles',
            checked
                ? Array.from(new Set([...data.roles, roleId]))
                : data.roles.filter((id) => id !== roleId),
        );
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('user-roles.update', user.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Edit roles
                    </h2>
                </div>
            }
        >
            <Head title="Edit roles" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <div className="mb-4">
                            <div className="text-lg font-semibold text-gray-900">
                                {user.name}
                            </div>
                            <div className="text-sm text-gray-600">
                                {user.email}
                            </div>
                        </div>

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel
                                    htmlFor="roles"
                                    value="Roles"
                                />
                                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    {roles.map((r) => {
                                        const checked = data.roles.includes(
                                            Number(r.id),
                                        );
                                        return (
                                            <label
                                                key={r.id}
                                                className="flex items-center gap-3 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                                            >
                                                <Checkbox
                                                    checked={checked}
                                                    onChange={(e) =>
                                                        toggleRole(
                                                            Number(r.id),
                                                            e.target.checked,
                                                        )
                                                    }
                                                />
                                                <span className="text-gray-800">
                                                    {r.name}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                                <InputError
                                    message={errors.roles}
                                    className="mt-2"
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>
                                    Update
                                </PrimaryButton>
                                <Link href={route('user-roles.index')}>
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

