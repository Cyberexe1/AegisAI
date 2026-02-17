import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import HumanInLoopPanel from '../../components/dashboard/HumanInLoopPanel';
import { FileText, Download, Filter } from 'lucide-react';

const GovernancePage = () => {
    return (
        <DashboardLayout>
            <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Governance Audit Logs</h1>
                        <p className="text-secondary mt-1">Complete immutable record of all system decisions and overrides.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-secondary font-medium hover:bg-gray-50 transition-colors">
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                        </button>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-green-900 transition-colors shadow-lg shadow-primary/20">
                            <Download className="w-4 h-4" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-slate-50 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-primary font-bold">
                            <FileText className="w-5 h-5" />
                            <h3>Master Log Record</h3>
                        </div>
                        <div className="text-xs text-secondary font-mono">
                            ID: LOG-2024-X992
                        </div>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                        {/* Reuse the internal table logic or enhance it here. For now, embedding the panel which fits well */}
                        <HumanInLoopPanel />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default GovernancePage;
