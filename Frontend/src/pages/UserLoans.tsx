import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, Calendar, DollarSign, TrendingUp } from 'lucide-react';
import UserDashboardLayout from '../layouts/UserDashboardLayout';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserLoans = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [loans, setLoans] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'completed' | 'pending' | 'rejected'>('all');

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
            case 'ongoing':
                return loans.loans.ongoing || [];
            case 'completed':
                return loans.loans.completed || [];
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
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                                <p className="text-sm text-gray-500 font-medium">Ongoing</p>
                                <h3 className="text-2xl font-bold text-blue-600 mt-1">{loans?.ongoing || 0}</h3>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Completed</p>
                                <h3 className="text-2xl font-bold text-green-600 mt-1">{loans?.completed || 0}</h3>
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
                                onClick={() => setActiveTab('ongoing')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'ongoing'
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Ongoing ({loans?.ongoing || 0})
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                                    activeTab === 'completed'
                                        ? 'border-green-600 text-green-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Completed ({loans?.completed || 0})
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
                                            
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-primary">{loan.loanPurpose}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                        loan.status === 'ongoing' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                        loan.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' :
                                                        loan.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                        'bg-amber-100 text-amber-700 border-amber-200'
                                                    }`}>
                                                        {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Amount</p>
                                                        <p className="font-semibold text-primary">${loan.loanAmount.toLocaleString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Applied Date</p>
                                                        <p className="font-medium text-gray-700 flex items-center">
                                                            <Calendar className="w-3 h-3 mr-1" />
                                                            {new Date(loan.applicationDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    {loan.monthlyEMI && (
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Monthly EMI</p>
                                                            <p className="font-medium text-gray-700">${loan.monthlyEMI.toLocaleString()}</p>
                                                        </div>
                                                    )}
                                                    {loan.tenure && (
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Tenure</p>
                                                            <p className="font-medium text-gray-700">{loan.tenure} months</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {loan.status === 'ongoing' && (
                                                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                        <div className="grid grid-cols-3 gap-4 text-xs">
                                                            <div>
                                                                <p className="text-blue-600 font-medium">Paid EMIs</p>
                                                                <p className="text-blue-800 font-bold">{loan.paidEMIs}/{loan.tenure}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-blue-600 font-medium">Next Due</p>
                                                                <p className="text-blue-800 font-bold">{new Date(loan.nextDueDate).toLocaleDateString()}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-blue-600 font-medium">Interest Rate</p>
                                                                <p className="text-blue-800 font-bold">{loan.interestRate}%</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {loan.status === 'completed' && (
                                                    <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                        <p className="text-xs text-green-800">
                                                            <strong>Completed on:</strong> {new Date(loan.completionDate).toLocaleDateString()} - All EMIs paid successfully
                                                        </p>
                                                    </div>
                                                )}

                                                {loan.status === 'pending' && loan.mlPrediction && (
                                                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                        <p className="text-xs text-amber-800">
                                                            <strong>ML Prediction:</strong> {(loan.mlPrediction.confidence * 100).toFixed(0)}% confidence - Your application is under review
                                                        </p>
                                                    </div>
                                                )}

                                                {loan.status === 'rejected' && (
                                                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                                        <p className="text-xs text-red-800">
                                                            <strong>Reason:</strong> {loan.rejectionReason || 'Application did not meet approval criteria'}
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
