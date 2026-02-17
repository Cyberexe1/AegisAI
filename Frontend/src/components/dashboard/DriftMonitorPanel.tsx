import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GitCompare, AlertCircle } from 'lucide-react';

const data = [
    { range: '0-0.2', training: 15, production: 12 },
    { range: '0.2-0.4', training: 25, production: 20 },
    { range: '0.4-0.6', training: 30, production: 25 },
    { range: '0.6-0.8', training: 20, production: 28 }, // Drift here
    { range: '0.8-1.0', training: 10, production: 15 },
];

const DriftMonitorPanel = () => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                        <GitCompare className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-primary">Data Drift Monitor</h2>
                </div>
                <div className="flex items-center space-x-1 text-amber-600 text-xs bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100 font-bold">
                    <AlertCircle className="w-3 h-3" />
                    <span>PSI: 0.21 (Moderate)</span>
                </div>
            </div>

            <div className="flex-1 min-h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barGap={4}>
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <XAxis
                            dataKey="range"
                            stroke="#94a3b8"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Bar dataKey="training" fill="#11231f" radius={[4, 4, 0, 0]} name="Baseline (Training)" />
                        <Bar dataKey="production" fill="#bef264" radius={[4, 4, 0, 0]} name="Live Traffic" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-center space-x-6 text-xs font-medium text-secondary bg-slate-50 py-2 rounded-lg border border-slate-100">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-primary rounded-full mr-2" />
                    Baseline (Training)
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-accent rounded-full mr-2 border border-black/10" />
                    Live Production
                </div>
            </div>
        </div>
    );
};

export default DriftMonitorPanel;
