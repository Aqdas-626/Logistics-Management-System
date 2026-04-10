import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import EndorsementModal from '@/Components/Job/EndorsementModal';
import EndorsementTable from '@/Components/Job/EndorsementTable';
import {
    ArrowRightIcon,
    MagnifyingGlassIcon,
    PlusIcon,
} from '@/Components/Icons';
import { confirmDelete } from '@/Utils/confirmDelete';

export default function Index({ endorsements, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEndorsement, setSelectedEndorsement] = useState(null);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    const handleCreate = () => {
        setSelectedEndorsement(null);
        setIsModalOpen(true);
    };

    const handleEdit = (endorsement) => {
        setSelectedEndorsement(endorsement);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        confirmDelete({
            message: 'Are you sure you want to delete this endorsement?',
            onConfirm: () => {
            router.delete(route('endorsements.destroy', id));
            },
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('endorsements.index'), {
            search: searchTerm,
        }, {
            preserveState: true,
        });
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEndorsement(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Endorsements" />

            <div>
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Endorsements</h1>
                        <p className="mt-2 text-gray-600">Manage endorsements</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleCreate}
                        className="flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: '#20A4AC' }}
                    >
                        <PlusIcon className="h-5 w-5" />
                        New Endorsement
                    </button>
                </div>

                <div className="mb-6 flex w-full justify-end">
                    <form
                        onSubmit={handleSearch}
                        className="flex max-w-full flex-wrap items-center justify-end gap-2"
                    >
                        <div className="relative min-w-0 w-full max-w-md md:w-96">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) =>
                                    e.key === 'Enter' && handleSearch(e)
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-[#20A4AC] focus:outline-none"
                            />
                        </div>
                        <button
                            type="submit"
                            className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50 focus:border-[#20A4AC] focus:outline-none"
                            title="Search"
                            aria-label="Search"
                        >
                            <MagnifyingGlassIcon className="h-5 w-5" />
                        </button>
                    </form>
                </div>

                <EndorsementTable
                    endorsements={endorsements}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />

                {endorsements.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-medium">{endorsements.from}</span> to{' '}
                            <span className="font-medium">{endorsements.to}</span> of{' '}
                            <span className="font-medium">{endorsements.total}</span> endorsements
                        </div>
                        <div className="flex gap-2">
                            {endorsements.prev_page_url && (
                                <a
                                    href={endorsements.prev_page_url}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    <ArrowRightIcon
                                        className="h-4 w-4 rotate-180"
                                        aria-hidden
                                    />
                                    Previous
                                </a>
                            )}
                            {endorsements.next_page_url && (
                                <a
                                    href={endorsements.next_page_url}
                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Next
                                    <ArrowRightIcon
                                        className="h-4 w-4"
                                        aria-hidden
                                    />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                <EndorsementModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    endorsement={selectedEndorsement}
                />
            </div>
        </AuthenticatedLayout>
    );
}

