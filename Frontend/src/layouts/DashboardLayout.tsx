import React from 'react';
import {
    LayoutDashboard,
    Activity,
    ShieldAlert,
    FileText,
    Settings,
    LogOut,
    Bell,
    Search,
    ShieldCheck,
    MessageSquare,
    Menu,
    X
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AIChat from '../components/dashboard/AIChat';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }: { icon: any, label: string, path: string, active: boolean, onClick?: () => void }) => (
    <Link
        to={path}
        onClick={onClick}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${active
            ? 'bg-accent text-primary shadow-lg shadow-black/10 font-bold'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
            }`}
    >
        <Icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
        <span className="font-medium">{label}</span>
    </Link>
);

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [notifications] = React.useState([
        { id: 1, title: 'High drift detected', message: 'Income feature showing significant drift', time: '5m ago', read: false },
        { id: 2, title: 'Trust score updated', message: 'Trust score decreased to 67', time: '15m ago', read: false },
        { id: 3, title: 'New incident created', message: 'Bias detected in credit_history', time: '1h ago', read: true },
        { id: 4, title: 'Model accuracy drop', message: 'Accuracy dropped from 95% to 87%', time: '2h ago', read: true },
    ]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
        { icon: Activity, label: 'Model Health', path: '/dashboard/health' },
        { icon: ShieldAlert, label: 'Risk & Trust', path: '/dashboard/risk' },
        { icon: MessageSquare, label: 'LLM Observability', path: '/dashboard/llm' },
        { icon: FileText, label: 'Governance Logs', path: '/dashboard/governance' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-secondary flex">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar - Dark Green */}
            <aside className={`
                w-64 bg-primary flex flex-col fixed h-full z-40 shadow-xl
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
            `}>
                {/* Close button for mobile */}
                <button
                    onClick={closeSidebar}
                    className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-lg lg:hidden"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 flex items-center space-x-2 border-b border-white/5">
                    <div className="p-1 bg-accent rounded text-primary">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">AegisAI</span>
                </div>

                <div className="p-4 space-y-2 flex-1 overflow-y-auto no-scrollbar">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            {...item}
                            active={location.pathname === item.path}
                            onClick={closeSidebar}
                        />
                    ))}
                </div>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={() => {
                            handleLogout();
                            closeSidebar();
                        }}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/5 w-full transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 bg-slate-50 w-full">
                {/* Header - White */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 shadow-sm">
                    <div className="flex items-center space-x-4">
                        {/* Hamburger Menu Button */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        <div className="hidden md:flex items-center text-sm font-medium">
                            <span className="text-gray-400 mr-2">Banking Control Plane</span>
                            <span className="text-gray-300 mx-2">/</span>
                            <span className="text-primary font-bold">Main Dashboard</span>
                        </div>
                        
                        {/* Mobile: Just show logo/title */}
                        <div className="md:hidden flex items-center space-x-2">
                            <div className="p-1 bg-primary rounded">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-primary">AegisAI</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-6">
                        {/* Search - Hidden on mobile */}
                        <div className="relative group hidden md:block">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search models, logs..."
                                className="bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 w-48 lg:w-64 transition-all"
                            />
                        </div>

                        {/* Notification Bell */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-400 hover:text-primary transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                                        <h3 className="font-bold text-primary">Notifications</h3>
                                        <span className="text-xs text-gray-500">
                                            {notifications.filter(n => !n.read).length} unread
                                        </span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.map(notif => (
                                            <div 
                                                key={notif.id}
                                                className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-blue-50' : ''}`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-semibold text-sm text-primary">{notif.title}</h4>
                                                    <span className="text-xs text-gray-400">{notif.time}</span>
                                                </div>
                                                <p className="text-xs text-gray-600">{notif.message}</p>
                                                {!notif.read && (
                                                    <span className="inline-block mt-2 text-xs text-blue-600 font-semibold">New</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-3 border-t border-gray-200 text-center">
                                        <button className="text-xs text-primary font-semibold hover:underline">
                                            View All Notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile - Hidden on small mobile */}
                        <div className="hidden sm:flex items-center space-x-3 pl-4 md:pl-6 border-l border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold ring-2 ring-accent/50">
                                AD
                            </div>
                            <div className="text-sm hidden md:block">
                                <div className="font-bold text-primary">Admin User</div>
                                <div className="text-xs text-gray-500">Security Level 1</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* AI Chat Component */}
            <AIChat />
        </div>
    );
};

export default DashboardLayout;
