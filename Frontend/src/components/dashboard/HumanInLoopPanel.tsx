import React from 'react';
import { UserCheck, Clock, AlertOctagon, CheckCircle } from 'lucide-react';

const interventions = [
    { id: 1, action: 'Override: Block Transaction', user: 'Admin_Lead', time: '10:42 AM', status: 'Resolved' },
    { id: 2, action: 'Approve: Credit Limit', user: 'Risk_Analyst', time: '09:15 AM', status: 'Approved' },
    { id: 3, action: 'Flag: Drift Anomaly', user: 'System_Sentinel', time: '08:30 AM', status: 'Pending' },
    { id: 4, action: 'Review: Fraud Alert', user: 'Fraud_team', time: 'Yesterday', status: 'Resolved' },
];

const HumanInLoopPanel = () => {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
                <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                    <UserCheck className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold text-primary">Human Intervention Log</h2>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar pr-2">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs font-bold text-gray-400 border-b border-gray-100 uppercase tracking-wider">
                            <th className="py-3 font-semibold">Action</th>
                            <th className="py-3 font-semibold">User</th>
                            <th className="py-3 font-semibold">Time</th>
                            <th className="py-3 font-semibold text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {interventions.map((item) => (
                            <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors group">
                                <td className="py-3 pr-2 font-semibold text-primary group-hover:text-black">{item.action}</td>
                                <td className="py-3 pr-2 text-gray-500 font-medium">{item.user}</td>
                                <td className="py-3 pr-2 text-gray-400 text-xs font-medium">{item.time}</td>
                                <td className="py-3 pl-2 text-right">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${item.status === 'Resolved' || item.status === 'Approved'
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                            : 'bg-amber-50 text-amber-600 border-amber-100'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <button className="mt-4 w-full py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm font-semibold text-secondary transition-colors shadow-sm">
                View Full Audit Log
            </button>
        </div>
    );
};

export default HumanInLoopPanel;
