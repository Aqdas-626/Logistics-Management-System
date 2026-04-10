import { toast } from 'react-toastify';

export function confirmDelete({ message = 'Are you sure?', onConfirm, onCancel, confirmText = 'Yes, delete', cancelText = 'Cancel' }) {
    const toastId = toast.info(
        <div className="space-y-3">
            <p className="text-sm font-medium text-gray-900">{message}</p>
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => {
                        toast.dismiss(toastId);
                        if (typeof onConfirm === 'function') onConfirm();
                    }}
                    className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
                >
                    {confirmText}
                </button>
                <button
                    type="button"
                    onClick={() => {
                        toast.dismiss(toastId);
                        if (typeof onCancel === 'function') onCancel();
                    }}
                    className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                    {cancelText}
                </button>
            </div>
        </div>,
        {
            autoClose: false,
            closeOnClick: false,
            closeButton: false,
            draggable: false,
        },
    );
}
