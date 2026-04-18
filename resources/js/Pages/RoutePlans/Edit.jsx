import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

const emptyStop = () => ({
    stop_name: '',
    location_id: '',
    latitude: '',
    longitude: '',
    position_recorded_at: '',
    shipment_id: '',
    job_queue_id: '',
    eta_at: '',
    ata_at: '',
    status: 'pending',
    notes: '',
});

const toLocal = (value) => {
    if (!value) return '';
    return String(value).slice(0, 16);
};

const mapStop = (s) => ({
    stop_name: s.stop_name || '',
    location_id: s.location_id != null ? String(s.location_id) : '',
    latitude: s.latitude != null ? String(s.latitude) : '',
    longitude: s.longitude != null ? String(s.longitude) : '',
    position_recorded_at: toLocal(s.position_recorded_at),
    shipment_id: s.shipment_id != null ? String(s.shipment_id) : '',
    job_queue_id: s.job_queue_id != null ? String(s.job_queue_id) : '',
    eta_at: toLocal(s.eta_at),
    ata_at: toLocal(s.ata_at),
    status: s.status || 'pending',
    notes: s.notes || '',
});

export default function Edit({ routePlan, companies, branches, locations, assignments, shipments, jobQueues }) {
    const { data, setData, put, processing, errors } = useForm({
        company_id: routePlan.company_id != null ? String(routePlan.company_id) : '',
        branch_id: routePlan.branch_id != null ? String(routePlan.branch_id) : '',
        route_code: routePlan.route_code || '',
        route_name: routePlan.route_name || '',
        plan_date: routePlan.plan_date ? String(routePlan.plan_date).slice(0, 10) : '',
        scheduled_departure_at: toLocal(routePlan.scheduled_departure_at),
        estimated_duration_minutes:
            routePlan.estimated_duration_minutes != null ? String(routePlan.estimated_duration_minutes) : '',
        origin_location_id: routePlan.origin_location_id != null ? String(routePlan.origin_location_id) : '',
        destination_location_id:
            routePlan.destination_location_id != null ? String(routePlan.destination_location_id) : '',
        driver_vehicle_assignment_id:
            routePlan.driver_vehicle_assignment_id != null
                ? String(routePlan.driver_vehicle_assignment_id)
                : '',
        status: routePlan.status || 'planned',
        started_at: toLocal(routePlan.started_at),
        completed_at: toLocal(routePlan.completed_at),
        notes: routePlan.notes || '',
        stops:
            routePlan.stops && routePlan.stops.length > 0
                ? routePlan.stops.map(mapStop)
                : [emptyStop()],
    });

    const filteredBranches = branches.filter(
        (b) => !data.company_id || Number(b.company_id) === Number(data.company_id),
    );

    const filteredLocations = locations.filter(
        (l) => !data.company_id || Number(l.company_id) === Number(data.company_id),
    );

    const submit = (e) => {
        e.preventDefault();
        put(route('route-plans.update', routePlan.id));
    };

    const updateStop = (index, field, value) => {
        const next = [...data.stops];
        next[index] = { ...next[index], [field]: value };
        setData('stops', next);
    };

    const addStop = () => {
        setData('stops', [...data.stops, emptyStop()]);
    };

    const removeStop = (index) => {
        if (data.stops.length <= 1) return;
        setData(
            'stops',
            data.stops.filter((_, i) => i !== index),
        );
    };

    const moveStop = (index, dir) => {
        const j = index + dir;
        if (j < 0 || j >= data.stops.length) return;
        const next = [...data.stops];
        [next[index], next[j]] = [next[j], next[index]];
        setData('stops', next);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Edit route plan</h2>
                    <div className="flex gap-2">
                        <Link href={route('route-plans.show', routePlan.id)}>
                            <SecondaryButton type="button">View</SecondaryButton>
                        </Link>
                        <Link href={route('route-plans.index')}>
                            <SecondaryButton type="button">Back to list</SecondaryButton>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Edit ${routePlan.route_code}`} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-8">
                        <div className="bg-white p-6 shadow sm:rounded-lg">
                            <h3 className="mb-4 text-lg font-medium text-gray-900">Plan details</h3>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="company_id" value="Company" />
                                    <select
                                        id="company_id"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={data.company_id}
                                        onChange={(e) => {
                                            setData('company_id', e.target.value);
                                            setData('branch_id', '');
                                            setData('origin_location_id', '');
                                            setData('destination_location_id', '');
                                        }}
                                    >
                                        <option value="">Optional</option>
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
                                        <option value="">Optional</option>
                                        {filteredBranches.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                {b.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.branch_id} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="route_code" value="Route code" />
                                    <TextInput
                                        id="route_code"
                                        className="mt-1 block w-full"
                                        value={data.route_code}
                                        onChange={(e) => setData('route_code', e.target.value)}
                                    />
                                    <InputError message={errors.route_code} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="route_name" value="Route name" />
                                    <TextInput
                                        id="route_name"
                                        className="mt-1 block w-full"
                                        value={data.route_name}
                                        onChange={(e) => setData('route_name', e.target.value)}
                                    />
                                    <InputError message={errors.route_name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="plan_date" value="Plan date" />
                                    <TextInput
                                        id="plan_date"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={data.plan_date}
                                        onChange={(e) => setData('plan_date', e.target.value)}
                                    />
                                    <InputError message={errors.plan_date} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="scheduled_departure_at" value="Scheduled departure" />
                                    <TextInput
                                        id="scheduled_departure_at"
                                        type="datetime-local"
                                        className="mt-1 block w-full"
                                        value={data.scheduled_departure_at}
                                        onChange={(e) => setData('scheduled_departure_at', e.target.value)}
                                    />
                                    <InputError message={errors.scheduled_departure_at} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="estimated_duration_minutes" value="Est. duration (minutes)" />
                                    <TextInput
                                        id="estimated_duration_minutes"
                                        type="number"
                                        min="0"
                                        className="mt-1 block w-full"
                                        value={data.estimated_duration_minutes}
                                        onChange={(e) => setData('estimated_duration_minutes', e.target.value)}
                                    />
                                    <InputError message={errors.estimated_duration_minutes} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="origin_location_id" value="Origin location" />
                                    <select
                                        id="origin_location_id"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={data.origin_location_id}
                                        onChange={(e) => setData('origin_location_id', e.target.value)}
                                    >
                                        <option value="">—</option>
                                        {filteredLocations.map((l) => (
                                            <option key={l.id} value={l.id}>
                                                {l.name}
                                                {l.city ? ` (${l.city})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.origin_location_id} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="destination_location_id" value="Destination location" />
                                    <select
                                        id="destination_location_id"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={data.destination_location_id}
                                        onChange={(e) => setData('destination_location_id', e.target.value)}
                                    >
                                        <option value="">—</option>
                                        {filteredLocations.map((l) => (
                                            <option key={l.id} value={l.id}>
                                                {l.name}
                                                {l.city ? ` (${l.city})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.destination_location_id} className="mt-2" />
                                </div>
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="driver_vehicle_assignment_id" value="Driver / vehicle assignment" />
                                    <select
                                        id="driver_vehicle_assignment_id"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={data.driver_vehicle_assignment_id}
                                        onChange={(e) => setData('driver_vehicle_assignment_id', e.target.value)}
                                    >
                                        <option value="">—</option>
                                        {assignments.map((a) => (
                                            <option key={a.id} value={a.id}>
                                                {a.label}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.driver_vehicle_assignment_id} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="status" value="Status" />
                                    <select
                                        id="status"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="planned">Planned</option>
                                        <option value="started">Started</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="started_at" value="Started at" />
                                    <TextInput
                                        id="started_at"
                                        type="datetime-local"
                                        className="mt-1 block w-full"
                                        value={data.started_at}
                                        onChange={(e) => setData('started_at', e.target.value)}
                                    />
                                    <InputError message={errors.started_at} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="completed_at" value="Completed at" />
                                    <TextInput
                                        id="completed_at"
                                        type="datetime-local"
                                        className="mt-1 block w-full"
                                        value={data.completed_at}
                                        onChange={(e) => setData('completed_at', e.target.value)}
                                    />
                                    <InputError message={errors.completed_at} className="mt-2" />
                                </div>
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="notes" value="Notes" />
                                    <textarea
                                        id="notes"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                        rows={3}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                    />
                                    <InputError message={errors.notes} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 shadow sm:rounded-lg">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                                <h3 className="text-lg font-medium text-gray-900">Stops</h3>
                                <SecondaryButton type="button" onClick={addStop}>
                                    Add stop
                                </SecondaryButton>
                            </div>
                            <InputError message={errors.stops} className="mb-2" />

                            {data.stops.map((stop, index) => (
                                <div
                                    key={index}
                                    className="mb-6 rounded-lg border border-gray-200 p-4 last:mb-0"
                                >
                                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                        <span className="text-sm font-semibold text-gray-700">Stop {index + 1}</span>
                                        <div className="flex flex-wrap gap-2">
                                            <SecondaryButton type="button" onClick={() => moveStop(index, -1)}>
                                                Up
                                            </SecondaryButton>
                                            <SecondaryButton type="button" onClick={() => moveStop(index, 1)}>
                                                Down
                                            </SecondaryButton>
                                            <SecondaryButton type="button" onClick={() => removeStop(index)}>
                                                Remove
                                            </SecondaryButton>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                        <div className="md:col-span-2">
                                            <InputLabel value="Stop name" />
                                            <TextInput
                                                className="mt-1 block w-full"
                                                value={stop.stop_name}
                                                onChange={(e) => updateStop(index, 'stop_name', e.target.value)}
                                            />
                                            <InputError message={errors[`stops.${index}.stop_name`]} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel value="Location" />
                                            <select
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                value={stop.location_id}
                                                onChange={(e) => updateStop(index, 'location_id', e.target.value)}
                                            >
                                                <option value="">—</option>
                                                {filteredLocations.map((l) => (
                                                    <option key={l.id} value={l.id}>
                                                        {l.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors[`stops.${index}.location_id`]} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel value="Stop status" />
                                            <select
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                value={stop.status}
                                                onChange={(e) => updateStop(index, 'status', e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="arrived">Arrived</option>
                                                <option value="completed">Completed</option>
                                                <option value="skipped">Skipped</option>
                                            </select>
                                            <InputError message={errors[`stops.${index}.status`]} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel value="Latitude" />
                                            <TextInput
                                                className="mt-1 block w-full"
                                                value={stop.latitude}
                                                onChange={(e) => updateStop(index, 'latitude', e.target.value)}
                                            />
                                            <InputError message={errors[`stops.${index}.latitude`]} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel value="Longitude" />
                                            <TextInput
                                                className="mt-1 block w-full"
                                                value={stop.longitude}
                                                onChange={(e) => updateStop(index, 'longitude', e.target.value)}
                                            />
                                            <InputError message={errors[`stops.${index}.longitude`]} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel value="Shipment" />
                                            <select
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                value={stop.shipment_id}
                                                onChange={(e) => updateStop(index, 'shipment_id', e.target.value)}
                                            >
                                                <option value="">—</option>
                                                {shipments.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.shipment_no} ({s.status})
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors[`stops.${index}.shipment_id`]} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel value="Job queue" />
                                            <select
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                value={stop.job_queue_id}
                                                onChange={(e) => updateStop(index, 'job_queue_id', e.target.value)}
                                            >
                                                <option value="">—</option>
                                                {jobQueues.map((q) => (
                                                    <option key={q.id} value={q.id}>
                                                        {q.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors[`stops.${index}.job_queue_id`]} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel value="ETA" />
                                            <TextInput
                                                type="datetime-local"
                                                className="mt-1 block w-full"
                                                value={stop.eta_at}
                                                onChange={(e) => updateStop(index, 'eta_at', e.target.value)}
                                            />
                                            <InputError message={errors[`stops.${index}.eta_at`]} className="mt-2" />
                                        </div>
                                        <div>
                                            <InputLabel value="ATA" />
                                            <TextInput
                                                type="datetime-local"
                                                className="mt-1 block w-full"
                                                value={stop.ata_at}
                                                onChange={(e) => updateStop(index, 'ata_at', e.target.value)}
                                            />
                                            <InputError message={errors[`stops.${index}.ata_at`]} className="mt-2" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <InputLabel value="Notes" />
                                            <textarea
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                rows={2}
                                                value={stop.notes}
                                                onChange={(e) => updateStop(index, 'notes', e.target.value)}
                                            />
                                            <InputError message={errors[`stops.${index}.notes`]} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Link href={route('route-plans.index')}>
                                <SecondaryButton type="button">Cancel</SecondaryButton>
                            </Link>
                            <PrimaryButton disabled={processing}>Update route plan</PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
