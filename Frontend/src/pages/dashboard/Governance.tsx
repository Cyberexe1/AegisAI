import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import HumanInLoopPanel from '../../components/dashboard/HumanInLoopPanel';
import { FileText, Download, Filter } from 'lucide-react';
import { api } from '../../services/api';

const GovernancePage = () => {
    const [showFilter, setShowFilter] = useState(false);
    const [filters, setFilters] = useState({
        type: 'all',
        severity: 'all',
        status: 'all'
    });
    const [exporting, setExporting] = useState(false);

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            // Get incidents from API
            const data = await api.getIncidents('all');
            const incidents = data.incidents || [];

            // Convert to CSV
            const headers = ['Type', 'Severity', 'Status', 'Detected At', 'Description'];
            const rows = incidents.map(inc => [
                inc.type || '',
                inc.severity || '',
                inc.status || '',
                inc.detected_at || '',
                inc.description || ''
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `governance-logs-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to export CSV:', error);
            alert('Failed to export CSV. Ensure backend is running.');
        } finally {
            setExporting(false);
        }
    };

    const handleApplyFilters = () => {
        setShowFilter(false);
        // Filters will be passed to HumanInLoopPanel via props
        console.log('Applying filters:', filters);
    };

    return (
        <DashboardLayout>
            <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">Governance Audit Logs</h1>
                        <p className="text-secondary mt-1">Complete immutable record of all system decisions and overrides.</p>
                    </div>
                    <div className="flex space-x-3">
                        <div className="relative">
                            <button 
                                onClick={() => setShowFilter(!showFilter)}
                                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-secondary font-medium hover:bg-gray-50 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                <span>Filter</span>
                            </button>

                            {showFilter && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 p-4">
                                    <h3 className="font-bold text-primary mb-3">Filter Incidents</h3>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">Type</label>
                                            <select 
                                                value={filters.type}
                                                onChange={(e) => setFilters({...filters, type: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="all">All Types</option>
                                                <option value="drift_detected">Drift Detected</option>
                                                <option value="bias_detected">Bias Detected</option>
                                                <option value="accuracy_drop">Accuracy Drop</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">Severity</label>
                                            <select 
                                                value={filters.severity}
                                                onChange={(e) => setFilters({...filters, severity: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="all">All Severities</option>
                                                <option value="high">High</option>
                                                <option value="medium">Medium</option>
                                                <option value="low">Low</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs text-gray-600 mb-1 block">Status</label>
                                            <select 
                                                value={filters.status}
                                                onChange={(e) => setFilters({...filters, status: e.target.value})}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                            >
                                                <option value="all">All Statuses</option>
                                                <option value="active">Active</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                        </div>

                                        <button 
                                            onClick={handleApplyFilters}
                                            className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-green-900 transition-colors"
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={handleExportCSV}
                            disabled={exporting}
                            className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-green-900 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" />
                            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
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
