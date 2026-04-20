import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-semibold leading-tight text-gray-900">
                            Profile
                        </h2>
                        <p className="text-sm text-gray-600">
                            Manage your account settings
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-[#20A4AC]/10 px-6 py-4">
                            <h3 className="text-sm font-semibold text-[#178089]">
                                Profile Information
                            </h3>
                        </div>
                        <div className="p-6">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-100 bg-[#20A4AC]/10 px-6 py-4">
                            <h3 className="text-sm font-semibold text-[#178089]">
                                Security
                            </h3>
                        </div>
                        <div className="p-6">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-red-200 bg-white shadow-sm">
                        <div className="border-b border-red-100 bg-red-50 px-6 py-4">
                            <h3 className="text-sm font-semibold text-red-700">
                                Danger zone
                            </h3>
                        </div>
                        <div className="p-6">
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
