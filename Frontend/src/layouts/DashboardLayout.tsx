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
    ShieldCheck
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, path, active }: { icon: any, label: string, path: string, active: boolean }) => (
    <Link
        to={path}
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
        { icon: Activity, label: 'Model Health', path: '/dashboard/health' },
        { icon: ShieldAlert, label: 'Risk & Trust', path: '/dashboard/risk' },
        { icon: FileText, label: 'Governance Logs', path: '/dashboard/governance' },
        { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-secondary flex">
            {/* Sidebar - Dark Green */}
            <aside className="w-64 bg-primary flex flex-col fixed h-full z-20 shadow-xl">
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
                        />
                    ))}
                </div>

                <div className="p-4 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-white/5 w-full transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-64 bg-slate-50">
                {/* Header - White */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40 flex items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center text-sm font-medium">
                        <span className="text-gray-400 mr-2">Banking Control Plane</span>
                        <span className="text-gray-300 mx-2">/</span>
                        <span className="text-primary font-bold">Main Dashboard</span>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="relative group">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search models, logs..."
                                className="bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/10 w-64 transition-all"
                            />
                        </div>

                        <button className="relative p-2 text-gray-400 hover:text-primary transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="flex items-center space-x-3 pl-6 border-l border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold ring-2 ring-accent/50">
                                AD
                            </div>
                            <div className="text-sm">
                                <div className="font-bold text-primary">Admin User</div>
                                <div className="text-xs text-gray-500">Security Level 1</div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
