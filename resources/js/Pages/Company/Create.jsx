import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'blocked', label: 'Blocked' },
];

export default function Create({ countries, company }) {
    const { data, setData, post, processing, errors } = useForm({
        country_id: company.country_id,
        name: company.name,
        email: company.email,
        phone: company.phone,
        logo: company.logo,
        website: company.website,
        address_line1: company.address_line1,
        address_line2: company.address_line2,
        city: company.city,
        state: company.state,
        postcode: company.postcode,
        country_code: company.country_code,
        timezone: company.timezone,
        base_currency: company.base_currency,
        status: company.status,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('companies.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            New company
                        </h2>
                        <Link href={route('companies.index')}>
                            <SecondaryButton type="button">
                                Back to list
                            </SecondaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="New company" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="country_id" value="Country *" />
                                <select
                                    id="country_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                    value={data.country_id}
                                    onChange={(e) =>
                                        setData('country_id', e.target.value)
                                    }
                                    required
                                >
                                    <option value="">Select country</option>
                                    {countries.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} ({c.iso_alpha2})
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.country_id}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel htmlFor="name" value="Company name *" />
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
                                    <InputLabel htmlFor="email" value="Email" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="phone" value="Phone" />
                                    <TextInput
                                        id="phone"
                                        className="mt-1 block w-full"
                                        value={data.phone}
                                        onChange={(e) =>
                                            setData('phone', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.phone}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="website" value="Website" />
                                    <TextInput
                                        id="website"
                                        className="mt-1 block w-full"
                                        value={data.website}
                                        onChange={(e) =>
                                            setData('website', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.website}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="logo" value="Logo path" />
                                    <TextInput
                                        id="logo"
                                        className="mt-1 block w-full"
                                        value={data.logo}
                                        onChange={(e) =>
                                            setData('logo', e.target.value)
                                        }
                                        placeholder="storage path or URL"
                                    />
                                    <InputError
                                        message={errors.logo}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="address_line1"
                                    value="Address line 1"
                                />
                                <TextInput
                                    id="address_line1"
                                    className="mt-1 block w-full"
                                    value={data.address_line1}
                                    onChange={(e) =>
                                        setData(
                                            'address_line1',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={errors.address_line1}
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <InputLabel
                                    htmlFor="address_line2"
                                    value="Address line 2"
                                />
                                <TextInput
                                    id="address_line2"
                                    className="mt-1 block w-full"
                                    value={data.address_line2}
                                    onChange={(e) =>
                                        setData(
                                            'address_line2',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={errors.address_line2}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <InputLabel htmlFor="city" value="City" />
                                    <TextInput
                                        id="city"
                                        className="mt-1 block w-full"
                                        value={data.city}
                                        onChange={(e) =>
                                            setData('city', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.city}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel htmlFor="state" value="State" />
                                    <TextInput
                                        id="state"
                                        className="mt-1 block w-full"
                                        value={data.state}
                                        onChange={(e) =>
                                            setData('state', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.state}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="postcode"
                                        value="Postcode"
                                    />
                                    <TextInput
                                        id="postcode"
                                        className="mt-1 block w-full"
                                        value={data.postcode}
                                        onChange={(e) =>
                                            setData('postcode', e.target.value)
                                        }
                                    />
                                    <InputError
                                        message={errors.postcode}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="country_code"
                                        value="Country code (ISO2)"
                                    />
                                    <TextInput
                                        id="country_code"
                                        className="mt-1 block w-full uppercase"
                                        maxLength={2}
                                        value={data.country_code}
                                        onChange={(e) =>
                                            setData(
                                                'country_code',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                    />
                                    <InputError
                                        message={errors.country_code}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-3">
                                <div>
                                    <InputLabel htmlFor="timezone" value="Timezone *" />
                                    <TextInput
                                        id="timezone"
                                        className="mt-1 block w-full"
                                        value={data.timezone}
                                        onChange={(e) =>
                                            setData('timezone', e.target.value)
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.timezone}
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <InputLabel
                                        htmlFor="base_currency"
                                        value="Base currency *"
                                    />
                                    <TextInput
                                        id="base_currency"
                                        className="mt-1 block w-full uppercase"
                                        maxLength={3}
                                        value={data.base_currency}
                                        onChange={(e) =>
                                            setData(
                                                'base_currency',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.base_currency}
                                        className="mt-2"
                                    />
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
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <PrimaryButton disabled={processing}>
                                    Save
                                </PrimaryButton>
                                <Link href={route('companies.index')}>
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
