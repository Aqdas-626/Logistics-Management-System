import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Edit({ country }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: country.name,
        iso_alpha2: country.iso_alpha2,
        iso_alpha3: country.iso_alpha3,
        phone_code: country.phone_code || '',
        currency_code: country.currency_code || '',
        is_active: Boolean(country.is_active),
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('countries.update', country.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit country
                </h2>
            }
        >
            <Head title={`Edit — ${country.name}`} />

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

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <InputLabel
                                        htmlFor="iso_alpha2"
                                        value="ISO alpha-2"
                                    />
                                    <TextInput
                                        id="iso_alpha2"
                                        className="mt-1 block w-full uppercase"
                                        value={data.iso_alpha2}
                                        maxLength={2}
                                        onChange={(e) =>
                                            setData(
                                                'iso_alpha2',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.iso_alpha2}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="iso_alpha3"
                                        value="ISO alpha-3"
                                    />
                                    <TextInput
                                        id="iso_alpha3"
                                        className="mt-1 block w-full uppercase"
                                        value={data.iso_alpha3}
                                        maxLength={3}
                                        onChange={(e) =>
                                            setData(
                                                'iso_alpha3',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.iso_alpha3}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <InputLabel
                                        htmlFor="phone_code"
                                        value="Phone code"
                                    />
                                    <TextInput
                                        id="phone_code"
                                        className="mt-1 block w-full"
                                        value={data.phone_code}
                                        onChange={(e) =>
                                            setData(
                                                'phone_code',
                                                e.target.value,
                                            )
                                        }
                                        maxLength={10}
                                    />
                                    <InputError
                                        message={errors.phone_code}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="currency_code"
                                        value="Currency (ISO 4217)"
                                    />
                                    <TextInput
                                        id="currency_code"
                                        className="mt-1 block w-full uppercase"
                                        value={data.currency_code}
                                        maxLength={3}
                                        onChange={(e) =>
                                            setData(
                                                'currency_code',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.currency_code}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="block">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="is_active"
                                        checked={data.is_active}
                                        onChange={(e) =>
                                            setData(
                                                'is_active',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <span className="ms-2 text-sm text-gray-600">
                                        Active
                                    </span>
                                </label>
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing}>
                                    Update
                                </PrimaryButton>
                                <Link href={route('countries.index')}>
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
