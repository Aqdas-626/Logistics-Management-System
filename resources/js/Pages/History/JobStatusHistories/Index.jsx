import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { MagnifyingGlassIcon, PlusIcon } from '@/Components/Icons';
import { useEffect, useMemo, useRef, useState } from 'react';

const STATUS_CHOICES = ['PENDING_TBA', 'ACTIVE', 'IN_PROCESS', 'DISPATCH', 'DELIVERED', 'CANCELLED'];

export default function Index({ histories, filters, statusOptions = [], jobQueues = [] }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [jobQueueSearch, setJobQueueSearch] = useState('');
    const [isJobQueueDropdownOpen, setIsJobQueueDropdownOpen] = useState(false);
    const jobQueueDropdownRef = useRef(null);
    const [oldStatusSearch, setOldStatusSearch] = useState('');
    const [isOldStatusDropdownOpen, setIsOldStatusDropdownOpen] = useState(false);
    const oldStatusDropdownRef = useRef(null);
    const [newStatusSearch, setNewStatusSearch] = useState('');
    const [isNewStatusDropdownOpen, setIsNewStatusDropdownOpen] = useState(false);
    const newStatusDropdownRef = useRef(null);

    const { data, setData, post, processing, reset, errors } = useForm({
        job_queue_id: '',
        old_status: '',
        new_status: '',
        remarks: '',
    });

    const allStatusOptions = useMemo(() => {
        return Array.from(new Set([...STATUS_CHOICES, ...statusOptions])).filter(Boolean);
    }, [statusOptions]);

    const filteredJobQueues = useMemo(() => {
        const query = jobQueueSearch.trim().toLowerCase();
        if (!query) return jobQueues;
        return jobQueues.filter((q) => String(q.label || '').toLowerCase().includes(query));
    }, [jobQueueSearch, jobQueues]);
    const filteredOldStatuses = useMemo(() => {
        const query = oldStatusSearch.trim().toLowerCase();
        if (!query) return allStatusOptions;
        return allStatusOptions.filter((s) => String(s || '').toLowerCase().includes(query));
    }, [allStatusOptions, oldStatusSearch]);
    const filteredNewStatuses = useMemo(() => {
        const query = newStatusSearch.trim().toLowerCase();
        if (!query) return allStatusOptions;
        return allStatusOptions.filter((s) => String(s || '').toLowerCase().includes(query));
    }, [allStatusOptions, newStatusSearch]);

    useEffect(() => {
        const selectedQueue = jobQueues.find((q) => String(q.id) === String(data.job_queue_id));
        if (selectedQueue) {
            setJobQueueSearch(selectedQueue.label);
        } else if (!data.job_queue_id) {
            setJobQueueSearch('');
        }
    }, [jobQueues, data.job_queue_id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (jobQueueDropdownRef.current && !jobQueueDropdownRef.current.contains(event.target)) {
                setIsJobQueueDropdownOpen(false);
            }
            if (oldStatusDropdownRef.current && !oldStatusDropdownRef.current.contains(event.target)) {
                setIsOldStatusDropdownOpen(false);
            }
            if (newStatusDropdownRef.current && !newStatusDropdownRef.current.contains(event.target)) {
                setIsNewStatusDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    useEffect(() => {
        if (data.old_status) {
            setOldStatusSearch(data.old_status);
        } else {
            setOldStatusSearch('');
        }
    }, [data.old_status]);
    useEffect(() => {
        if (data.new_status) {
            setNewStatusSearch(data.new_status);
        } else {
            setNewStatusSearch('');
        }
    }, [data.new_status]);

    const onJobQueueSearchChange = (value) => {
        setJobQueueSearch(value);
        setData('job_queue_id', '');
        setIsJobQueueDropdownOpen(true);
    };

    const onJobQueueSelect = (value) => {
        setData('job_queue_id', value);
        const picked = jobQueues.find((q) => String(q.id) === String(value));
        if (picked) {
            setJobQueueSearch(picked.label);
        }
        setIsJobQueueDropdownOpen(false);
    };
    const onOldStatusSearchChange = (value) => {
        setOldStatusSearch(value);
        setData('old_status', '');
        setIsOldStatusDropdownOpen(true);
    };
    const onOldStatusSelect = (value) => {
        setData('old_status', value);
        setOldStatusSearch(value);
        setIsOldStatusDropdownOpen(false);
    };
    const onNewStatusSearchChange = (value) => {
        setNewStatusSearch(value);
        setData('new_status', '');
        setIsNewStatusDropdownOpen(true);
    };
    const onNewStatusSelect = (value) => {
        setData('new_status', value);
        setNewStatusSearch(value);
        setIsNewStatusDropdownOpen(false);
    };

    const submitSearch = (e) => {
        e.preventDefault();
        router.get(
            route('job-status-histories.index'),
            { search: searchTerm, status },
            { preserveState: true, preserveScroll: true },
        );
    };

    const clearSearch = () => {
        setSearchTerm('');
        setStatus('');
        router.get(route('job-status-histories.index'));
    };

    const submitCreate = (e) => {
        e.preventDefault();
        post(route('job-status-histories.store'), {
            preserveScroll: true,
            onSuccess: () => reset('old_status', 'new_status', 'remarks'),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Job Status Histories" />

            <div>
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Job Status Histories</h1>
                        <p className="mt-2 text-gray-600">Track every job queue status movement.</p>
                    </div>
                </div>

                <div className="mb-6 rounded-xl bg-white p-6 shadow-md">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <PlusIcon className="h-5 w-5" />
                        Add History Entry
                    </h2>
                    <form onSubmit={submitCreate} className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Job Queue</label>
                            <div className="relative" ref={jobQueueDropdownRef}>
                                <input
                                    type="text"
                                    value={jobQueueSearch}
                                    onFocus={() => setIsJobQueueDropdownOpen(true)}
                                    onChange={(e) => onJobQueueSearchChange(e.target.value)}
                                    placeholder="Search queue..."
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none"
                                    required={!data.job_queue_id}
                                />
                                {isJobQueueDropdownOpen && (
                                    <div className="absolute z-20 mt-1 max-h-44 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData('job_queue_id', '');
                                                setJobQueueSearch('');
                                                setIsJobQueueDropdownOpen(false);
                                            }}
                                            className="w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                                        >
                                            Select queue
                                        </button>
                                        {filteredJobQueues.map((q) => (
                                            <button
                                                key={q.id}
                                                type="button"
                                                onClick={() => onJobQueueSelect(String(q.id))}
                                                className={`w-full px-3 py-2 text-left text-sm hover:bg-[#1a8d95] hover:text-white ${String(data.job_queue_id) === String(q.id) ? 'bg-[#20A4AC] text-white' : 'text-gray-700'}`}
                                            >
                                                {q.label}
                                            </button>
                                        ))}
                                        {!filteredJobQueues.length && (
                                            <div className="px-3 py-2 text-sm text-gray-500">No queue found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.job_queue_id && <p className="mt-1 text-xs text-red-600">{errors.job_queue_id}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Old Status</label>
                            <div className="relative" ref={oldStatusDropdownRef}>
                                <input
                                    type="text"
                                    value={oldStatusSearch}
                                    onFocus={() => setIsOldStatusDropdownOpen(true)}
                                    onChange={(e) => onOldStatusSearchChange(e.target.value)}
                                    placeholder="Search old status..."
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none"
                                />
                                {isOldStatusDropdownOpen && (
                                    <div className="absolute z-20 mt-1 max-h-44 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData('old_status', '');
                                                setOldStatusSearch('');
                                                setIsOldStatusDropdownOpen(false);
                                            }}
                                            className="w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                                        >
                                            (optional)
                                        </button>
                                        {filteredOldStatuses.map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => onOldStatusSelect(String(s))}
                                                className={`w-full px-3 py-2 text-left text-sm hover:bg-[#1a8d95] hover:text-white ${String(data.old_status) === String(s) ? 'bg-[#20A4AC] text-white' : 'text-gray-700'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                        {!filteredOldStatuses.length && (
                                            <div className="px-3 py-2 text-sm text-gray-500">No status found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.old_status && <p className="mt-1 text-xs text-red-600">{errors.old_status}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">New Status</label>
                            <div className="relative" ref={newStatusDropdownRef}>
                                <input
                                    type="text"
                                    value={newStatusSearch}
                                    onFocus={() => setIsNewStatusDropdownOpen(true)}
                                    onChange={(e) => onNewStatusSearchChange(e.target.value)}
                                    placeholder="Search new status..."
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none"
                                    required={!data.new_status}
                                />
                                {isNewStatusDropdownOpen && (
                                    <div className="absolute z-20 mt-1 max-h-44 w-full overflow-auto rounded border border-gray-300 bg-white shadow-lg">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setData('new_status', '');
                                                setNewStatusSearch('');
                                                setIsNewStatusDropdownOpen(false);
                                            }}
                                            className="w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-600 hover:bg-gray-50"
                                        >
                                            Select status
                                        </button>
                                        {filteredNewStatuses.map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => onNewStatusSelect(String(s))}
                                                className={`w-full px-3 py-2 text-left text-sm hover:bg-[#1a8d95] hover:text-white ${String(data.new_status) === String(s) ? 'bg-[#20A4AC] text-white' : 'text-gray-700'}`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                        {!filteredNewStatuses.length && (
                                            <div className="px-3 py-2 text-sm text-gray-500">No status found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                            {errors.new_status && <p className="mt-1 text-xs text-red-600">{errors.new_status}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-gray-700">Remarks</label>
                            <input
                                type="text"
                                value={data.remarks}
                                onChange={(e) => setData('remarks', e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none"
                                placeholder="Optional notes"
                            />
                            {errors.remarks && <p className="mt-1 text-xs text-red-600">{errors.remarks}</p>}
                        </div>
                        <div className="md:col-span-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-[#20A4AC] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                            >
                                {processing ? 'Saving...' : 'Save History'}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mb-4 rounded-xl bg-white p-4 shadow-md">
                    <form onSubmit={submitSearch} className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-0 flex-1">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by queue, job ref, status or remarks"
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#20A4AC] focus:outline-none"
                            />
                        </div>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#20A4AC] focus:outline-none"
                        >
                            <option value="">All statuses</option>
                            {allStatusOptions.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        <button type="submit" className="rounded-lg bg-[#20A4AC] px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                            Search
                        </button>
                        <button type="button" onClick={clearSearch} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                            Clear
                        </button>
                    </form>
                </div>

                <div className="overflow-hidden rounded-xl bg-white shadow-md">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Queue ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Job Ref</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Old Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">New Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Remarks</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Changed By</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-700">Changed At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {histories?.data?.length ? (
                                    histories.data.map((row) => (
                                        <tr key={row.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{row.job_queue_id}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{row.job_reference}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{row.old_status || '-'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{row.new_status}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{row.remarks || '-'}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{row.changed_by}</td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{row.changed_at}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                                            No status history found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {histories?.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium">{histories.from}</span> to <span className="font-medium">{histories.to}</span> of{' '}
                            <span className="font-medium">{histories.total}</span> entries
                        </div>
                        <div className="flex gap-2">
                            {histories.prev_page_url && (
                                <a
                                    href={histories.prev_page_url}
                                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Previous
                                </a>
                            )}
                            {histories.next_page_url && (
                                <a
                                    href={histories.next_page_url}
                                    className="rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
