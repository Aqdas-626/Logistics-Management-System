import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DangerButton from '@/Components/DangerButton';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, router, useForm } from '@inertiajs/react';

export default function Edit({ driver, companies }) {
    const { data, setData, put, processing, errors } = useForm({
        company_id: driver.company_id || '',
        driver_code: driver.driver_code || '',
        name: driver.name || '',
        phone: driver.phone || '',
        email: driver.email || '',
        license_no: driver.license_no || '',
        license_expiry: driver.license_expiry || '',
        status: driver.status || 'active',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('drivers.update', driver.id));
    };

    const destroy = () => {
        if (confirm('Delete this driver?')) {
            router.delete(route('drivers.destroy', driver.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Driver
                </h2>
            }
        >
            <Head title="Edit Driver" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="company_id" value="Company" />
                                    <select
                                        id="company_id"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                        value={data.company_id}
                                        onChange={(e) =>
                                            setData('company_id', e.target.value)
                                        }
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map((company) => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.company_id} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="driver_code" value="Driver Code" />
                                    <TextInput
                                        id="driver_code"
                                        className="mt-1 block w-full"
                                        value={data.driver_code}
                                        onChange={(e) =>
                                            setData('driver_code', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.driver_code} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="Phone" />
                                    <TextInput
                                        id="phone"
                                        className="mt-1 block w-full"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                    />
                                    <InputError message={errors.phone} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="license_no" value="License No" />
                                    <TextInput
                                        id="license_no"
                                        className="mt-1 block w-full"
                                        value={data.license_no}
                                        onChange={(e) =>
                                            setData('license_no', e.target.value)
                                        }
                                    />
                                    <InputError message={errors.license_no} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="license_expiry"
                                        value="License Expiry"
                                    />
                                    <TextInput
                                        id="license_expiry"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.license_expiry || ''}
                                        onChange={(e) =>
                                            setData('license_expiry', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.license_expiry}
                                        className="mt-2"
                                    />
                                </div>

                                <div>
                                    <InputLabel htmlFor="status" value="Status" />
                                    <select
                                        id="status"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="Password (optional)"
                                    />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="password_confirmation"
                                        value="Confirm Password"
                                    />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password_confirmation}
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                                <DangerButton type="button" onClick={destroy}>
                                    Delete
                                </DangerButton>
                                <div className="flex items-center gap-3">
                                    <Link href={route('drivers.index')}>
                                        <SecondaryButton type="button">
                                            Cancel
                                        </SecondaryButton>
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        Update Driver
                                    </PrimaryButton>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

