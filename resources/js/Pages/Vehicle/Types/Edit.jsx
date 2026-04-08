import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ vehicleType }) {
    const { data, setData, put, processing, errors } = useForm({
        name: vehicleType.name || '',
        max_weight_kg: vehicleType.max_weight_kg || '',
        max_volume_m3: vehicleType.max_volume_m3 || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('vehicle-types.update', vehicleType.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Edit Vehicle Type</h2>}
        >
            <Head title="Edit Vehicle Type" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6">
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
                                <InputLabel htmlFor="max_weight_kg" value="Max Weight (kg)" />
                                <TextInput
                                    id="max_weight_kg"
                                    type="number"
                                    step="0.001"
                                    className="mt-1 block w-full"
                                    value={data.max_weight_kg}
                                    onChange={(e) => setData('max_weight_kg', e.target.value)}
                                />
                                <InputError message={errors.max_weight_kg} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="max_volume_m3" value="Max Volume (m3)" />
                                <TextInput
                                    id="max_volume_m3"
                                    type="number"
                                    step="0.001"
                                    className="mt-1 block w-full"
                                    value={data.max_volume_m3}
                                    onChange={(e) => setData('max_volume_m3', e.target.value)}
                                />
                                <InputError message={errors.max_volume_m3} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <Link href={route('vehicle-types.index')}>
                                    <SecondaryButton type="button">Cancel</SecondaryButton>
                                </Link>
                                <PrimaryButton disabled={processing}>Update</PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

