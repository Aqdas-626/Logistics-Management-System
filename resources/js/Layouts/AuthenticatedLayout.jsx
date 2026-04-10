import Header from '@/Components/Layout/Header';
import Sidebar from '@/Components/Layout/Sidebar';
import Footer from '@/Components/Layout/Footer';
import { SidebarProvider, useSidebar } from '@/Context/SidebarContext';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function LayoutContent({ children, header }) {
    const { isOpen } = useSidebar();
    const { flash } = usePage().props;
    const shownMessagesRef = useRef({ success: null, error: null });

    useEffect(() => {
        if (flash?.success && shownMessagesRef.current.success !== flash.success) {
            toast.success(flash.success);
            shownMessagesRef.current.success = flash.success;
        }

        if (flash?.error && shownMessagesRef.current.error !== flash.error) {
            toast.error(flash.error);
            shownMessagesRef.current.error = flash.error;
        }
    }, [flash?.success, flash?.error]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header />

            {/* Main container with sidebar */}
            <div className="flex min-w-0">
                {/* Sidebar */}
                <Sidebar />

                {/* Main content — min-w-0 so wide tables scroll inside the column, not the whole page */}
                <main className={`min-w-0 flex min-h-screen flex-1 flex-col pt-20 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
                    <div className="min-w-0 max-w-full flex-1 p-8">
                        {header ? (
                            <div className="mb-6">{header}</div>
                        ) : null}
                        {children}
                    </div>

                    {/* Footer */}
                    <Footer />
                </main>
            </div>
            <ToastContainer position="top-right" autoClose={3000} newestOnTop closeOnClick pauseOnHover />
        </div>
    );
}

export default function AuthenticatedLayout({ children, header }) {
    return (
        <SidebarProvider>
            <LayoutContent header={header}>
                {children}
            </LayoutContent>
        </SidebarProvider>
    );
}
