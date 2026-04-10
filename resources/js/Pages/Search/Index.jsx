import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Index({ q = '', sections = [], total = 0 }) {
    return (
        <AuthenticatedLayout>
            <Head title="Search" />

            <div>
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
                    <p className="mt-2 text-gray-600">
                        Query: <span className="font-semibold text-gray-800">{q || '-'}</span> ({total} matches)
                    </p>
                </div>

                {!q ? (
                    <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-md">
                        Type something in the header search to find records.
                    </div>
                ) : sections.length === 0 ? (
                    <div className="rounded-xl bg-white p-10 text-center text-gray-500 shadow-md">
                        No results found for <span className="font-semibold text-gray-700">{q}</span>.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {sections.map((section) => (
                            <div key={section.key} className="overflow-hidden rounded-xl bg-white shadow-md">
                                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                                    <h2 className="text-lg font-semibold text-gray-800">{section.title}</h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {section.items.map((item) => (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            className="block px-6 py-4 transition hover:bg-[#20A4AC]/5"
                                        >
                                            <p className="font-semibold text-[#178089]">{item.title}</p>
                                            <p className="text-sm text-gray-600">{item.subtitle}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
