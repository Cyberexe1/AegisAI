import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { api, TrustScore } from '../../services/api';

const TrustScorePanel = () => {
    const [trustData, setTrustData] = useState<TrustScore | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrustScore = async () => {
            try {
                const data = await api.getTrustScore();
                setTrustData(data);
            } catch (error) {
                console.error('Failed to fetch trust score:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrustScore();
        const interval = setInterval(fetchTrustScore, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading || !trustData) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    const score = trustData.trust_score;
    const data = [
        { name: 'Score', value: score },
        { name: 'Remaining', value: 100 - score },
    ];

    // Color logic
    const getColor = (s: number) => {
        // Use theme colors
        if (s >= 90) return '#10b981'; // Green
        if (s >= 70) return '#11231f'; // Primary Dark Green (instead of blue)
        if (s >= 50) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    const color = getColor(score);

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col relative overflow-hidden shadow-sm">
            {/* Background glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[80px] opacity-10 pointer-events-none"
                style={{ backgroundColor: color }}
            />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-primary">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Trust Engine
                    </h2>
                    <div className="px-2.5 py-0.5 rounded-full bg-green-50 border border-green-100 text-xs font-bold text-emerald-700 animate-pulse">
                        LIVE
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                startAngle={180}
                                endAngle={0}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={0}
                                dataKey="value"
                                stroke="none"
                            >
                                <Cell key="cell-0" fill={color} />
                                <Cell key="cell-1" fill="#f1f5f9" />
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                    <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-5xl font-bold font-mono text-primary">{score}</div>
                        <div className="text-xs font-bold text-gray-400 mt-1 tracking-wider">TRUST SCORE</div>
                    </div>
                </div>

                <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-secondary font-medium">Autonomy Level</span>
                        <span className="text-primary font-bold px-2 py-0.5 rounded bg-accent text-xs">
                            {trustData.autonomy_level.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                            ).join('-')}
                        </span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-gray-400 border-b border-dashed border-gray-200 pb-1">
                            <span>Risk Factors</span>
                            <span>Contribution</span>
                        </div>
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-secondary">Data Drift</span>
                            <span className={`px-1.5 py-0.5 rounded ${
                                trustData.contributing_metrics.drift_severity === 'high' ? 'text-red-500 bg-red-50' :
                                trustData.contributing_metrics.drift_severity === 'moderate' ? 'text-amber-500 bg-amber-50' :
                                'text-emerald-600 bg-emerald-50'
                            }`}>
                                {trustData.contributing_metrics.drift_severity?.charAt(0).toUpperCase() + 
                                 trustData.contributing_metrics.drift_severity?.slice(1) || 'Low'}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-secondary">Model Uncertainty</span>
                            <span className={`px-1.5 py-0.5 rounded ${
                                trustData.risk_factors.accuracy_drop > 0.05 ? 'text-red-500 bg-red-50' :
                                trustData.risk_factors.accuracy_drop > 0.02 ? 'text-amber-500 bg-amber-50' :
                                'text-emerald-600 bg-emerald-50'
                            }`}>
                                {trustData.risk_factors.accuracy_drop > 0.05 ? 'High' :
                                 trustData.risk_factors.accuracy_drop > 0.02 ? 'Moderate' : 'Low'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrustScorePanel;
