import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Bell, Shield, Save } from 'lucide-react';

const SettingsPage = () => {
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-primary">Settings</h1>
                    <p className="text-secondary mt-1">Manage your account and system preferences.</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex items-center space-x-4 bg-slate-50/50">
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold ring-4 ring-emerald-500/20">
                            AD
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-primary">Admin User</h2>
                            <p className="text-secondary text-sm">vikastiwari1045@gmail.com</p>
                            <div className="flex items-center mt-2 space-x-2">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 uppercase tracking-wide">Active</span>
                                <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-100 uppercase tracking-wide">Super Admin</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-10">
                        {/* Section 1 */}
                        <div>
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-primary">Notifications</h3>
                            </div>

                            <div className="space-y-4 pl-12">
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary transition-colors cursor-pointer" />
                                    <span className="text-secondary group-hover:text-primary transition-colors">Email alerts for critical risk events</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <input type="checkbox" defaultChecked className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary transition-colors cursor-pointer" />
                                    <span className="text-secondary group-hover:text-primary transition-colors">Daily governance summary report</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer group">
                                    <input type="checkbox" className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary transition-colors cursor-pointer" />
                                    <span className="text-secondary group-hover:text-primary transition-colors">Weekly system health digest</span>
                                </label>
                            </div>
                        </div>

                        {/* Section 2 */}
                        <div className="pt-8 border-t border-gray-100">
                            <div className="flex items-center space-x-3 mb-4">
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-primary">Security & Access</h3>
                            </div>

                            <div className="space-y-6 pl-12 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">Two-Factor Authentication</label>
                                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-slate-50">
                                        <div className="text-sm text-gray-500">Secure your account with 2FA</div>
                                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-primary hover:bg-gray-50 transition-colors shadow-sm">
                                            Enable 2FA
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-secondary mb-2">Session Timeout Policy</label>
                                    <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-secondary bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer hover:border-gray-300">
                                        <option>15 minutes (High Security)</option>
                                        <option>30 minutes (Standard)</option>
                                        <option>1 hour (Convenience)</option>
                                        <option>4 hours (Developer Mode)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 border-t border-gray-100 flex justify-end">
                        <button className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-green-900 transition-all shadow-lg shadow-green-900/10 flex items-center hover:scale-[1.02] active:scale-[0.98]">
                            <Save className="w-4 h-4 mr-2" />
                            Save Preferences
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
