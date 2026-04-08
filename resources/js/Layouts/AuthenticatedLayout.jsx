import Header from '@/Components/Layout/Header';
import Sidebar from '@/Components/Layout/Sidebar';
import Footer from '@/Components/Layout/Footer';
import { SidebarProvider, useSidebar } from '@/Context/SidebarContext';

function LayoutContent({ children, header }) {
    const { isOpen } = useSidebar();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header />

            {/* Main container with sidebar */}
            <div className="flex min-w-0 pt-20">
                {/* Sidebar */}
                <Sidebar />

                {/* Main content — min-w-0 so wide tables scroll inside the column, not the whole page */}
                <main className={`min-w-0 flex-1 transition-all duration-300 ${isOpen ? 'ml-64' : 'ml-20'}`}>
                    <div className="min-w-0 max-w-full p-8">
                        {header ? (
                            <div className="mb-6">{header}</div>
                        ) : null}
                        {children}
                    </div>
                    
                    {/* Footer */}
                    <Footer />
                </main>
            </div>
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
