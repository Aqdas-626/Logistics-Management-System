import { useMemo } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';

const selectClass =
    'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]';

export default function LocationForm({
    data,
    setData,
    errors,
    companies,
    countries,
    branches,
    locationTypes,
    doorTypes,
    liftTypes,
    children,
}) {
    const branchOptions = useMemo(() => {
        if (!data.company_id) {
            return [];
        }
        return branches.filter(
            (b) => String(b.company_id) === String(data.company_id),
        );
    }, [branches, data.company_id]);

    return (
        <>
            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="company_id" value="Company *" />
                    <select
                        id="company_id"
                        className={selectClass}
                        value={data.company_id}
                        onChange={(e) => {
                            setData('company_id', e.target.value);
                            setData('branch_id', '');
                        }}
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

                <div>
                    <InputLabel htmlFor="country_id" value="Country *" />
                    <select
                        id="country_id"
                        className={selectClass}
                        value={data.country_id}
                        onChange={(e) =>
                            setData('country_id', e.target.value)
                        }
                        required
                    >
                        <option value="">Select country</option>
                        {countries.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <InputError
                        message={errors.country_id}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="branch_id" value="Branch" />
                    <select
                        id="branch_id"
                        className={selectClass}
                        value={data.branch_id}
                        onChange={(e) =>
                            setData('branch_id', e.target.value)
                        }
                        disabled={!data.company_id}
                    >
                        <option value="">No branch</option>
                        {branchOptions.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.name}
                            </option>
                        ))}
                    </select>
                    <InputError
                        message={errors.branch_id}
                        className="mt-2"
                    />
                </div>

                <div className="sm:col-span-2">
                    <InputLabel htmlFor="name" value="Name *" />
                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="location_code" value="Location code" />
                    <TextInput
                        id="location_code"
                        className="mt-1 block w-full"
                        value={data.location_code}
                        onChange={(e) =>
                            setData('location_code', e.target.value)
                        }
                    />
                    <InputError
                        message={errors.location_code}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel
                        htmlFor="location_type_id"
                        value="Location type *"
                    />
                    <select
                        id="location_type_id"
                        className={selectClass}
                        value={data.location_type_id}
                        onChange={(e) =>
                            setData('location_type_id', e.target.value)
                        }
                        required
                    >
                        <option value="">Select location type</option>
                        {locationTypes.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                    <InputError
                        message={errors.location_type_id}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="door_type_id" value="Door type *" />
                    <select
                        id="door_type_id"
                        className={selectClass}
                        value={data.door_type_id}
                        onChange={(e) =>
                            setData('door_type_id', e.target.value)
                        }
                        required
                    >
                        <option value="">Select door type</option>
                        {doorTypes.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                    <InputError
                        message={errors.door_type_id}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="lift_type_id" value="Lift type *" />
                    <select
                        id="lift_type_id"
                        className={selectClass}
                        value={data.lift_type_id}
                        onChange={(e) =>
                            setData('lift_type_id', e.target.value)
                        }
                        required
                    >
                        <option value="">Select lift type</option>
                        {liftTypes.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.name}
                            </option>
                        ))}
                    </select>
                    <InputError
                        message={errors.lift_type_id}
                        className="mt-2"
                    />
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="address_line_1" value="Address line 1" />
                    <TextInput
                        id="address_line_1"
                        className="mt-1 block w-full"
                        value={data.address_line_1}
                        onChange={(e) =>
                            setData('address_line_1', e.target.value)
                        }
                    />
                </div>
                <div>
                    <InputLabel htmlFor="address_line_2" value="Address line 2" />
                    <TextInput
                        id="address_line_2"
                        className="mt-1 block w-full"
                        value={data.address_line_2}
                        onChange={(e) =>
                            setData('address_line_2', e.target.value)
                        }
                    />
                </div>
                <div>
                    <InputLabel htmlFor="city" value="City" />
                    <TextInput
                        id="city"
                        className="mt-1 block w-full"
                        value={data.city}
                        onChange={(e) => setData('city', e.target.value)}
                    />
                </div>
                <div>
                    <InputLabel htmlFor="state" value="State" />
                    <TextInput
                        id="state"
                        className="mt-1 block w-full"
                        value={data.state}
                        onChange={(e) => setData('state', e.target.value)}
                    />
                </div>
                <div>
                    <InputLabel htmlFor="postcode" value="Postcode" />
                    <TextInput
                        id="postcode"
                        className="mt-1 block w-full"
                        value={data.postcode}
                        onChange={(e) =>
                            setData('postcode', e.target.value)
                        }
                    />
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div>
                    <InputLabel htmlFor="contact_person" value="Contact person" />
                    <TextInput
                        id="contact_person"
                        className="mt-1 block w-full"
                        value={data.contact_person}
                        onChange={(e) =>
                            setData('contact_person', e.target.value)
                        }
                    />
                </div>
                <div>
                    <InputLabel htmlFor="phone" value="Phone" />
                    <TextInput
                        id="phone"
                        className="mt-1 block w-full"
                        value={data.phone}
                        onChange={(e) => setData('phone', e.target.value)}
                    />
                </div>
                <div>
                    <InputLabel htmlFor="mobile" value="Mobile" />
                    <TextInput
                        id="mobile"
                        className="mt-1 block w-full"
                        value={data.mobile}
                        onChange={(e) => setData('mobile', e.target.value)}
                    />
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
            </div>

            <div className="space-y-4">
                <label className="flex items-center gap-2">
                    <Checkbox
                        checked={data.send_tracking_email}
                        onChange={(e) =>
                            setData(
                                'send_tracking_email',
                                e.target.checked,
                            )
                        }
                    />
                    <span className="text-sm text-gray-700">
                        Send tracking email
                    </span>
                </label>

                <div>
                    <InputLabel
                        htmlFor="special_instruction"
                        value="Special instructions"
                    />
                    <textarea
                        id="special_instruction"
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#20A4AC] focus:ring-[#20A4AC]"
                        value={data.special_instruction}
                        onChange={(e) =>
                            setData('special_instruction', e.target.value)
                        }
                    />
                </div>

                <div>
                    <InputLabel htmlFor="status" value="Status *" />
                    <select
                        id="status"
                        className={selectClass}
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                        required
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <InputError message={errors.status} className="mt-2" />
                </div>
            </div>

            {children}
        </>
    );
}
