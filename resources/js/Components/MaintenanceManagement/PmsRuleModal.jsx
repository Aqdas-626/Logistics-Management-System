import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { XMarkIcon } from '@/Components/Icons';

const TEAL = '#20A4AC';
const TEAL_HOVER = '#178089';

export default function PmsRuleModal({ isOpen, onClose, rule, vehicles }) {
    const { data, setData, put, processing, reset, errors } = useForm({
        vehicle_id: '',
        service_name: '',
        interval_km: '',
        interval_days: '',
        is_active: true,
    });

    useEffect(() => {
        if (!isOpen || !rule) return;
        setData({
            vehicle_id: rule.vehicle_id != null ? String(rule.vehicle_id) : '',
            service_name: rule.service_name || '',
            interval_km: rule.interval_km != null ? String(rule.interval_km) : '',
            interval_days: rule.interval_days != null ? String(rule.interval_days) : '',
            is_active: Boolean(rule.is_active),
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, rule?.id]);

    const handleClose = () => {
        reset();
        onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!rule) return;
        put(route('pms-scheduler.update', rule.id), {
            preserveScroll: true,
            onSuccess: () => handleClose(),
        });
    };

    if (!isOpen || !rule) return null;

    function vehicleLabel(v) {
        const reg = v.registration_no || '';
        const name = v.name || '';
        if (reg && name) return `${reg} — ${name}`;
        return reg || name || `Vehicle #${v.id}`;
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-[1px]">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative w-full max-w-lg transform overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-xl sm:my-8">
                    <div
                        className="flex items-center justify-between px-5 py-3 text-sm font-semibold text-white"
                        style={{ backgroundColor: TEAL }}
                    >
                        <span>Edit PMS Rule</span>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="rounded-lg p-1 text-white/90 hover:bg-white/10"
                            aria-label="Close"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 px-5 py-4">
                        <div>
                            <label htmlFor="pms-m-vehicle" className="mb-1.5 block text-sm font-medium text-gray-700">
                                Vehicle <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="pms-m-vehicle"
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
                            <label htmlFor="pms-m-service" className="mb-1.5 block text-sm font-medium text-gray-700">
                                Service Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="pms-m-service"
                                type="text"
                                value={data.service_name}
                                onChange={(e) => setData('service_name', e.target.value)}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                placeholder="e.g. Oil Change, Tyre Rotation"
                                maxLength={200}
                            />
                            {errors.service_name && <p className="mt-1 text-sm text-red-600">{errors.service_name}</p>}
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                                <label htmlFor="pms-m-km" className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Interval (KM)
                                </label>
                                <input
                                    id="pms-m-km"
                                    type="number"
                                    min={0}
                                    value={data.interval_km}
                                    onChange={(e) => setData('interval_km', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                    placeholder="e.g. 10000"
                                />
                                {errors.interval_km && <p className="mt-1 text-sm text-red-600">{errors.interval_km}</p>}
                            </div>
                            <div>
                                <label htmlFor="pms-m-days" className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Interval (Days)
                                </label>
                                <input
                                    id="pms-m-days"
                                    type="number"
                                    min={0}
                                    value={data.interval_days}
                                    onChange={(e) => setData('interval_days', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                    placeholder="e.g. 180"
                                />
                                {errors.interval_days && (
                                    <p className="mt-1 text-sm text-red-600">{errors.interval_days}</p>
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-gray-500">Leave blank if not applicable. At least one interval is required.</p>

                        <div className="flex items-center gap-2">
                            <input
                                id="pms-m-active"
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-[#20A4AC] focus:ring-[#20A4AC]"
                            />
                            <label htmlFor="pms-m-active" className="text-sm font-medium text-gray-700">
                                Rule is active
                            </label>
                        </div>
                        {errors.is_active && <p className="text-sm text-red-600">{errors.is_active}</p>}

                        <div className="flex flex-col-reverse gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:justify-between">
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
                                className="inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm disabled:opacity-50 sm:w-auto"
                                style={{ backgroundColor: TEAL }}
                                onMouseEnter={(e) => {
                                    if (!processing) e.currentTarget.style.backgroundColor = TEAL_HOVER;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = TEAL;
                                }}
                            >
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
