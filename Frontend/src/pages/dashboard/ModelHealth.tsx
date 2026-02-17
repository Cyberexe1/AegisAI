import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import ModelHealthPanel from '../../components/dashboard/ModelHealthPanel';
import DriftMonitorPanel from '../../components/dashboard/DriftMonitorPanel';
import { Activity, Server, Database, Clock } from 'lucide-react';

const MetricCard = ({ icon: Icon, label, value, trend }: any) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
        <div>
            <p className="text-secondary text-sm font-medium mb-1">{label}</p>
            <h3 className="text-2xl font-bold text-primary">{value}</h3>
        </div>
        <div className="flex flex-col items-end">
            <div className="p-2 bg-slate-50 rounded-lg text-primary mb-2">
                <Icon className="w-6 h-6" />
            </div>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${trend === 'good' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {trend === 'good' ? '+2.4%' : '-1.1%'}
            </span>
        </div>
    </div>
);

const ModelHealthPage = () => {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Model Health & Performance</h1>
                    <p className="text-secondary mt-1">Deep dive into ML model metrics and system latency.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard icon={Activity} label="Accuracy" value="98.4%" trend="good" />
                    <MetricCard icon={Clock} label="Avg Latency" value="42ms" trend="good" />
                    <MetricCard icon={Server} label="Throughput" value="1.2k req/s" trend="good" />
                    <MetricCard icon={Database} label="Data Quality" value="99.9%" trend="good" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-96">
                    <ModelHealthPanel />
                    <DriftMonitorPanel />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ModelHealthPage;
