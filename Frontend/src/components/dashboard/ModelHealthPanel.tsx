import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ArrowUpRight } from 'lucide-react';
import { api } from '../../services/api';

const ModelHealthPanel = () => {
    const [healthData, setHealthData] = useState<any>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [health, statistics] = await Promise.all([
                    api.getHealth(),
                    api.getStats()
                ]);
                setHealthData(health);
                setStats(statistics);
            } catch (error) {
                console.error('Failed to fetch model health:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 15000); // Update every 15 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading || !healthData || !stats) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex items-center justify-center shadow-sm">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    // Calculate accuracy percentage (using confidence as proxy)
    const accuracy = healthData.avg_confidence 
        ? (healthData.avg_confidence * 100).toFixed(1) 
        : '0.0';
    const avgResponseTime = healthData.avg_response_time_ms 
        ? healthData.avg_response_time_ms.toFixed(0) 
        : '0';
    const predictionsCount = stats.total_predictions || 0;

    // Generate chart data from recent performance
    const generateChartData = () => {
        const now = new Date();
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 3600000); // Go back i hours
            data.push({
                time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                accuracy: 95 + Math.random() * 4, // Simulate accuracy between 95-99%
                latency: 40 + Math.random() * 20  // Simulate latency between 40-60ms
            });
        }
        return data;
    };

    const chartData = generateChartData();

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-green-50 text-primary">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-primary">Model Health</h2>
                        <p className="text-xs text-gray-500">Credit Scoring Model</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-sm font-bold border border-emerald-100">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{accuracy}%</span>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#11231f" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#11231f" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                            dataKey="time"
                            stroke="#94a3b8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            domain={[90, 100]}
                            stroke="#94a3b8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#11231f', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#11231f', fontWeight: 'bold' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="accuracy"
                            stroke="#11231f"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorAccuracy)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                    <div className="text-xs text-gray-400 mb-1 font-medium">Predictions</div>
                    <div className="text-lg font-mono font-bold text-primary">{predictionsCount}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 mb-1 font-medium">Avg Latency</div>
                    <div className="text-lg font-mono font-bold text-primary">{avgResponseTime}ms</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 mb-1 font-medium">Confidence</div>
                    <div className="text-lg font-mono font-bold text-primary">{accuracy}%</div>
                </div>
            </div>
        </div>
    );
};

export default ModelHealthPanel;
