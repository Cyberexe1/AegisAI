import { useState } from 'react';
import {
    Home,
    CreditCard,
    FileText,
    User,
    LogOut,
    Bell,
    Menu,
    X,
    ShieldCheck
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

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

const UserDashboardLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        // Clear any user session data
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/user-dashboard' },
        { icon: CreditCard, label: 'My Loans', path: '/user-dashboard/loans' },
        { icon: FileText, label: 'Apply for Loan', path: '/user-dashboard/apply' },
        { icon: User, label: 'Profile', path: '/user-dashboard/profile' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-secondary flex">
            {/* Mobile Menu Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary text-white rounded-lg shadow-lg"
            >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Sidebar - Dark Green */}
            <aside className={`w-64 bg-primary flex flex-col fixed h-full z-40 shadow-xl transition-transform duration-300 ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}>
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

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 bg-slate-50">
                {/* Header - White */}
                <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-20 flex items-center justify-between px-8 shadow-sm">
                    <div className="flex items-center text-sm font-medium">
                        <span className="text-gray-400 mr-2">User Portal</span>
                        <span className="text-gray-300 mx-2">/</span>
                        <span className="text-primary font-bold">
                            {location.pathname === '/user-dashboard' && 'Dashboard'}
                            {location.pathname === '/user-dashboard/loans' && 'My Loans'}
                            {location.pathname === '/user-dashboard/apply' && 'Apply for Loan'}
                            {location.pathname === '/user-dashboard/profile' && 'Profile'}
                        </span>
                    </div>

                    <div className="flex items-center space-x-6">
                        <button className="relative p-2 text-gray-400 hover:text-primary transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="flex items-center space-x-3 pl-6 border-l border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold ring-2 ring-accent/50">
                                U
                            </div>
                            <div className="text-sm">
                                <div className="font-bold text-primary">User</div>
                                <div className="text-xs text-gray-500">Customer</div>
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

export default UserDashboardLayout;
