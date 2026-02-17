import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserDashboardLayout from '../layouts/UserDashboardLayout';
import { api, PredictionInput, PredictionResponse } from '../services/api';
import { Calculator, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const UserLoanApply = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [accepting, setAccepting] = useState(false);
    const [result, setResult] = useState<PredictionResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    // For demo purposes, using a default user ID
    const userId = 'demo-user-001';

    const [formData, setFormData] = useState<PredictionInput>({
        income: 60000,
        age: 30,
        loan_amount: 15000,
        credit_history: 'Good',  // Changed to string
        employment_type: 'Full-time',  // Capitalized to match backend enum
        existing_debts: 5000,
    });

    // Store credit score separately for display
    const [creditScore, setCreditScore] = useState(700);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        // Handle credit score separately
        if (name === 'credit_score') {
            const score = parseFloat(value) || 300;
            setCreditScore(score);
            
            // Convert credit score to credit history category
            let creditHistory = 'Poor';
            if (score >= 700) {
                creditHistory = 'Good';
            } else if (score >= 600) {
                creditHistory = 'Fair';
            }
            
            setFormData(prev => ({
                ...prev,
                credit_history: creditHistory
            }));
            return;
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: ['income', 'age', 'loan_amount', 'existing_debts'].includes(name)
                ? parseFloat(value) || 0
                : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Add user_id to the prediction request
            const predictionData = {
                ...formData,
                user_id: userId
            };
            
            const prediction = await api.predict(predictionData);
            setResult(prediction);
            setStep(2); // Move to result step
        } catch (err) {
            setError('Application processing failed. Please try again.');
            console.error('Prediction error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOffer = async () => {
        setAccepting(true);
        try {
            // Simulate accepting the offer
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Show success message
            alert('Congratulations! Your loan has been approved and will be processed within 24 hours.');
            
            // Navigate back to dashboard
            navigate('/user-dashboard');
        } catch (err) {
            alert('Failed to accept offer. Please try again.');
        } finally {
            setAccepting(false);
        }
    };

    return (
        <UserDashboardLayout>
            <div className="max-w-3xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-primary">Apply for a Personal Loan</h1>
                    <p className="text-secondary mt-2">Get an instant decision in seconds</p>
                </div>

                {step === 1 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Annual Income ($)</label>
                                    <input
                                        type="number"
                                        name="income"
                                        value={formData.income}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Loan Amount ($)</label>
                                    <input
                                        type="number"
                                        name="loan_amount"
                                        value={formData.loan_amount}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Employment</label>
                                    <select
                                        name="employment_type"
                                        value={formData.employment_type}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    >
                                        <option value="Full-time">Full-Time</option>
                                        <option value="Part-time">Part-Time</option>
                                        <option value="Self-employed">Self-Employed</option>
                                        <option value="Unemployed">Unemployed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Credit Score (Estimate)</label>
                                    <input
                                        type="number"
                                        name="credit_score"
                                        value={creditScore}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        required
                                        min="300"
                                        max="850"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {creditScore >= 700 ? '✓ Good' : creditScore >= 600 ? '⚠ Fair' : '✗ Poor'} credit history
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Existing Debts ($)</label>
                                    <input
                                        type="number"
                                        name="existing_debts"
                                        value={formData.existing_debts}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Check Eligibility</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-red-800 text-sm font-medium">{error}</p>
                                </div>
                            )}
                        </form>
                    </div>
                )}

                {step === 2 && result && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className={`p-8 text-center ${result.approval_probability > 0.6 ? 'bg-green-50' : 'bg-red-50'
                            }`}>
                            <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 ${result.approval_probability > 0.6 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                {result.approval_probability > 0.6 ? (
                                    <CheckCircle className="w-12 h-12" />
                                ) : (
                                    <AlertCircle className="w-12 h-12" />
                                )}
                            </div>
                            <h2 className={`text-3xl font-bold mb-2 ${result.approval_probability > 0.6 ? 'text-green-800' : 'text-red-800'
                                }`}>
                                {result.approval_probability > 0.6 ? 'Congratulations!' : 'Application Declined'}
                            </h2>
                            <p className="text-gray-600 max-w-lg mx-auto">
                                {result.approval_probability > 0.6
                                    ? `Your loan application for $${formData.loan_amount.toLocaleString()} has been pre-approved based on your profile.`
                                    : 'Based on your current financial profile, we cannot approve your loan at this time.'}
                            </p>
                        </div>

                        <div className="p-8">
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="text-sm text-gray-500 mb-1">Loan Amount</div>
                                    <div className="text-xl font-bold text-primary">${formData.loan_amount.toLocaleString()}</div>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <div className="text-sm text-gray-500 mb-1">Interest Rate</div>
                                    <div className="text-xl font-bold text-primary">
                                        {result.approval_probability > 0.8 ? '5.9%' : '8.5%'}
                                    </div>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setResult(null);
                                        setError(null);
                                    }}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                >
                                    {result.approval_probability > 0.6 ? 'Back to Dashboard' : 'Try Again'}
                                </button>
                                {result.approval_probability > 0.6 ? (
                                    <button 
                                        onClick={handleAcceptOffer}
                                        disabled={accepting}
                                        className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                                    >
                                        {accepting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <span>Accept Offer</span>
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate('/user-dashboard')}
                                        className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all"
                                    >
                                        Back to Dashboard
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </UserDashboardLayout>
    );
};

export default UserLoanApply;
