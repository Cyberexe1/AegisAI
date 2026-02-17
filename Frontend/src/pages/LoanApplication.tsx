import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { api, PredictionInput, PredictionResponse } from '../services/api';
import { Calculator, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

const LoanApplication = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PredictionResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState<PredictionInput>({
        income: 75000,
        age: 35,
        loan_amount: 200000,
        credit_history: 720,
        employment_type: 'full-time',
        existing_debts: 15000,
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
        setResult(null);

        try {
            const prediction = await api.predict(formData);
            setResult(prediction);
        } catch (err) {
            setError('Failed to get risk assessment. Please ensure the backend is running.');
            console.error('Prediction error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (category: string) => {
        switch (category.toLowerCase()) {
            case 'low': return 'text-green-600 bg-green-50 border-green-200';
            case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Loan Risk Assessment</h1>
                        <p className="text-secondary mt-1">Get instant credit risk evaluation powered by AI</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Application Form */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 rounded-lg bg-green-50 text-primary">
                                <Calculator className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-primary">Application Details</h2>
                                <p className="text-xs text-gray-500">Enter applicant information</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Annual Income ($)
                                </label>
                                <input
                                    type="number"
                                    name="income"
                                    value={formData.income}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Age
                                </label>
                                <input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                    min="18"
                                    max="100"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loan Amount ($)
                                </label>
                                <input
                                    type="number"
                                    name="loan_amount"
                                    value={formData.loan_amount}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Credit Score
                                </label>
                                <input
                                    type="number"
                                    name="credit_history"
                                    value={formData.credit_history}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                    min="300"
                                    max="850"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Employment Type
                                </label>
                                <select
                                    name="employment_type"
                                    value={formData.employment_type}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                >
                                    <option value="full-time">Full-Time</option>
                                    <option value="part-time">Part-Time</option>
                                    <option value="self-employed">Self-Employed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Existing Debts ($)
                                </label>
                                <input
                                    type="number"
                                    name="existing_debts"
                                    value={formData.existing_debts}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                    required
                                    min="0"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3 bg-primary hover:bg-green-900 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Analyzing...' : 'Get Risk Assessment'}
                            </button>
                        </form>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Results Display */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-primary">Risk Assessment Results</h2>
                                <p className="text-xs text-gray-500">AI-powered credit evaluation</p>
                            </div>
                        </div>

                        {!result && !loading && (
                            <div className="flex flex-col items-center justify-center h-64 text-center">
                                <Calculator className="w-16 h-16 text-gray-300 mb-4" />
                                <p className="text-gray-500">Submit the form to see risk assessment</p>
                            </div>
                        )}

                        {loading && (
                            <div className="flex flex-col items-center justify-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                                <p className="text-gray-500 mt-4">Analyzing application...</p>
                            </div>
                        )}

                        {result && (
                            <div className="space-y-6">
                                {/* Risk Score Gauge */}
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-gray-100 relative">
                                        <div className="text-center">
                                            <div className="text-4xl font-bold font-mono text-primary">
                                                {(result.risk_score * 100).toFixed(0)}
                                            </div>
                                            <div className="text-xs text-gray-500 font-medium">RISK SCORE</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Risk Category Badge */}
                                <div className="flex justify-center">
                                    <div className={`px-6 py-3 rounded-lg border-2 font-bold text-lg ${getRiskColor(result.risk_category)}`}>
                                        {result.risk_category.toUpperCase()} RISK
                                    </div>
                                </div>

                                {/* Key Metrics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="text-xs text-gray-500 mb-1">Approval Probability</div>
                                        <div className="text-2xl font-bold text-primary">
                                            {(result.approval_probability * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="text-xs text-gray-500 mb-1">Confidence</div>
                                        <div className="text-2xl font-bold text-primary">
                                            {(result.confidence * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Info */}
                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Model Version:</span>
                                        <span className="font-mono font-medium text-primary">{result.model_version}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Processing Time:</span>
                                        <span className="font-mono font-medium text-primary">{result.processing_time_ms.toFixed(0)}ms</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Timestamp:</span>
                                        <span className="font-mono text-xs text-gray-600">
                                            {new Date(result.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Recommendation */}
                                <div className={`p-4 rounded-lg border-2 ${result.approval_probability > 0.7
                                    ? 'bg-green-50 border-green-200'
                                    : result.approval_probability > 0.4
                                        ? 'bg-amber-50 border-amber-200'
                                        : 'bg-red-50 border-red-200'
                                    }`}>
                                    <div className="flex items-start space-x-2">
                                        {result.approval_probability > 0.7 ? (
                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${result.approval_probability > 0.4 ? 'text-amber-600' : 'text-red-600'
                                                }`} />
                                        )}
                                        <div>
                                            <div className={`font-semibold text-sm ${result.approval_probability > 0.7
                                                ? 'text-green-700'
                                                : result.approval_probability > 0.4
                                                    ? 'text-amber-700'
                                                    : 'text-red-700'
                                                }`}>
                                                {result.approval_probability > 0.7
                                                    ? 'Recommended for Approval'
                                                    : result.approval_probability > 0.4
                                                        ? 'Manual Review Required'
                                                        : 'High Risk - Additional Verification Needed'}
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {result.approval_probability > 0.7
                                                    ? 'Application shows strong creditworthiness indicators.'
                                                    : result.approval_probability > 0.4
                                                        ? 'Application requires human review before final decision.'
                                                        : 'Significant risk factors detected. Consider alternative products or additional collateral.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default LoanApplication;
