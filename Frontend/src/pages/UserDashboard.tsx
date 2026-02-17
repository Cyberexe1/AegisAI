import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, DollarSign, Clock, CheckCircle, TrendingUp, Plus } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';

const UserDashboard = () => {
    const navigate = useNavigate();

    // Mock Data for User Loans
    const activeLoans = [
        { id: 1, type: 'Personal Loan', amount: 5000, status: 'Active', nextPayment: '2024-03-15', remaining: 3200 },
        { id: 2, type: 'Auto Loan', amount: 15000, status: 'Active', nextPayment: '2024-03-20', remaining: 12500 },
    ];

    const recentApplications = [
        { id: 101, date: '2024-01-10', amount: 20000, status: 'Approved', type: 'Home Improvement' },
        { id: 102, date: '2023-11-05', amount: 5000, status: 'Rejected', type: 'Personal' },
    ];

    return (
        <DashboardLayout>
            <div className="space-y-8 max-w-6xl mx-auto">
                {/* Welcome Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-primary">Welcome back, User</h1>
                        <p className="text-secondary mt-1">Manage your loans and financial health</p>
                    </div>
                    <button
                        onClick={() => navigate('/user-dashboard/apply')}
                        className="flex items-center space-x-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:scale-105"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-semibold">Apply for New Loan</span>
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <DollarSign className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Borrowed</p>
                            <h3 className="text-2xl font-bold text-primary">$20,000</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <CreditCard className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Active Loans</p>
                            <h3 className="text-2xl font-bold text-primary">2</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Credit Score</p>
                            <h3 className="text-2xl font-bold text-primary">720</h3>
                        </div>
                    </div>
                </div>

                {/* Active Loans Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-primary">Active Loans</h2>
                        <button className="text-sm text-primary font-medium hover:underline">View All</button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {activeLoans.map((loan) => (
                            <div key={loan.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-primary">{loan.type}</h3>
                                        <p className="text-sm text-gray-500">Next Pay: {loan.nextPayment}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary">${loan.remaining.toLocaleString()}</p>
                                    <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded inline-block mt-1">{loan.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Applications Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-primary">Application History</h2>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {recentApplications.map((app) => (
                            <div key={app.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div>
                                    <h3 className="font-medium text-primary">{app.type} Loan</h3>
                                    <p className="text-sm text-gray-500">{app.date}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="font-medium text-gray-900">${app.amount.toLocaleString()}</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default UserDashboard;
