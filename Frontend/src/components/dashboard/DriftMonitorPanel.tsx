import { useState, useEffect } from 'react';
import { GitCompare, AlertCircle, TrendingUp } from 'lucide-react';
import { api, DriftResult } from '../../services/api';

const DriftMonitorPanel = () => {
    const [driftData, setDriftData] = useState<DriftResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDrift = async () => {
            try {
                const data = await api.getDrift();
                setDriftData(data.drift_results || []);
                setError(null);
            } catch (error) {
                console.error('Failed to fetch drift data:', error);
                setError('Failed to load drift data');
                setDriftData([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDrift();
        const interval = setInterval(fetchDrift, 15000); // Update every 15s
        return () => clearInterval(interval);
    }, []);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high': return 'text-red-600 bg-red-50 border-red-200';
            case 'moderate': return 'text-amber-600 bg-amber-50 border-amber-200';
            default: return 'text-green-600 bg-green-50 border-green-200';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'high': return '🔴';
            case 'moderate': return '🟡';
            default: return '🟢';
        }
    };

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex items-center justify-center shadow-sm">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <div className="text-sm text-gray-500">Loading drift data...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex items-center justify-center shadow-sm">
                <div className="text-center text-gray-500">
                    <GitCompare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">{error}</div>
                    <div className="text-xs mt-1">Make sure the API is running</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                        <GitCompare className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-primary">Data Drift Monitor</h2>
                </div>
                <div className="text-xs text-gray-500 font-medium">PSI & KS Test</div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3">
                {driftData.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <div className="text-sm">No drift data available</div>
                        <div className="text-xs mt-1">Run predictions to see drift analysis</div>
                    </div>
                ) : (
                    driftData.map((drift) => (
                        <div key={drift.feature} className="border border-gray-100 rounded-lg p-3 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-semibold text-primary capitalize flex items-center gap-2">
                                        {getSeverityIcon(drift.severity)}
                                        {drift.feature}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        PSI: {drift.psi_score.toFixed(3)} | p-value: {drift.p_value.toFixed(3)}
                                    </div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded font-bold border ${getSeverityColor(drift.severity)}`}>
                                    {drift.severity.toUpperCase()}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                    <span className="text-gray-500">Training μ:</span>
                                    <span className="ml-1 font-mono font-bold text-primary">
                                        {drift.distribution_comparison.training_mean.toFixed(0)}
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                    <span className="text-gray-500">Current μ:</span>
                                    <span className="ml-1 font-mono font-bold text-primary">
                                        {drift.distribution_comparison.current_mean.toFixed(0)}
                                    </span>
                                </div>
                            </div>

                            {drift.drift_detected && (
                                <div className="mt-2 flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Drift Detected - Distribution has changed significantly
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {driftData.length > 0 && (
                <div className="mt-4 flex items-center justify-center space-x-6 text-xs font-medium text-secondary bg-slate-50 py-2 rounded-lg border border-slate-100">
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
                        Low (PSI &lt; 0.1)
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-amber-500 rounded-full mr-2" />
                        Moderate (0.1-0.2)
                    </div>
                    <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
                        High (&gt; 0.2)
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriftMonitorPanel;
