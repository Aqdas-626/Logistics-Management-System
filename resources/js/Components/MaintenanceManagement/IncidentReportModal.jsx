import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { XMarkIcon } from '@/Components/Icons';

const TEAL = '#20A4AC';
const TEAL_HOVER = '#178089';

const STATUS_OPTIONS = [
    { value: 'open', label: 'Open' },
    { value: 'converted_to_maintenance', label: 'Converted To Maintenance' },
    { value: 'closed', label: 'Closed' },
    { value: 'cancelled', label: 'Cancelled' },
];

export default function IncidentReportModal({ isOpen, onClose, incident, vehicles }) {
    const { data, setData, post, put, processing, reset, errors } = useForm({
        vehicle_id: '',
        description: '',
        status: 'open',
    });

    useEffect(() => {
        if (!isOpen) return;
        if (incident) {
            setData({
                vehicle_id: incident.vehicle_id != null ? String(incident.vehicle_id) : '',
                description: incident.description || '',
                status: incident.status || 'open',
            });
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, incident?.id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (incident) {
            put(route('incident-reports.update', incident.id), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        } else {
            post(route('incident-reports.store'), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    function vehicleLabel(v) {
        const reg = v.registration_no || '';
        const name = v.name || '';
        if (reg && name) return `${reg} — ${name}`;
        return reg || name || `Vehicle #${v.id}`;
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-[1px]">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div
                    className="relative w-full max-w-lg transform overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-xl transition-all sm:my-8"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="incident-modal-title"
                >
                    <div
                        className="flex items-center justify-between px-5 py-3 text-sm font-semibold text-white"
                        style={{ backgroundColor: TEAL }}
                    >
                        <span id="incident-modal-title">{incident ? 'Edit Issue Report' : 'New Issue Report'}</span>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-lg p-1 text-white/90 hover:bg-white/10"
                            aria-label="Close"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="px-5 py-4">
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="ir-vehicle" className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Vehicle
                                </label>
                                <select
                                    id="ir-vehicle"
                                    value={data.vehicle_id}
                                    onChange={(e) => setData('vehicle_id', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                >
                                    <option value="">Select Vehicle</option>
                                    {vehicles.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {vehicleLabel(v)}
                                        </option>
                                    ))}
                                </select>
                                {errors.vehicle_id && <p className="mt-1 text-sm text-red-600">{errors.vehicle_id}</p>}
                            </div>

                            <div>
                                <label htmlFor="ir-desc" className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Description of Issue <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="ir-desc"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={5}
                                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                    placeholder="Describe the noise, leak, or issue..."
                                />
                                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                            </div>

                            {incident && (
                                <div>
                                    <label htmlFor="ir-status" className="mb-1.5 block text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <select
                                        id="ir-status"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                    >
                                        {STATUS_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-between">
                            <button
                                type="button"
                                disabled={processing}
                                onClick={handleClose}
                                className="inline-flex w-full justify-center rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 shadow-sm hover:bg-red-50 sm:w-auto"
                            >
                                Close
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50 sm:w-auto"
                                style={{ backgroundColor: TEAL }}
                                onMouseEnter={(e) => {
                                    if (!processing) e.currentTarget.style.backgroundColor = TEAL_HOVER;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = TEAL;
                                }}
                            >
                                {incident ? 'Save Changes' : 'Submit Report'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
