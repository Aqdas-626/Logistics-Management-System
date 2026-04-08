import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Fragment, useMemo, useState } from 'react';
import { XMarkIcon } from '@/Components/Icons';

const HEADER_BG = '#17A2B8';
const TEAL = '#20A4AC';

function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / (1024 ** i);
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
}

export default function JobQueueDocumentModal({ isOpen, onClose, queue }) {
    const q = queue || {};
    const [isDragging, setIsDragging] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        files: [],
        notes: '',
    });

    const files = useMemo(() => (Array.isArray(data.files) ? data.files : []), [data.files]);

    const applyFiles = (fileList) => {
        const picked = Array.from(fileList || []);
        if (!picked.length) return;
        setData('files', [...files, ...picked]);
    };

    const removeFileAt = (idx) => {
        setData(
            'files',
            files.filter((_, i) => i !== idx),
        );
    };

    const closeModal = () => {
        if (processing) return;
        reset();
        setIsDragging(false);
        onClose();
    };

    const onDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        applyFiles(e.dataTransfer?.files);
    };

    const submit = (e) => {
        e.preventDefault();
        if (!q.id || files.length === 0) return;
        post(route('job-queues.documents.store', q.id), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                reset();
                setIsDragging(false);
                onClose();
            },
        });
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[125]" onClose={closeModal}>
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
                            <Dialog.Panel className="w-full max-w-xl overflow-hidden rounded-md bg-white shadow-xl">
                                <div className="flex items-center justify-between px-4 py-2.5 text-white" style={{ backgroundColor: HEADER_BG }}>
                                    <Dialog.Title className="text-sm font-semibold">Upload Documents</Dialog.Title>
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={processing}
                                        className="rounded p-1 text-white/90 hover:bg-white/15 hover:text-white disabled:opacity-50"
                                        aria-label="Close"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </div>

                                <form onSubmit={submit} className="space-y-4 px-5 py-4">
                                    <p className="text-xs text-gray-600">
                                        Job: <span className="font-semibold text-gray-800">{q.job_number || `#${q.jobable_id}` || '—'}</span>
                                    </p>

                                    <div>
                                        <InputLabel value="Files (Image/PDF/Word)" />
                                        <label
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                setIsDragging(true);
                                            }}
                                            onDragLeave={(e) => {
                                                e.preventDefault();
                                                setIsDragging(false);
                                            }}
                                            onDrop={onDrop}
                                            className={[
                                                'mt-1 block cursor-pointer rounded-md border-2 border-dashed p-6 text-center transition-colors',
                                                isDragging ? 'border-[#17A2B8] bg-[#17A2B8]/5' : 'border-gray-300 bg-gray-50',
                                            ].join(' ')}
                                        >
                                            <input
                                                type="file"
                                                multiple
                                                accept=".jpg,.jpeg,.png,.gif,.webp,.bmp,.tif,.tiff,.pdf,.doc,.docx"
                                                className="hidden"
                                                onChange={(e) => applyFiles(e.target.files)}
                                            />
                                            <div className="text-sm font-medium text-gray-800">Drag & drop files here</div>
                                            <div className="mt-1 text-xs text-gray-500">or click to browse</div>
                                            <div className="mt-2 text-[11px] text-gray-500">Allowed: Image, PDF, Word (.doc/.docx) | Max 10MB each</div>
                                        </label>
                                        {errors.files && <p className="mt-1 text-xs text-red-600">{errors.files}</p>}
                                        {errors['files.0'] && <p className="mt-1 text-xs text-red-600">{errors['files.0']}</p>}
                                    </div>

                                    {files.length > 0 && (
                                        <div className="max-h-40 overflow-auto rounded border border-gray-200">
                                            {files.map((f, idx) => (
                                                <div key={`${f.name}-${idx}`} className="flex items-center justify-between border-b border-gray-100 px-3 py-2 text-xs last:border-b-0">
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium text-gray-800">{f.name}</p>
                                                        <p className="text-gray-500">{formatBytes(f.size)}</p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFileAt(idx)}
                                                        className="ml-3 rounded px-2 py-1 text-red-600 hover:bg-red-50"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div>
                                        <InputLabel htmlFor="jq_doc_notes" value="Notes (optional)" />
                                        <TextInput
                                            id="jq_doc_notes"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                        />
                                        {errors.notes && <p className="mt-1 text-xs text-red-600">{errors.notes}</p>}
                                    </div>

                                    <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            disabled={processing}
                                            className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={processing || files.length === 0}
                                            className="rounded px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                                            style={{ backgroundColor: TEAL }}
                                        >
                                            {processing ? 'Uploading…' : 'Upload'}
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
