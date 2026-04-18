import { XMarkIcon } from '@/Components/Icons';

const TEAL = '#20A4AC';

function formatStatus(status) {
    if (!status) return '—';
    return String(status)
        .split('_')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export default function MaintenanceTicketModal({ isOpen, onClose, incident }) {
    if (!isOpen || !incident) return null;

    const ticket = incident.maintenance_ticket;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-[1px]">
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3" style={{ backgroundColor: TEAL }}>
                        <h3 className="text-sm font-semibold text-white">Maintenance Ticket</h3>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg p-1 text-white/90 hover:bg-white/10"
                            aria-label="Close"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="space-y-3 px-5 py-4 text-sm text-gray-700">
                        {ticket ? (
                            <>
                                <p>
                                    <span className="font-medium text-gray-900">Ticket ID:</span> #{ticket.id}
                                </p>
                                <p>
                                    <span className="font-medium text-gray-900">Work order status:</span>{' '}
                                    {formatStatus(ticket.status)}
                                </p>
                                <p className="text-xs text-gray-500">Linked from incident report #{incident.id}.</p>
                            </>
                        ) : (
                            <p className="text-gray-600">No maintenance ticket is linked to this incident yet.</p>
                        )}
                    </div>
                    <div className="border-t border-gray-100 px-5 py-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full rounded-lg border border-gray-200 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
