import { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import ModelHealthPanel from '../components/dashboard/ModelHealthPanel';
import TrustScorePanel from '../components/dashboard/TrustScorePanel';
import RiskGraphPanel from '../components/dashboard/RiskGraphPanel';
import DriftMonitorPanel from '../components/dashboard/DriftMonitorPanel';
import HumanInLoopPanel from '../components/dashboard/HumanInLoopPanel';
import SimulationControls from '../components/dashboard/SimulationControls';
import { api } from '../services/api';

const Dashboard = () => {
    const [simulatingIncident, setSimulatingIncident] = useState(false);
    const [exportingReport, setExportingReport] = useState(false);

    const handleExportReport = async () => {
        setExportingReport(true);
        try {
            const blob = await api.exportReport();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `governance-report-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to export report:', error);
            alert('Failed to export report. Ensure backend is running.');
        } finally {
            setExportingReport(false);
        }
    };

    const handleSimulateIncident = async () => {
        setSimulatingIncident(true);
        try {
            await api.simulateIncident();
            alert('Incident simulated successfully! Trust score will update.');
        } catch (error) {
            console.error('Failed to simulate incident:', error);
            alert('Failed to simulate incident. Ensure backend is running.');
        } finally {
            setSimulatingIncident(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-4 md:space-y-6 p-4 md:p-0">
                {/* Header with Export/Simulate buttons */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-primary">System Overview</h1>
                        <p className="text-sm md:text-base text-secondary mt-1">Real-time governance and risk monitoring</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                        <button
                            onClick={handleExportReport}
                            disabled={exportingReport}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-secondary hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                            {exportingReport ? 'Exporting...' : 'Export Report'}
                        </button>
                        <button
                            onClick={handleSimulateIncident}
                            disabled={simulatingIncident}
                            className="px-4 py-2 bg-primary hover:bg-green-900 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                            {simulatingIncident ? 'Simulating...' : 'Simulate Incident'}
                        </button>
                    </div>
                </div>

                {/* Simulation Controls */}
                <SimulationControls />

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Trust Score - Priority */}
                    <div className="md:col-span-2 lg:col-span-1 h-80 md:h-96">
                        <TrustScorePanel />
                    </div>

                    {/* Risk Graph - Central Visual */}
                    <div className="md:col-span-2 lg:col-span-2 h-80 md:h-96">
                        <RiskGraphPanel />
                    </div>

                    {/* Model Health */}
                    <div className="md:col-span-1 lg:col-span-1 h-72 md:h-80">
                        <ModelHealthPanel />
                    </div>

                    {/* Drift Monitor */}
                    <div className="md:col-span-1 lg:col-span-2 h-72 md:h-80">
                        <DriftMonitorPanel />
                    </div>

                    {/* HITL Log */}
                    <div className="md:col-span-2 lg:col-span-3 h-80 md:h-96">
                        <HumanInLoopPanel />
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
