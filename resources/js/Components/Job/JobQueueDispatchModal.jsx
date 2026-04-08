import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Fragment, useEffect } from 'react';
import { XMarkIcon } from '@/Components/Icons';

const TEAL = '#20A4AC';
const DISPATCH_HEADER_BG = '#17A2B8';

export default function JobQueueDispatchModal({ isOpen, onClose, queue, assignments = [] }) {
    const q = queue || {};
    const { data, setData, post, processing, errors, reset } = useForm({
        driver_vehicle_assignment_id: '',
        notes: '',
    });

    useEffect(() => {
        if (!isOpen) return;
        reset();
    }, [isOpen, q.id, reset]);

    const submit = (e) => {
        e.preventDefault();
        if (!q.id) return;
        post(route('job-queues.dispatch', q.id), {
            preserveScroll: true,
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[110]" onClose={processing ? () => {} : onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto p-4">
                    <div className="flex min-h-full items-center justify-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-xl bg-white shadow-xl transition-all">
                                <div
                                    className="flex items-start justify-between px-5 py-4 text-white"
                                    style={{ backgroundColor: DISPATCH_HEADER_BG }}
                                >
                                    <div>
                                        <Dialog.Title className="text-lg font-semibold text-white">Dispatch job</Dialog.Title>
                                        <p className="mt-1 text-sm text-white/90">
                                            Job: <span className="font-semibold text-white">{q.job_number || `#${q.jobable_id}` || '—'}</span>
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        disabled={processing}
                                        className="rounded p-1 text-white/90 hover:bg-white/15 hover:text-white disabled:opacity-50"
                                        aria-label="Close"
                                    >
                                        <XMarkIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                <form onSubmit={submit} className="space-y-4 px-5 py-4">
                                    <div>
                                        <InputLabel htmlFor="driver_vehicle_assignment_id" value="Driver & vehicle" />
                                        <select
                                            id="driver_vehicle_assignment_id"
                                            className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-8 text-sm shadow-sm focus:border-[#17a2b8] focus:outline-none focus:ring-1 focus:ring-[#17a2b8]"
                                            value={data.driver_vehicle_assignment_id}
                                            onChange={(e) => setData('driver_vehicle_assignment_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select assignment…</option>
                                            {assignments.map((a) => (
                                                <option key={a.id} value={a.id}>
                                                    {(a.driver?.name || a.driver?.driver_code || 'Driver') +
                                                        ' · ' +
                                                        (a.vehicle?.registration_no || 'Vehicle')}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.driver_vehicle_assignment_id && (
                                            <p className="mt-1 text-sm text-red-600">{errors.driver_vehicle_assignment_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="dispatch_notes" value="Notes (optional)" />
                                        <TextInput
                                            id="dispatch_notes"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder=""
                                        />
                                        {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes}</p>}
                                    </div>

                                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            disabled={processing}
                                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing || !assignments.length}
                                            className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                                            style={{ backgroundColor: TEAL }}
                                        >
                                            {processing ? 'Dispatching…' : 'Confirm dispatch'}
                                        </button>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
