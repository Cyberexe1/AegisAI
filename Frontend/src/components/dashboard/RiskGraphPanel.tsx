import React from 'react';
import { motion } from 'framer-motion';
import { Network, AlertTriangle, CheckCircle, Smartphone, Database, Server } from 'lucide-react';

const RiskGraphPanel = () => {
    // Simplified node representation for the demo
    const nodes = [
        { id: 'core', label: 'Core Banking', x: 50, y: 50, status: 'safe', icon: Database },
        { id: 'risk', label: 'Risk Engine', x: 30, y: 30, status: 'safe', icon: Server },
        { id: 'fraud', label: 'Fraud AI', x: 70, y: 30, status: 'warning', icon: AlertTriangle },
        { id: 'app', label: 'Mobile App', x: 50, y: 80, status: 'safe', icon: Smartphone },
        { id: 'gateway', label: 'Payment GW', x: 80, y: 60, status: 'safe', icon: Network },
        { id: 'auth', label: 'Auth Service', x: 20, y: 60, status: 'safe', icon: CheckCircle },
    ];

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 h-full flex flex-col overflow-hidden relative shadow-sm">
            <div className="flex items-center justify-between mb-4 z-10">
                <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
                        <Network className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-bold text-primary">Risk Propagation</h2>
                </div>
                <div className="flex items-center space-x-4 text-xs font-medium">
                    <span className="flex items-center text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2"></span>Safe</span>
                    <span className="flex items-center text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-2 shadow-sm shadow-amber-200"></span>At Risk</span>
                </div>
            </div>

            <div className="flex-1 relative border border-gray-100 rounded-xl bg-slate-50 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* SVG Layer for edges */}
                    <svg className="w-full h-full absolute inset-0 pointer-events-none">
                        <line x1="50%" y1="50%" x2="30%" y2="30%" stroke="#cbd5e1" strokeWidth="2" />
                        <line x1="50%" y1="50%" x2="70%" y2="30%" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4" className="animate-pulse" />
                        <line x1="50%" y1="50%" x2="50%" y2="80%" stroke="#cbd5e1" strokeWidth="2" />
                        <line x1="50%" y1="50%" x2="80%" y2="60%" stroke="#cbd5e1" strokeWidth="2" />
                        <line x1="50%" y1="50%" x2="20%" y2="60%" stroke="#cbd5e1" strokeWidth="2" />
                        {/* Connection between Fraud and Gateway */}
                        <line x1="70%" y1="30%" x2="80%" y2="60%" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2" />
                    </svg>

                    {/* Render Nodes */}
                    {nodes.map((node) => (
                        <motion.div
                            key={node.id}
                            className={`absolute flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all hover:scale-110 shadow-sm ${node.status === 'warning'
                                    ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-md shadow-amber-100'
                                    : 'bg-white border-gray-200 text-secondary hover:text-primary hover:border-gray-300'
                                }`}
                            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        >
                            <node.icon className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-bold whitespace-nowrap bg-white/80 px-1.5 py-0.5 rounded-full border border-gray-100">{node.label}</span>

                            {node.status === 'warning' && (
                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                </span>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="mt-4 text-xs font-medium text-secondary border-t border-gray-100 pt-3 bg-red-50/50 p-2 rounded-lg border border-red-100/50">
                <span className="text-red-500 font-bold uppercase tracking-wider mr-2">Alert:</span> Fraud AI module latency spike (+120ms). Impacting Payment Gateway throughput.
            </div>
        </div>
    );
};

export default RiskGraphPanel;
