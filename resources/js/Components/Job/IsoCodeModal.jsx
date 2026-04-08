import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { XMarkIcon, CheckIcon } from '@/Components/Icons';

export default function IsoCodeModal({ isOpen, onClose, isoCode }) {
    const { data, setData, post, put, processing, reset, errors } = useForm({
        name: '',
        code: '',
        status: true,
    });

    useEffect(() => {
        if (isoCode) {
            setData({
                name: isoCode.name || '',
                code: isoCode.code || '',
                status: isoCode.status || true,
            });
        } else {
            reset();
        }
    }, [isoCode]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                reset();
                onClose();
            },
        };
        if (isoCode) {
            put(route('iso-codes.update', isoCode.id), options);
        } else {
            post(route('iso-codes.store'), options);
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
                                <h3 className="text-base font-semibold leading-6 text-gray-900">
                                    {isoCode ? 'Edit ISO Code' : 'New ISO Code'}
                                </h3>
                                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Name *
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                            placeholder="e.g. United States"
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Code
                                        </label>
                                        <input
                                            id="code"
                                            type="text"
                                            value={data.code}
                                            onChange={(e) => setData('code', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                            placeholder="e.g. US"
                                            maxLength={30}
                                        />
                                        {errors.code && (
                                            <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="status"
                                            type="checkbox"
                                            checked={data.status}
                                            onChange={(e) => setData('status', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-[#20A4AC] focus:ring-[#20A4AC]"
                                        />
                                        <label htmlFor="status" className="ml-2 block text-sm text-gray-900">
                                            Active
                                        </label>
                                    </div>
                                    {errors.status && (
                                        <p className="text-sm text-red-600">{errors.status}</p>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            disabled={processing}
                            onClick={handleClose}
                            className="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                            <XMarkIcon className="-ml-1 mr-1 h-4 w-4" />
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={processing}
                            onClick={handleSubmit}
                            className="inline-flex w-full justify-center rounded-md bg-[#20A4AC] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#1a8d95] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20A4AC] sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                            <CheckIcon className="-ml-1 mr-1 h-4 w-4" />
                            {isoCode ? 'Update' : 'Create'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

