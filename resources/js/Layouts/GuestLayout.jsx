import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div className="flex w-full justify-center px-4">
                <Link
                    href="/"
                    className="flex items-center justify-center rounded-xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-[#20A4AC]"
                >
                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-xl sm:h-36 sm:w-36">
                        <img
                            src="/ralo-logistic-icon.png"
                            alt="Ralo Logistic"
                            className="h-full w-full object-contain"
                            draggable={false}
                        />
                    </div>
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
