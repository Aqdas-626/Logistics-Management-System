import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import { XMarkIcon } from '@/Components/Icons';

const TEAL = '#20A4AC';
const TEAL_HOVER = '#178089';

export default function PartStockModal({ isOpen, onClose, part }) {
    const { data, setData, post, put, processing, reset, errors } = useForm({
        sku: '',
        name: '',
        unit: 'pcs',
        unit_cost: '',
        stock_qty: '0',
    });

    useEffect(() => {
        if (!isOpen) return;
        if (part) {
            setData({
                sku: part.sku || '',
                name: part.name || '',
                unit: part.unit || 'pcs',
                unit_cost: part.unit_cost != null && part.unit_cost !== '' ? String(part.unit_cost) : '',
                stock_qty: part.stock_qty != null ? String(part.stock_qty) : '0',
            });
        } else {
            reset();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, part?.id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (part) {
            put(route('part-stocks.update', part.id), {
                preserveScroll: true,
                onSuccess: () => onClose(),
            });
        } else {
            post(route('part-stocks.store'), {
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

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-[1px]">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div
                    className="relative w-full max-w-md transform overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-xl transition-all sm:my-8"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="part-stock-modal-title"
                >
                    <div
                        className="flex items-center justify-between px-5 py-3 text-sm font-semibold text-white sm:text-base"
                        style={{ backgroundColor: TEAL }}
                    >
                        <span id="part-stock-modal-title">{part ? 'Edit Part Stock' : 'Add Part Stock'}</span>
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
                            <label htmlFor="ps-sku" className="mb-1.5 block text-sm font-medium text-gray-700">
                                SKU
                            </label>
                            <input
                                id="ps-sku"
                                type="text"
                                value={data.sku}
                                onChange={(e) => setData('sku', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                placeholder="Optional SKU"
                                maxLength={80}
                            />
                            {errors.sku && <p className="mt-1 text-sm text-red-600">{errors.sku}</p>}
                        </div>

                        <div>
                            <label htmlFor="ps-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="ps-name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                placeholder="Part name"
                                maxLength={200}
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div>
                            <label htmlFor="ps-unit" className="mb-1.5 block text-sm font-medium text-gray-700">
                                Unit <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="ps-unit"
                                type="text"
                                value={data.unit}
                                onChange={(e) => setData('unit', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                placeholder="e.g. pcs, box"
                                maxLength={20}
                            />
                            {errors.unit && <p className="mt-1 text-sm text-red-600">{errors.unit}</p>}
                        </div>

                        <div>
                            <label htmlFor="ps-cost" className="mb-1.5 block text-sm font-medium text-gray-700">
                                Unit cost
                            </label>
                            <input
                                id="ps-cost"
                                type="number"
                                step="0.01"
                                min={0}
                                value={data.unit_cost}
                                onChange={(e) => setData('unit_cost', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                placeholder="Optional"
                            />
                            {errors.unit_cost && <p className="mt-1 text-sm text-red-600">{errors.unit_cost}</p>}
                        </div>

                        <div>
                            <label htmlFor="ps-qty" className="mb-1.5 block text-sm font-medium text-gray-700">
                                Stock quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="ps-qty"
                                type="number"
                                min={0}
                                value={data.stock_qty}
                                onChange={(e) => setData('stock_qty', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                                placeholder="0"
                            />
                            {errors.stock_qty && <p className="mt-1 text-sm text-red-600">{errors.stock_qty}</p>}
                        </div>

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
                                className="inline-flex w-full justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50 sm:w-auto"
                                style={{ backgroundColor: TEAL }}
                                onMouseEnter={(e) => {
                                    if (!processing) e.currentTarget.style.backgroundColor = TEAL_HOVER;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = TEAL;
                                }}
                            >
                                {part ? 'Save' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
