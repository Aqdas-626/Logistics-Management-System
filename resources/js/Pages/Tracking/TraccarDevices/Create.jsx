import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        traccar_device_id: '',
        name: '',
        unique_id: '',
        model: '',
        phone: '',
        category: '',
        is_active: true,
        last_synced_at: '',
        attributes_json: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('traccar-devices.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">Create Traccar Device</h2>
                        <Link href={route('traccar-devices.index')}>
                            <SecondaryButton type="button">Cancel</SecondaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Create Traccar Device" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={submit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <InputLabel htmlFor="traccar_device_id" value="Traccar Device ID" />
                                <TextInput
                                    id="traccar_device_id"
                                    type="number"
                                    className="mt-1 block w-full"
                                    value={data.traccar_device_id}
                                    onChange={(e) => setData('traccar_device_id', e.target.value)}
                                />
                                <InputError message={errors.traccar_device_id} className="mt-2" />
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
                                <InputLabel htmlFor="unique_id" value="Unique ID (IMEI/UniqueId)" />
                                <TextInput
                                    id="unique_id"
                                    className="mt-1 block w-full"
                                    value={data.unique_id}
                                    onChange={(e) => setData('unique_id', e.target.value)}
                                />
                                <InputError message={errors.unique_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="model" value="Model" />
                                <TextInput
                                    id="model"
                                    className="mt-1 block w-full"
                                    value={data.model}
                                    onChange={(e) => setData('model', e.target.value)}
                                />
                                <InputError message={errors.model} className="mt-2" />
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
                                <InputLabel htmlFor="category" value="Category" />
                                <TextInput
                                    id="category"
                                    className="mt-1 block w-full"
                                    value={data.category}
                                    onChange={(e) => setData('category', e.target.value)}
                                />
                                <InputError message={errors.category} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="last_synced_at" value="Last Synced At" />
                                <TextInput
                                    id="last_synced_at"
                                    type="datetime-local"
                                    className="mt-1 block w-full"
                                    value={data.last_synced_at}
                                    onChange={(e) => setData('last_synced_at', e.target.value)}
                                />
                                <InputError message={errors.last_synced_at} className="mt-2" />
                            </div>

                            <div className="flex items-center gap-2 pt-8">
                                <input
                                    id="is_active"
                                    type="checkbox"
                                    className="rounded border-gray-300 text-[#20A4AC] shadow-sm focus:ring-[#20A4AC]"
                                    checked={Boolean(data.is_active)}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                />
                                <InputLabel htmlFor="is_active" value="Active" />
                                <InputError message={errors.is_active} className="mt-2" />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="attributes_json" value="Attributes (JSON)" />
                                <textarea
                                    id="attributes_json"
                                    rows={4}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                    placeholder='{"protocol":"teltonika"}'
                                    value={data.attributes_json}
                                    onChange={(e) => setData('attributes_json', e.target.value)}
                                />
                                <InputError message={errors.attributes_json} className="mt-2" />
                            </div>

                            <div className="md:col-span-2 flex items-center justify-end gap-3">
                                <Link href={route('traccar-devices.index')}>
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

