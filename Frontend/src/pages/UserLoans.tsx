import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import UserDashboardLayout from '../layouts/UserDashboardLayout';
import { api } from '../services/api';

const UserLoans = () => {
    const [loading, setLoading] = useState(true);
    const [loans, setLoans] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

    // For demo purposes, using a default user ID
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
                return 'bg-green-100 text-green-700 border-green-200';
            case 'Rejected':
                return 'bg-red-100 text-red-700 border-red-200';
            case 'Pending':
                return 'bg-amber-100 text-amber-700 border-amber-200';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getLoansToDisplay = () => {
        if (!loans?.loans) return [];
        
        switch (activeTab) {
            case 'approved':
                return loans.loans.approved || [];
            case 'pending':
                return loans.loans.pending || [];
            case 'rejected':
                return loans.loans.rejected || [];
            default:
                return loans.loans.all || [];
        }
    };

    const displayedLoans = getLoansToDisplay();

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
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-primary">My Loans</h1>
                    <p className="text-secondary mt-1">View and manage your loan applications</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Applications</p>
                                <h3 className="text-2xl font-bold text-primary mt-1">{loans?.total_applications || 0}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <DollarSign className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Approved</p>
                                <h3 className="text-2xl font-bold text-green-600 mt-1">{loans?.approved || 0}</h3>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Pending</p>
                                <h3 className="text-2xl font-bold text-amber-600 mt-1">{loans?.pending || 0}</h3>
                            </div>
                            <div className="p-3 bg-amber-50 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Rejected</p>
                                <h3 className="text-2xl font-bold text-red-600 mt-1">{loans?.rejected || 0}</h3>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'all'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                All Loans ({loans?.total_applications || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('approved')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'approved'
                                        ? 'border-green-600 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Approved ({loans?.approved || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('pending')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'pending'
                                        ? 'border-amber-600 text-amber-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Pending ({loans?.pending || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('rejected')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'rejected'
                                        ? 'border-red-600 text-red-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Rejected ({loans?.rejected || 0})
                            </button>
                        </div>
                    </div>

                    {/* Loans List */}
                    <div className="divide-y divide-gray-100">
                        {displayedLoans.length > 0 ? (
                            displayedLoans.map((loan: any) => (
                                <div key={loan.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4 flex-1">
                                            <div className={`p-3 rounded-lg ${
                                                loan.status === 'Approved' ? 'bg-green-100' :
                                                loan.status === 'Rejected' ? 'bg-red-100' :
                                                'bg-amber-100'
                                            }`}>
                                                {getStatusIcon(loan.status)}
                                            </div>
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-primary">{loan.loan_type}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(loan.status)}`}>
                                                        {loan.status}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Amount</p>
                                                        <p className="font-semibold text-primary">${loan.amount.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Applied Date</p>
                                                        <p className="font-medium text-gray-700 flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            {new Date(loan.applied_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Risk Score</p>
                                                        <p className="font-medium text-gray-700">{loan.risk_score.toFixed(1)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Confidence</p>
                                                        <p className="font-medium text-gray-700 flex items-center">
                                                            <TrendingUp className="w-3 h-3 mr-1" />
                                                            {(loan.confidence * 100).toFixed(0)}%
                                                        </p>
                                                    </div>
                                                </div>

                                                {loan.status === 'Pending' && (
                                                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                        <p className="text-xs text-amber-800">
                                                            <strong>Approval Probability:</strong> {(loan.approval_probability * 100).toFixed(0)}% - Your application is under review
                                                        </p>
                                                    </div>
                                                )}

                                                {loan.status === 'Rejected' && (
                                                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                                        <p className="text-xs text-red-800">
                                                            <strong>Reason:</strong> High risk score ({loan.risk_score.toFixed(1)}). Consider improving your credit history or reducing loan amount.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No loans in this category</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UserDashboardLayout>
    );
};

export default UserLoans;
