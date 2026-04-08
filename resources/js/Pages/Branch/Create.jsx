import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import DangerButton from '@/Components/DangerButton';
import { Head, Link, useForm } from '@inertiajs/react';

const branchStatusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'blocked', label: 'Blocked' },
];

const emptyAsset = () => ({
    asset_name: '',
    asset_code: '',
    category: '',
    serial_no: '',
    quantity: 1,
    condition: '',
    purchase_date: '',
    status: 'active',
});

export default function Create({ companies, users, branch, contact, assets }) {
    const { data, setData, post, processing, errors } = useForm({
        company_id: branch.company_id,
        name: branch.name,
        code: branch.code,
        phone: branch.phone,
        address_line1: branch.address_line1,
        address_line2: branch.address_line2,
        city: branch.city,
        state: branch.state,
        postcode: branch.postcode,
        country_code: branch.country_code,
        timezone: branch.timezone,
        base_currency: branch.base_currency,
        status: branch.status,
        manager_user_id: branch.manager_user_id,
        contact: {
            name: contact.name || '',
            email: contact.email || '',
            phone: contact.phone || '',
            designation: contact.designation || '',
            status: contact.status || 'active',
        },
        assets:
            assets && assets.length > 0
                ? assets
                : [],
    });

    const addAsset = () => {
        setData('assets', [...data.assets, emptyAsset()]);
    };

    const removeAsset = (index) => {
        setData(
            'assets',
            data.assets.filter((_, i) => i !== index),
        );
    };

    const updateAsset = (index, field, value) => {
        const next = [...data.assets];
        next[index] = { ...next[index], [field]: value };
        setData('assets', next);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('branches.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="New branch" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-8 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                New branch
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Create a new branch record
                            </p>
                        </div>
                        <Link href={route('branches.index')}>
                            <SecondaryButton type="button">
                                Back to list
                            </SecondaryButton>
                        </Link>
                    </div>

                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <h3 className="mb-4 text-lg font-medium text-gray-900">
                            Branch details
                        </h3>
                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="company_id" value="Company *" />
                                <select
                                    id="company_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                    value={data.company_id}
                                    onChange={(e) =>
                                        setData('company_id', e.target.value)
                                    }
                                    required
                                >
                                    <option value="">Select company</option>
                                    {companies.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.company_id}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="name" value="Branch name *" />
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
                                    <InputLabel htmlFor="code" value="Code * (globally unique)" />
                                    <TextInput
                                        id="code"
                                        className="mt-1 block w-full font-mono"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData(
                                                'code',
                                                e.target.value.toUpperCase(),
                                            )
                                        }
                                        required
                                    />
                                    <InputError
                                        message={errors.code}
                                        className="mt-2"
                                    />
                                </div>
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="manager_user_id"
                                    value="Branch manager"
                                />
                                <select
                                    id="manager_user_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                    value={data.manager_user_id}
                                    onChange={(e) =>
                                        setData(
                                            'manager_user_id',
                                            e.target.value,
                                        )
                                    }
                                >
                                    <option value="">No manager</option>
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            {u.name} ({u.email})
                                        </option>
                                    ))}
                                </select>
                                <InputError
                                    message={errors.manager_user_id}
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
                                        {branchStatusOptions.map((o) => (
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

                            <div className="border-t border-gray-200 pt-8">
                                <h3 className="mb-4 text-lg font-medium text-gray-900">
                                    Branch contact (optional — one per branch)
                                </h3>
                                <p className="mb-4 text-sm text-gray-500">
                                    If you fill any field, name and phone are
                                    required.
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <InputLabel
                                            htmlFor="contact_name"
                                            value="Contact name"
                                        />
                                        <TextInput
                                            id="contact_name"
                                            className="mt-1 block w-full"
                                            value={data.contact.name}
                                            onChange={(e) =>
                                                setData('contact', {
                                                    ...data.contact,
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                        <InputError
                                            message={errors['contact.name']}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel
                                            htmlFor="contact_phone"
                                            value="Contact phone"
                                        />
                                        <TextInput
                                            id="contact_phone"
                                            className="mt-1 block w-full"
                                            value={data.contact.phone}
                                            onChange={(e) =>
                                                setData('contact', {
                                                    ...data.contact,
                                                    phone: e.target.value,
                                                })
                                            }
                                        />
                                        <InputError
                                            message={errors['contact.phone']}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel
                                            htmlFor="contact_email"
                                            value="Contact email"
                                        />
                                        <TextInput
                                            id="contact_email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            value={data.contact.email}
                                            onChange={(e) =>
                                                setData('contact', {
                                                    ...data.contact,
                                                    email: e.target.value,
                                                })
                                            }
                                        />
                                        <InputError
                                            message={errors['contact.email']}
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel
                                            htmlFor="contact_designation"
                                            value="Designation"
                                        />
                                        <TextInput
                                            id="contact_designation"
                                            className="mt-1 block w-full"
                                            value={data.contact.designation}
                                            onChange={(e) =>
                                                setData('contact', {
                                                    ...data.contact,
                                                    designation:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors['contact.designation']
                                            }
                                            className="mt-2"
                                        />
                                    </div>
                                    <div>
                                        <InputLabel
                                            htmlFor="contact_status"
                                            value="Contact status"
                                        />
                                        <select
                                            id="contact_status"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                            value={data.contact.status}
                                            onChange={(e) =>
                                                setData('contact', {
                                                    ...data.contact,
                                                    status: e.target.value,
                                                })
                                            }
                                        >
                                            {branchStatusOptions.map((o) => (
                                                <option
                                                    key={o.value}
                                                    value={o.value}
                                                >
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError
                                            message={errors['contact.status']}
                                            className="mt-2"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-8">
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Branch assets
                                    </h3>
                                    <SecondaryButton
                                        type="button"
                                        onClick={addAsset}
                                    >
                                        Add asset
                                    </SecondaryButton>
                                </div>
                                {data.assets.length === 0 && (
                                    <p className="text-sm text-gray-500">
                                        No assets yet. Click &quot;Add
                                        asset&quot; to add rows.
                                    </p>
                                )}
                                <div className="space-y-6">
                                    {data.assets.map((asset, i) => (
                                        <div
                                            key={i}
                                            className="rounded-lg border border-gray-200 p-4"
                                        >
                                            <div className="mb-3 flex justify-between">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Asset {i + 1}
                                                </span>
                                                <DangerButton
                                                    type="button"
                                                    className="text-xs"
                                                    onClick={() =>
                                                        removeAsset(i)
                                                    }
                                                >
                                                    Remove
                                                </DangerButton>
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                                <div>
                                                    <InputLabel
                                                        value="Name *"
                                                    />
                                                    <TextInput
                                                        className="mt-1 block w-full"
                                                        value={asset.asset_name}
                                                        onChange={(e) =>
                                                            updateAsset(
                                                                i,
                                                                'asset_name',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            errors[
                                                                `assets.${i}.asset_name`
                                                            ]
                                                        }
                                                        className="mt-2"
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel
                                                        value="Code * (globally unique)"
                                                    />
                                                    <TextInput
                                                        className="mt-1 block w-full font-mono"
                                                        value={asset.asset_code}
                                                        onChange={(e) =>
                                                            updateAsset(
                                                                i,
                                                                'asset_code',
                                                                e.target.value.toUpperCase(),
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            errors[
                                                                `assets.${i}.asset_code`
                                                            ]
                                                        }
                                                        className="mt-2"
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel value="Category" />
                                                    <TextInput
                                                        className="mt-1 block w-full"
                                                        value={asset.category}
                                                        onChange={(e) =>
                                                            updateAsset(
                                                                i,
                                                                'category',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel value="Serial no." />
                                                    <TextInput
                                                        className="mt-1 block w-full"
                                                        value={asset.serial_no}
                                                        onChange={(e) =>
                                                            updateAsset(
                                                                i,
                                                                'serial_no',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel value="Quantity *" />
                                                    <TextInput
                                                        type="number"
                                                        min={1}
                                                        className="mt-1 block w-full"
                                                        value={asset.quantity}
                                                        onChange={(e) =>
                                                            updateAsset(
                                                                i,
                                                                'quantity',
                                                                parseInt(
                                                                    e.target
                                                                        .value,
                                                                    10,
                                                                ) || 1,
                                                            )
                                                        }
                                                    />
                                                    <InputError
                                                        message={
                                                            errors[
                                                                `assets.${i}.quantity`
                                                            ]
                                                        }
                                                        className="mt-2"
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel value="Condition" />
                                                    <TextInput
                                                        className="mt-1 block w-full"
                                                        placeholder="new, used, damaged"
                                                        value={asset.condition}
                                                        onChange={(e) =>
                                                            updateAsset(
                                                                i,
                                                                'condition',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel value="Purchase date" />
                                                    <TextInput
                                                        type="date"
                                                        className="mt-1 block w-full"
                                                        value={
                                                            asset.purchase_date
                                                        }
                                                        onChange={(e) =>
                                                            updateAsset(
                                                                i,
                                                                'purchase_date',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel value="Status" />
                                                    <select
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                                                        value={asset.status}
                                                        onChange={(e) =>
                                                            updateAsset(
                                                                i,
                                                                'status',
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        {branchStatusOptions.map(
                                                            (o) => (
                                                                <option
                                                                    key={
                                                                        o.value
                                                                    }
                                                                    value={
                                                                        o.value
                                                                    }
                                                                >
                                                                    {o.label}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 border-t border-gray-200 justify-end pt-6">
                                <PrimaryButton disabled={processing}>
                                    Save branch
                                </PrimaryButton>
                                <Link href={route('branches.index')}>
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
