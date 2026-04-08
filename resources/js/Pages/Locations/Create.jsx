import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import LocationForm from '@/Components/Location/LocationForm';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({
    companies,
    countries,
    branches,
    locationTypes,
    doorTypes,
    liftTypes,
}) {
    const { data, setData, post, processing, errors, transform } = useForm({
        company_id: '',
        country_id: '',
        branch_id: '',
        name: '',
        location_code: '',
        location_type_id: '',
        door_type_id: '',
        lift_type_id: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postcode: '',
        contact_person: '',
        phone: '',
        mobile: '',
        email: '',
        send_tracking_email: false,
        special_instruction: '',
        status: 'active',
    });

    const submit = (e) => {
        e.preventDefault();
        transform((payload) => ({
            ...payload,
            branch_id:
                payload.branch_id === '' || payload.branch_id == null
                    ? null
                    : payload.branch_id,
        }));
        post(route('locations.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-xl font-semibold leading-tight text-gray-800">
                            New location
                        </h2>
                        <Link href={route('locations.index')}>
                            <SecondaryButton type="button">
                                Back to list
                            </SecondaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="New location" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-8">
                            <LocationForm
                                data={data}
                                setData={setData}
                                errors={errors}
                                companies={companies}
                                countries={countries}
                                branches={branches}
                                locationTypes={locationTypes}
                                doorTypes={doorTypes}
                                liftTypes={liftTypes}
                            >
                                <div className="flex justify-end gap-4 pt-2">
                                    <Link href={route('locations.index')}>
                                        <SecondaryButton type="button">
                                            Cancel
                                        </SecondaryButton>
                                    </Link>
                                    <PrimaryButton disabled={processing}>
                                        Create location
                                    </PrimaryButton>
                                </div>
                            </LocationForm>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
