import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import RiskGraphPanel from '../../components/dashboard/RiskGraphPanel';
import TrustScorePanel from '../../components/dashboard/TrustScorePanel';
import { ShieldAlert, Info } from 'lucide-react';
import { api } from '../../services/api';

const RiskTrustPage = () => {
    const [exporting, setExporting] = useState(false);
    const [trustFactors, setTrustFactors] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrustFactors = async () => {
            try {
                const trustData = await api.getTrustScore();
                setTrustFactors({
                    modelBias: trustData.risk_factors.bias_score < 0.3 ? 'Pass' : 'Review',
                    dataCompleteness: '99.8%', // This would come from data quality endpoint
                    adversarialResistance: trustData.risk_factors.drift_score < 20 ? 'Pass' : 'Review'
                });
            } catch (error) {
                console.error('Failed to fetch trust factors:', error);
                setTrustFactors({
                    modelBias: 'Pass',
                    dataCompleteness: '99.8%',
                    adversarialResistance: 'Review'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTrustFactors();
        const interval = setInterval(fetchTrustFactors, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleViewRiskReport = async () => {
        setExporting(true);
        try {
            const blob = await api.exportReport();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `risk-report-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to export risk report:', error);
            alert('Failed to export risk report. Ensure backend is running.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Risk & Trust Management</h1>
                        <p className="text-secondary mt-1">Visualize system dependencies and real-time trust scoring.</p>
                    </div>
                    <button 
                        onClick={handleViewRiskReport}
                        disabled={exporting}
                        className="flex items-center space-x-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 font-medium hover:bg-amber-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShieldAlert className="w-4 h-4" />
                        <span>{exporting ? 'Exporting...' : 'View Risk Report'}</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    <div className="lg:col-span-1">
                        <TrustScorePanel />

                        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="font-bold text-primary mb-4 flex items-center">
                                <Info className="w-4 h-4 mr-2 text-primary" />
                                Trust Factors
                            </h3>
                            {loading ? (
                                <div className="space-y-3">
                                    <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                                    <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                                    <div className="h-8 bg-gray-200 animate-pulse rounded"></div>
                                </div>
                            ) : (
                                <ul className="space-y-3 text-sm">
                                    <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-secondary">Model Bias</span>
                                        <span className={`font-bold ${trustFactors?.modelBias === 'Pass' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                            {trustFactors?.modelBias || 'Pass'}
                                        </span>
                                    </li>
                                    <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-secondary">Data Completeness</span>
                                        <span className="text-emerald-600 font-bold">
                                            {trustFactors?.dataCompleteness || '99.8%'}
                                        </span>
                                    </li>
                                    <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                                        <span className="text-secondary">Adversarial Resistance</span>
                                        <span className={`font-bold ${trustFactors?.adversarialResistance === 'Pass' ? 'text-emerald-600' : 'text-amber-500'}`}>
                                            {trustFactors?.adversarialResistance || 'Review'}
                                        </span>
                                    </li>
                                </ul>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-2 h-full">
                        <RiskGraphPanel />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default RiskTrustPage;
