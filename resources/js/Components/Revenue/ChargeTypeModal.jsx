import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { CheckIcon, XMarkIcon } from '@/Components/Icons';

export default function ChargeTypeModal({ isOpen, onClose, chargeType }) {
    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        status: 'active',
    });

    useEffect(() => {
        if (chargeType) {
            setData({
                name: chargeType.name || '',
                status: chargeType.status || 'active',
            });
        } else {
            reset();
            setData('status', 'active');
        }
    }, [chargeType]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (chargeType) {
            put(route('charge-types.update', chargeType.id), {
                preserveScroll: true,
                onSuccess: () => handleClose(),
            });
        } else {
            post(route('charge-types.store'), {
                preserveScroll: true,
                onSuccess: () => handleClose(),
            });
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 flex-grow sm:ml-4 sm:mt-0">
                                <div className="flex justify-between items-center">
                                <h3 className="text-base font-semibold leading-6 text-gray-900">
                                    {chargeType ? 'Edit Charge Type' : 'New Charge Type'}
                                </h3>
                                <button
                                    type="button"
                                    disabled={processing}
                                    onClick={handleClose}
                                    aria-label="Close modal"
                                    className="inline-flex items-center justify-center rounded-md bg-[#20A4AC] p-2 text-white shadow-sm transition hover:bg-[#1a8d95] disabled:opacity-50"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                                </div>
                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    <div>
                                        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Name *
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                            placeholder="e.g. THC"
                                            maxLength={120}
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-gray-700">
                                            Status
                                        </label>
                                        <select
                                            id="status"
                                            value={data.status}
                                            onChange={(e) => setData('status', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        
                        <button
                            type="button"
                            disabled={processing}
                            onClick={handleSubmit}
                            className="inline-flex w-full justify-center rounded-md bg-[#20A4AC] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1a8d95] sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                            <CheckIcon className="-ml-1 mr-1 h-4 w-4" />
                            {chargeType ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

