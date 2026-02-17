import { useState, useEffect } from 'react';
import { UserCheck, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';

const HumanInLoopPanel = () => {
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIncidents = async () => {
            try {
                const data = await api.getIncidents('all');
                setIncidents(data.incidents || []);
            } catch (error) {
                console.error('Failed to fetch incidents:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchIncidents();
        const interval = setInterval(fetchIncidents, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex items-center justify-center shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                        <UserCheck className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-primary">Governance Incidents</h2>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                    {incidents.length} total
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar pr-2">
                {incidents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
                        <p className="text-sm font-medium text-gray-600">No incidents recorded</p>
                        <p className="text-xs text-gray-400 mt-1">System is operating normally</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs font-bold text-gray-400 border-b border-gray-100 uppercase tracking-wider">
                                <th className="py-3 font-semibold">Type</th>
                                <th className="py-3 font-semibold">Severity</th>
                                <th className="py-3 font-semibold">Time</th>
                                <th className="py-3 font-semibold text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {incidents.slice(0, 10).map((incident) => (
                                <tr key={incident._id} className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors group">
                                    <td className="py-3 pr-2 font-semibold text-primary group-hover:text-black">
                                        {incident.type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown'}
                                    </td>
                                    <td className="py-3 pr-2">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                                            incident.severity === 'high' ? 'bg-red-50 text-red-600' :
                                            incident.severity === 'medium' ? 'bg-amber-50 text-amber-600' :
                                            'bg-blue-50 text-blue-600'
                                        }`}>
                                            {incident.severity}
                                        </span>
                                    </td>
                                    <td className="py-3 pr-2 text-gray-400 text-xs font-medium">
                                        {formatTime(incident.detected_at)}
                                    </td>
                                    <td className="py-3 pl-2 text-right">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                            incident.status === 'resolved'
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                            {incident.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <button 
                onClick={() => window.location.href = '/dashboard/governance'}
                className="mt-4 w-full py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-semibold text-secondary transition-colors shadow-sm"
            >
                View Full Incident Log
            </button>
        </div>
    );
};

export default HumanInLoopPanel;
