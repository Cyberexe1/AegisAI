import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { api, PredictionInput, PredictionResponse } from '../services/api';
import { Calculator, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

const UserLoanApply = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PredictionResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<PredictionInput>({
        income: 60000,
        age: 30,
        loan_amount: 15000,
        credit_history: 700,
        employment_type: 'full-time',
        existing_debts: 5000,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ['income', 'age', 'loan_amount', 'credit_history', 'existing_debts'].includes(name)
                ? parseFloat(value) || 0
                : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Simulate API delay for better UX
            await new Promise(resolve => setTimeout(resolve, 1500));
            const prediction = await api.predict(formData);
            setResult(prediction);
            setStep(2); // Move to result step
        } catch (err) {
            setError('Application processing failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
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
                                        <option value="full-time">Full-Time</option>
                                        <option value="part-time">Part-Time</option>
                                        <option value="self-employed">Self-Employed</option>
                                        <option value="unemployed">Unemployed</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Credit Score (Estimate)</label>
                                    <input
                                        type="number"
                                        name="credit_history"
                                        value={formData.credit_history}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                        required
                                        min="300"
                                        max="850"
                                    />
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
                                className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-lg shadow-xl shadow-primary/20 transition-all flex items-center justify-center space-x-2"
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
                                    onClick={() => navigate('/user-dashboard')}
                                    className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                                >
                                    Back to Dashboard
                                </button>
                                {result.approval_probability > 0.6 && (
                                    <button className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold shadow-lg shadow-primary/20 transition-all">
                                        Accept Offer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default UserLoanApply;
