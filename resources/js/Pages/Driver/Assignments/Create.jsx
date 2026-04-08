import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ companies, drivers, vehicles }) {
    const { data, setData, post, processing, errors } = useForm({
        company_id: '',
        driver_id: '',
        vehicle_id: '',
        assigned_from: '',
        assigned_to: '',
        status: 'active',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('driver-vehicle-assignments.store'));
    };

    const filteredDrivers = drivers.filter(
        (driver) => !data.company_id || Number(driver.company_id) === Number(data.company_id),
    );

    const filteredVehicles = vehicles.filter(
        (vehicle) => !data.company_id || Number(vehicle.company_id) === Number(data.company_id),
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">Create Driver Assignment</h2>
                        <Link href={route('driver-vehicle-assignments.index')}>
                            <SecondaryButton type="button">
                                Back to list
                            </SecondaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Create Driver Assignment" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="company_id" value="Company" />
                                <select
                                    id="company_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.company_id}
                                    onChange={(e) => {
                                        setData('company_id', e.target.value);
                                        setData('driver_id', '');
                                        setData('vehicle_id', '');
                                    }}
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
                                <InputLabel htmlFor="driver_id" value="Driver" />
                                <select
                                    id="driver_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.driver_id}
                                    onChange={(e) => setData('driver_id', e.target.value)}
                                >
                                    <option value="">Select Driver</option>
                                    {filteredDrivers.map((driver) => (
                                        <option key={driver.id} value={driver.id}>
                                            {driver.name} ({driver.driver_code})
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.driver_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="vehicle_id" value="Vehicle" />
                                <select
                                    id="vehicle_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.vehicle_id}
                                    onChange={(e) => setData('vehicle_id', e.target.value)}
                                >
                                    <option value="">Select Vehicle</option>
                                    {filteredVehicles.map((vehicle) => (
                                        <option key={vehicle.id} value={vehicle.id}>
                                            {vehicle.registration_no}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.vehicle_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="assigned_from" value="Assigned From" />
                                <TextInput
                                    id="assigned_from"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.assigned_from}
                                    onChange={(e) => setData('assigned_from', e.target.value)}
                                />
                                <InputError message={errors.assigned_from} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="assigned_to" value="Assigned To" />
                                <TextInput
                                    id="assigned_to"
                                    type="date"
                                    className="mt-1 block w-full"
                                    value={data.assigned_to}
                                    onChange={(e) => setData('assigned_to', e.target.value)}
                                />
                                <InputError message={errors.assigned_to} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="status" value="Status" />
                                <select
                                    id="status"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                <InputError message={errors.status} className="mt-2" />
                            </div>

                            <div className="md:col-span-2 flex items-center justify-end gap-3">
                                <Link href={route('driver-vehicle-assignments.index')}>
                                    <SecondaryButton type="button">Cancel</SecondaryButton>
                                </Link>
                                <PrimaryButton disabled={processing}>Save</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
