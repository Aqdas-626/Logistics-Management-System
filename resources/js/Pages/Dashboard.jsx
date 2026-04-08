import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import StatCard from '@/Components/Dashboard/StatCard';
import RevenueCard from '@/Components/Dashboard/RevenueCard';
import RecentJobsCard from '@/Components/Dashboard/RecentJobsCard';
import QuickActionsCard from '@/Components/Dashboard/QuickActionsCard';
import RecentActivitiesCard from '@/Components/Dashboard/RecentActivitiesCard';
import {
    BriefcaseIcon,
    UserGroupIcon,
    TruckIcon,
    CurrencyDollarIcon,
    CheckCircleIcon,
    ClockIcon,
} from '@/Components/Icons';

export default function Dashboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div>
                {/* Page header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-gray-600">Welcome back! Here's what's happening in your logistics business today.</p>
                </div>

                {/* Stats Grid - 3x2 */}
                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <StatCard
                        icon={BriefcaseIcon}
                        label="Total Jobs"
                        value="0"
                        change="12%"
                        isPositive={true}
                        color="blue"
                    />
                    <StatCard
                        icon={UserGroupIcon}
                        label="Active Drivers"
                        value="0"
                        change="8%"
                        isPositive={true}
                        color="green"
                    />
                    <StatCard
                        icon={TruckIcon}
                        label="Pending Dispatches"
                        value="0"
                        change="5%"
                        isPositive={false}
                        color="yellow"
                    />
                    <StatCard
                        icon={CurrencyDollarIcon}
                        label="Today's Deliveries"
                        value="0"
                        change="23%"
                        isPositive={true}
                        color="purple"
                    />
                    <StatCard
                        icon={CheckCircleIcon}
                        label="Completed Jobs"
                        value="0"
                        change="3%"
                        isPositive={true}
                        color="pink"
                    />
                    <StatCard
                        icon={ClockIcon}
                        label="Open Invoices"
                        value="0"
                        change="0%"
                        isPositive={true}
                        color="blue"
                    />
                </div>

                {/* Revenue Section - 3 columns */}
                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <RevenueCard
                        title="Revenue Today"
                        amount="$0.00"
                        period="Last 24 hours"
                        icon={CurrencyDollarIcon}
                        color="green"
                    />
                    <RevenueCard
                        title="Revenue This Week"
                        amount="$0.00"
                        period="Last 7 days"
                        icon={ClockIcon}
                        color="blue"
                    />
                    <RevenueCard
                        title="Revenue This Month"
                        amount="$0.00"
                        period="Current month"
                        icon={CheckCircleIcon}
                        color="orange"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left side - Recent Jobs (takes 2 columns) */}
                    <div className="lg:col-span-2">
                        <RecentJobsCard jobs={[]} />
                    </div>

                    {/* Right side - Quick Actions */}
                    <div>
                        <QuickActionsCard />
                    </div>
                </div>

                {/* Activities Section */}
                <div className="mt-8">
                    <RecentActivitiesCard />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
