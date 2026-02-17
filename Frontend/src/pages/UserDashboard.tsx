import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, DollarSign, Clock, CheckCircle, TrendingUp, Plus, XCircle, AlertCircle } from 'lucide-react';
import UserDashboardLayout from '../layouts/UserDashboardLayout';
import { api } from '../services/api';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [loans, setLoans] = useState<any>(null);
    const [stats, setStats] = useState({
        totalBorrowed: 0,
        activeLoans: 0,
        creditScore: 720
    });

    // For demo purposes, using a default user ID
    // In production, this would come from authentication context
    const userId = 'demo-user-001';

    useEffect(() => {
        fetchUserLoans();
    }, []);

    const fetchUserLoans = async () => {
        try {
            setLoading(true);
            const response = await api.getUserLoans(userId);
            
            if (response.success) {
                setLoans(response.data);
                
                // Calculate stats
                const approved = response.data.loans.approved || [];
                const totalBorrowed = approved.reduce((sum: number, loan: any) => sum + loan.amount, 0);
                
                setStats({
                    totalBorrowed,
                    activeLoans: approved.length,
                    creditScore: 720 // This would come from a credit scoring service
                });
            }
        } catch (error) {
            console.error('Failed to fetch user loans:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'Rejected':
                return <XCircle className="w-5 h-5 text-red-600" />;
            case 'Pending':
                return <AlertCircle className="w-5 h-5 text-amber-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'bg-green-100 text-green-700';
            case 'Rejected':
                return 'bg-red-100 text-red-700';
            case 'Pending':
                return 'bg-amber-100 text-amber-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <UserDashboardLayout>
                <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                </div>
            </UserDashboardLayout>
        );
    }

    return (
        <UserDashboardLayout>
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
                            <h3 className="text-2xl font-bold text-primary">${stats.totalBorrowed.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                            <CreditCard className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Approved Loans</p>
                            <h3 className="text-2xl font-bold text-primary">{stats.activeLoans}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Credit Score</p>
                            <h3 className="text-2xl font-bold text-primary">{stats.creditScore}</h3>
                        </div>
                    </div>
                </div>

                {/* Approved Loans Section */}
                {loans?.loans?.approved && loans.loans.approved.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-primary">Approved Loans</h2>
                                <p className="text-sm text-gray-500 mt-1">{loans.approved} loans approved</p>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {loans.loans.approved.map((loan: any) => (
                                <div key={loan.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            {getStatusIcon(loan.status)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-primary">{loan.loan_type}</h3>
                                            <p className="text-sm text-gray-500">
                                                Applied: {new Date(loan.applied_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Risk Score: {loan.risk_score.toFixed(1)} | 
                                                Confidence: {(loan.confidence * 100).toFixed(0)}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary text-lg">${loan.amount.toLocaleString()}</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${getStatusColor(loan.status)}`}>
                                            {loan.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pending Loans Section */}
                {loans?.loans?.pending && loans.loans.pending.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-primary">Pending Review</h2>
                                <p className="text-sm text-gray-500 mt-1">{loans.pending} applications under review</p>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {loans.loans.pending.map((loan: any) => (
                                <div key={loan.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-amber-100 rounded-lg">
                                            {getStatusIcon(loan.status)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-primary">{loan.loan_type}</h3>
                                            <p className="text-sm text-gray-500">
                                                Applied: {new Date(loan.applied_date).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Risk Score: {loan.risk_score.toFixed(1)} | 
                                                Approval Probability: {(loan.approval_probability * 100).toFixed(0)}%
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-primary text-lg">${loan.amount.toLocaleString()}</p>
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 ${getStatusColor(loan.status)}`}>
                                            {loan.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Applications History */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-primary">Application History</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {loans?.total_applications || 0} total applications
                        </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {loans?.loans?.all && loans.loans.all.length > 0 ? (
                            loans.loans.all.slice(0, 10).map((loan: any) => (
                                <div key={loan.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-4">
                                        <div className={`p-2 rounded-lg ${
                                            loan.status === 'Approved' ? 'bg-green-100' :
                                            loan.status === 'Rejected' ? 'bg-red-100' :
                                            'bg-amber-100'
                                        }`}>
                                            {getStatusIcon(loan.status)}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-primary">{loan.loan_type}</h3>
                                            <p className="text-sm text-gray-500">
                                                {new Date(loan.applied_date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className="font-medium text-gray-900">${loan.amount.toLocaleString()}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(loan.status)}`}>
                                            {loan.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No loan applications yet</p>
                                <button
                                    onClick={() => navigate('/user-dashboard/apply')}
                                    className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Apply for Your First Loan
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UserDashboardLayout>
    );
};

export default UserDashboard;
