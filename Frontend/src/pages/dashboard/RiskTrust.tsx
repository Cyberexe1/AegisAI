import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import RiskGraphPanel from '../../components/dashboard/RiskGraphPanel';
import TrustScorePanel from '../../components/dashboard/TrustScorePanel';
import { ShieldAlert, Info } from 'lucide-react';

const RiskTrustPage = () => {
    return (
        <DashboardLayout>
            <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Risk & Trust Management</h1>
                        <p className="text-secondary mt-1">Visualize system dependencies and real-time trust scoring.</p>
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 font-medium hover:bg-amber-100 transition-colors">
                        <ShieldAlert className="w-4 h-4" />
                        <span>View Risk Report</span>
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
                            <ul className="space-y-3 text-sm">
                                <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                                    <span className="text-secondary">Model Bias</span>
                                    <span className="text-emerald-600 font-bold">Pass</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                                    <span className="text-secondary">Data Completeness</span>
                                    <span className="text-emerald-600 font-bold">99.8%</span>
                                </li>
                                <li className="flex justify-between items-center border-b border-gray-50 pb-2">
                                    <span className="text-secondary">Adversarial Resistance</span>
                                    <span className="text-amber-500 font-bold">Review</span>
                                </li>
                            </ul>
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
