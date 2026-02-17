import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, ArrowUpRight } from 'lucide-react';

const data = [
    { time: '09:00', accuracy: 98.2, latency: 45 },
    { time: '10:00', accuracy: 98.5, latency: 42 },
    { time: '11:00', accuracy: 98.1, latency: 48 },
    { time: '12:00', accuracy: 97.8, latency: 55 },
    { time: '13:00', accuracy: 98.3, latency: 44 },
    { time: '14:00', accuracy: 98.6, latency: 40 },
    { time: '15:00', accuracy: 98.4, latency: 43 },
];

const ModelHealthPanel = () => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-green-50 text-primary">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-primary">Model Health</h2>
                        <p className="text-xs text-gray-500">Credit Scoring Model v2.4</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-sm font-bold border border-emerald-100">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>98.4%</span>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    <div className="text-xs text-gray-400 mb-1 font-medium">Precision</div>
                    <div className="text-lg font-mono font-bold text-primary">0.96</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 mb-1 font-medium">Recall</div>
                    <div className="text-lg font-mono font-bold text-primary">0.94</div>
                </div>
                <div>
                    <div className="text-xs text-gray-400 mb-1 font-medium">F1 Score</div>
                    <div className="text-lg font-mono font-bold text-primary">0.95</div>
                </div>
            </div>
        </div>
    );
};

export default ModelHealthPanel;
