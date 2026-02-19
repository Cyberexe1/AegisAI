import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, DollarSign, Clock, CheckCircle, TrendingUp, Plus, XCircle, AlertCircle } from 'lucide-react';
import UserDashboardLayout from '../layouts/UserDashboardLayout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [loans, setLoans] = useState<any>(null);
    const [stats, setStats] = useState({
        totalBorrowed: 0,
        activeLoans: 0,
        creditScore: 750
    });

    useEffect(() => {
        if (user?.email) {
            fetchUserLoans();
        }
    }, [user]);

    const fetchUserLoans = async () => {
        try {
            setLoading(true);
            const response = await api.getUserLoans(user!.email);
            
            if (response.success) {
                setLoans(response.data);
                
                // Calculate stats from ongoing and completed loans
                const ongoing = response.data.loans.ongoing || [];
                const completed = response.data.loans.completed || [];
                const allApproved = [...ongoing, ...completed];
                
                const totalBorrowed = allApproved.reduce((sum: number, loan: any) => sum + loan.loanAmount, 0);
                
                // Get credit score from the most recent loan or use default
                const creditScore = allApproved.length > 0 ? allApproved[0].creditScore : 750;
                
                setStats({
                    totalBorrowed,
                    activeLoans: ongoing.length,
                    creditScore
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
            <div className="space-y-6 md:space-y-8 max-w-6xl mx-auto p-4 md:p-0">
                {/* Welcome Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-primary">Welcome back, User</h1>
                        <p className="text-sm md:text-base text-secondary mt-1">Manage your loans and financial health</p>
                    </div>
                    <button
                        onClick={() => navigate('/user-dashboard/apply')}
                        className="flex items-center justify-center space-x-2 px-4 md:px-6 py-2 md:py-3 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20 transition-all transform hover:scale-105 w-full sm:w-auto"
                    >
                        <Plus className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="font-semibold text-sm md:text-base">Apply for New Loan</span>
                    </button>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3 md:space-x-4">
                        <div className="p-2 md:p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                            <DollarSign className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs md:text-sm text-gray-500 font-medium">Total Borrowed</p>
                            <h3 className="text-xl md:text-2xl font-bold text-primary truncate">${stats.totalBorrowed.toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3 md:space-x-4">
                        <div className="p-2 md:p-3 bg-green-50 text-green-600 rounded-xl flex-shrink-0">
                            <CreditCard className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs md:text-sm text-gray-500 font-medium">Approved Loans</p>
                            <h3 className="text-xl md:text-2xl font-bold text-primary">{stats.activeLoans}</h3>
                        </div>
                    </div>
                    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-3 md:space-x-4 sm:col-span-2 lg:col-span-1">
                        <div className="p-2 md:p-3 bg-purple-50 text-purple-600 rounded-xl flex-shrink-0">
                            <TrendingUp className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs md:text-sm text-gray-500 font-medium">Credit Score</p>
                            <h3 className="text-xl md:text-2xl font-bold text-primary">{stats.creditScore}</h3>
                        </div>
                    </div>
                </div>

                {/* Ongoing Loans Section */}
                {loans?.loans?.ongoing && loans.loans.ongoing.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-base md:text-lg font-bold text-primary">Active Loans</h2>
                                <p className="text-xs md:text-sm text-gray-500 mt-1">{loans.ongoing} loans active</p>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {loans.loans.ongoing.map((loan: any) => (
                                <div key={loan.id} className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                                        <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                                            <TrendingUp className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-primary text-sm md:text-base truncate">{loan.loanPurpose}</h3>
                                            <p className="text-xs md:text-sm text-gray-500">
                                                EMI: ${loan.monthlyEMI?.toLocaleString()} | Next Due: {new Date(loan.nextDueDate).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Paid: {loan.paidEMIs}/{loan.tenure} EMIs
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                                        <p className="font-bold text-primary text-base md:text-lg">${loan.loanAmount.toLocaleString()}</p>
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                                            Active
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
                        <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-base md:text-lg font-bold text-primary">Pending Review</h2>
                                <p className="text-xs md:text-sm text-gray-500 mt-1">{loans.pending} applications under review</p>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {loans.loans.pending.map((loan: any) => (
                                <div key={loan.id} className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-3 md:space-x-4 min-w-0">
                                        <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                                            <AlertCircle className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-semibold text-primary text-sm md:text-base truncate">{loan.loanPurpose}</h3>
                                            <p className="text-xs md:text-sm text-gray-500">
                                                Applied: {new Date(loan.applicationDate).toLocaleDateString()}
                                            </p>
                                            {loan.mlPrediction && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    ML Confidence: {(loan.mlPrediction.confidence * 100).toFixed(0)}%
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                                        <p className="font-bold text-primary text-base md:text-lg">${loan.loanAmount.toLocaleString()}</p>
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                            Pending
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Applications History */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-gray-100">
                        <h2 className="text-base md:text-lg font-bold text-primary">Application History</h2>
                        <p className="text-xs md:text-sm text-gray-500 mt-1">
                            {loans?.total_applications || 0} total applications
                        </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {loans?.loans?.all && loans.loans.all.length > 0 ? (
                            loans.loans.all.slice(0, 10).map((loan: any) => (
                                <div key={loan.id} className="p-4 md:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors gap-3">
                                    <div className="flex items-center space-x-3 md:space-x-4 min-w-0 flex-1">
                                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                                            loan.status === 'ongoing' ? 'bg-blue-100' :
                                            loan.status === 'completed' ? 'bg-green-100' :
                                            loan.status === 'rejected' ? 'bg-red-100' :
                                            'bg-amber-100'
                                        }`}>
                                            {loan.status === 'ongoing' && <TrendingUp className="w-5 h-5 text-blue-600" />}
                                            {loan.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                            {loan.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                                            {loan.status === 'pending' && <AlertCircle className="w-5 h-5 text-amber-600" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-medium text-primary text-sm md:text-base truncate">{loan.loanPurpose}</h3>
                                            <p className="text-xs md:text-sm text-gray-500">
                                                {new Date(loan.applicationDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:space-x-4 flex-shrink-0">
                                        <span className="font-medium text-gray-900 text-sm md:text-base whitespace-nowrap">${loan.loanAmount.toLocaleString()}</span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                            loan.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                                            loan.status === 'completed' ? 'bg-green-100 text-green-700' :
                                            loan.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 md:p-12 text-center">
                                <Clock className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm md:text-base text-gray-500">No loan applications yet</p>
                                <button
                                    onClick={() => navigate('/user-dashboard/apply')}
                                    className="mt-4 px-4 md:px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm md:text-base"
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
