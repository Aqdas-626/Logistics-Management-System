import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { XMarkIcon } from '@/Components/Icons';

/** Column layout matches reference: 4 columns × 5 rows of checkboxes */
const EXPORT_COLUMN_GROUPS = [
    [
        { id: 'container_number', label: 'Container Number' },
        { id: 'iso_code', label: 'ISO Code' },
        { id: 'dg', label: 'DG' },
        { id: 'ecn', label: 'ECN' },
        { id: 'created_date', label: 'Created Date' },
    ],
    [
        { id: 'from_location', label: 'From' },
        { id: 'weight', label: 'Weight' },
        { id: 'branch_name', label: 'Branch Name' },
        { id: 'job_type', label: 'Job Type' },
        { id: 'live_ul', label: 'L/UL' },
    ],
    [
        { id: 'to_location', label: 'To' },
        { id: 'truck', label: 'Truck' },
        { id: 'ef', label: 'E/F' },
        { id: 'trip_code', label: 'Trip Code' },
        { id: 'do_after_date', label: 'Do After Date' },
    ],
    [
        { id: 'job_number', label: 'Job Number' },
        { id: 'available_date', label: 'Available Date' },
        { id: 'release_random', label: 'Release / Random' },
        { id: 'status', label: 'Job Status' },
        { id: 'shipping_line', label: 'ShippingLine' },
    ],
];

const ALL_COLUMN_IDS = EXPORT_COLUMN_GROUPS.flat().map((c) => c.id);

function escapeCsvField(value) {
    const raw = value == null || value === undefined ? '' : String(value);
    if (/[",\n\r]/.test(raw)) {
        return `"${raw.replace(/"/g, '""')}"`;
    }
    return raw;
}

function getCellValue(queue, columnId, { getMovementLabel, formatDate, formatWeight, statusLabels }) {
    switch (columnId) {
        case 'container_number':
            return queue.container_number ?? '';
        case 'from_location':
            return queue.from_location ?? '';
        case 'to_location':
            return queue.to_location ?? '';
        case 'job_number':
            return queue.job_number ?? (queue.jobable_id != null ? `#${queue.jobable_id}` : '');
        case 'iso_code':
            return queue.iso_code ?? '';
        case 'weight':
            return formatWeight(queue.weight);
        case 'truck':
            return queue.truck ?? '';
        case 'available_date':
            return formatDate(queue.available_date);
        case 'dg':
            return queue.dg ? 'Yes' : 'No';
        case 'branch_name':
            return queue.branch_name ?? '';
        case 'ef':
            return queue.ef ?? '';
        case 'release_random':
            return queue.release_random ?? '';
        case 'ecn':
            return queue.ecn ?? '';
        case 'job_type':
            return queue.job_type || getMovementLabel(queue.jobable_type);
        case 'trip_code':
            return queue.trip_code ?? '';
        case 'status':
            return statusLabels[queue.status] || queue.status || '';
        case 'created_date':
            return formatDate(queue.created_date);
        case 'live_ul':
            return queue.live_ul ? 'Yes' : 'No';
        case 'do_after_date':
            return formatDate(queue.do_after_date);
        case 'shipping_line':
            return queue.shipping_line ?? '';
        default:
            return '';
    }
}

export default function JobQueueExportModal({
    isOpen,
    onClose,
    rows,
    getMovementLabel,
    formatDate,
    formatWeight,
    statusLabels,
}) {
    const [selectedCols, setSelectedCols] = useState(() =>
        Object.fromEntries(ALL_COLUMN_IDS.map((id) => [id, true])),
    );

    useEffect(() => {
        if (isOpen) {
            setSelectedCols(Object.fromEntries(ALL_COLUMN_IDS.map((id) => [id, true])));
        }
    }, [isOpen]);

    const activeColumns = useMemo(() => {
        const list = [];
        for (const group of EXPORT_COLUMN_GROUPS) {
            for (const col of group) {
                if (selectedCols[col.id]) list.push(col);
            }
        }
        return list;
    }, [selectedCols]);

    const toggleCol = (id) => {
        setSelectedCols((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleExport = () => {
        if (rows.length === 0 || activeColumns.length === 0) return;

        const header = activeColumns.map((c) => escapeCsvField(c.label)).join(',');
        const lines = [header];

        const ctx = { getMovementLabel, formatDate, formatWeight, statusLabels };
        for (const queue of rows) {
            const cells = activeColumns.map((col) => escapeCsvField(getCellValue(queue, col.id, ctx)));
            lines.push(cells.join(','));
        }

        const csv = `\uFEFF${lines.join('\r\n')}`;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
        a.href = url;
        a.download = `job-queue-export-${stamp}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        onClose();
    };

    const exportDisabled = rows.length === 0 || activeColumns.length === 0;

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                                <div className="flex items-center justify-between bg-gradient-to-r from-[#20A4AC] to-[#1a8d95] px-5 py-3">
                                    <Dialog.Title className="text-lg font-bold text-white">Export to CSV</Dialog.Title>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded p-1 text-white hover:bg-white/10"
                                        aria-label="Close"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="border-b border-gray-100 px-5 py-3 text-sm text-gray-600">
                                    Exporting <span className="font-semibold text-gray-900">{rows.length}</span> selected{' '}
                                    {rows.length === 1 ? 'job' : 'jobs'}. Choose columns to include.
                                </div>

                                <div className="max-h-[min(420px,55vh)] overflow-y-auto px-5 py-4">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                        {EXPORT_COLUMN_GROUPS.map((group, gi) => (
                                            <div key={gi} className="space-y-2.5">
                                                {group.map((col) => (
                                                    <label
                                                        key={col.id}
                                                        className="flex cursor-pointer items-center gap-2 text-sm text-gray-800"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={!!selectedCols[col.id]}
                                                            onChange={() => toggleCol(col.id)}
                                                            className="h-4 w-4 rounded border-gray-300 text-[#20A4AC] focus:ring-[#20A4AC]"
                                                        />
                                                        <span>{col.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-md bg-gradient-to-r from-[#20A4AC] to-[#1a8d95] px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-[#1a8d95] hover:to-[#126f76]"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        disabled={exportDisabled}
                                        onClick={handleExport}
                                        className="rounded-md bg-gradient-to-r from-[#20A4AC] to-[#1a8d95] px-4 py-2 text-sm font-medium text-white shadow-sm hover:from-[#1a8d95] hover:to-[#126f76] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Export
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
