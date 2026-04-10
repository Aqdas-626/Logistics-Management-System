import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ companies, branches, vehicleTypes }) {
    const { data, setData, post, processing, errors } = useForm({
        company_id: '',
        branch_id: '',
        vehicle_type_id: '',
        registration_no: '',
        chassis_no: '',
        engine_no: '',
        color: '',
        fuel_type: '',
        fuel_capacity: '',
        vin: '',
        status: 'active',
        odometer_km: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('vehicles.store'));
    };

    const filteredBranches = branches.filter(
        (branch) => !data.company_id || Number(branch.company_id) === Number(data.company_id),
    );

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Create Vehicle</h2>}
        >
            <Head title="Create Vehicle" />

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
                                        setData('branch_id', '');
                                    }}
                                >
                                    <option value="">Select Company</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.company_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="branch_id" value="Branch" />
                                <select
                                    id="branch_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.branch_id}
                                    onChange={(e) => setData('branch_id', e.target.value)}
                                >
                                    <option value="">Select Branch</option>
                                    {filteredBranches.map((b) => (
                                        <option key={b.id} value={b.id}>
                                            {b.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.branch_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="vehicle_type_id" value="Vehicle Type" />
                                <select
                                    id="vehicle_type_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.vehicle_type_id}
                                    onChange={(e) => setData('vehicle_type_id', e.target.value)}
                                >
                                    <option value="">Select Type</option>
                                    {vehicleTypes.map((vt) => (
                                        <option key={vt.id} value={vt.id}>
                                            {vt.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.vehicle_type_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="registration_no" value="Registration No" />
                                <TextInput
                                    id="registration_no"
                                    className="mt-1 block w-full"
                                    value={data.registration_no}
                                    onChange={(e) => setData('registration_no', e.target.value)}
                                />
                                <InputError message={errors.registration_no} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="vin" value="VIN" />
                                <TextInput
                                    id="vin"
                                    className="mt-1 block w-full"
                                    value={data.vin}
                                    onChange={(e) => setData('vin', e.target.value)}
                                />
                                <InputError message={errors.vin} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="chassis_no" value="Chassis No" />
                                <TextInput
                                    id="chassis_no"
                                    className="mt-1 block w-full"
                                    value={data.chassis_no}
                                    onChange={(e) => setData('chassis_no', e.target.value)}
                                />
                                <InputError message={errors.chassis_no} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="engine_no" value="Engine No" />
                                <TextInput
                                    id="engine_no"
                                    className="mt-1 block w-full"
                                    value={data.engine_no}
                                    onChange={(e) => setData('engine_no', e.target.value)}
                                />
                                <InputError message={errors.engine_no} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="color" value="Color" />
                                <TextInput
                                    id="color"
                                    className="mt-1 block w-full"
                                    value={data.color}
                                    onChange={(e) => setData('color', e.target.value)}
                                />
                                <InputError message={errors.color} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="fuel_type" value="Fuel Type" />
                                <select
                                    id="fuel_type"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={data.fuel_type}
                                    onChange={(e) => setData('fuel_type', e.target.value)}
                                >
                                    <option value="">Select fuel type</option>
                                    <option value="petrol">Petrol</option>
                                    <option value="diesel">Diesel</option>
                                    <option value="electric">Electric</option>
                                    <option value="hybrid">Hybrid</option>
                                </select>
                                <InputError message={errors.fuel_type} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="fuel_capacity" value="Fuel Capacity" />
                                <TextInput
                                    id="fuel_capacity"
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full"
                                    value={data.fuel_capacity}
                                    onChange={(e) => setData('fuel_capacity', e.target.value)}
                                />
                                <InputError message={errors.fuel_capacity} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="odometer_km" value="Odometer (km)" />
                                <TextInput
                                    id="odometer_km"
                                    type="number"
                                    step="0.01"
                                    className="mt-1 block w-full"
                                    value={data.odometer_km}
                                    onChange={(e) => setData('odometer_km', e.target.value)}
                                />
                                <InputError message={errors.odometer_km} className="mt-2" />
                            </div>

                            <div className="md:col-span-2">
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
                                <Link href={route('vehicles.index')}>
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

