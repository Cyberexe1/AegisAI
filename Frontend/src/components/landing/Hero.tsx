import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, ShieldCheck, Lock, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <div className="relative min-h-screen flex items-center justify-center pt-24 pb-24 overflow-hidden bg-background">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] rounded-full bg-accent/20 blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50rem] h-[50rem] rounded-full bg-green-100 blur-[100px]" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-8"
                >
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-sm text-primary font-medium shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>System Operational v2.4</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-primary">
                        Unified AI <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">
                            Governance Control
                        </span>
                    </h1>

                    <p className="text-xl text-secondary max-w-xl leading-relaxed">
                        Continuously monitor, evaluate, and regulate ML & LLM systems in high-risk financial environments.
                        Transform passive observability into enforceable autonomy.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/dashboard"
                            className="group flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-primary text-white font-semibold hover:bg-green-900 transition-all shadow-xl shadow-green-900/20"
                        >
                            <span>View Dashboard</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <button className="flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors font-medium text-primary shadow-sm hover:shadow-md">
                            <PlayCircle className="w-5 h-5" />
                            <span>Watch Demo</span>
                        </button>
                    </div>

                    <div className="pt-8 grid grid-cols-3 gap-8 border-t border-gray-200/60">
                        <div>
                            <p className="text-3xl font-bold text-primary">99.9%</p>
                            <p className="text-sm text-secondary">Uptime Guaranteed</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-primary">50ms</p>
                            <p className="text-sm text-secondary">Latency Check</p>
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-primary">ISO</p>
                            <p className="text-sm text-secondary">27001 Certified</p>
                        </div>
                    </div>
                </motion.div>

                {/* Visual / Graph Placeholder - Dashboard Mockup */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative lg:block"
                >
                    <div className="relative z-10 rounded-2xl bg-primary p-2 shadow-2xl shadow-green-900/40 rotate-1 hover:rotate-0 transition-transform duration-500">
                        {/* Simple Navbar Mockup inside the card */}
                        <div className="bg-white rounded-xl overflow-hidden min-h-[500px] flex flex-col">
                            <div className="h-10 border-b border-gray-100 flex items-center px-4 space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>

                            <div className="flex-1 p-6 bg-slate-50 relative overflow-hidden">
                                {/* Mock Content */}
                                <div className="absolute top-10 right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl"></div>

                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <h3 className="text-sm font-semibold text-secondary uppercase tracking-widest mb-1">Total Assets managed</h3>
                                        <p className="text-4xl font-bold text-primary">$220,320.60</p>
                                    </div>
                                    <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 text-sm font-medium text-emerald-600">
                                        +4.6% this week
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-primary text-white p-4 rounded-xl shadow-lg relative overflow-hidden">
                                        <div className="relative z-10">
                                            <p className="text-white/60 text-sm mb-1">Trust Score</p>
                                            <p className="text-3xl font-bold">98/100</p>
                                        </div>
                                        <ShieldCheck className="absolute bottom-2 right-2 w-16 h-16 text-white/10" />
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                                        <Activity className="w-8 h-8 text-secondary mb-2" />
                                        <p className="text-primary font-bold">System Healthy</p>
                                    </div>
                                </div>

                                {/* Decorative List */}
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center justify-between pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-100"></div>
                                                <div className="w-24 h-3 bg-gray-100 rounded"></div>
                                            </div>
                                            <div className="w-12 h-3 bg-gray-100 rounded"></div>
                                        </div>
                                    ))}
                                </div>

                                {/* Trust Badge Floating */}
                                <div className="absolute bottom-6 right-6 bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100 flex items-center space-x-3 animate-bounce">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-sm font-medium text-primary">Governance Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
