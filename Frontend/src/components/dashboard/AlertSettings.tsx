import { useState, useEffect } from 'react';
import { Bell, Mail, Phone, Send, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';

const AlertSettings = () => {
    const [settings, setSettings] = useState({
        email: '',
        phone: '',
        enableEmail: true,
        enableSMS: false
    });
    const [testResult, setTestResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleTestAlert = async () => {
        setLoading(true);
        setTestResult(null);
        
        try {
            const response = await fetch('/api/alerts/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: settings.enableEmail ? settings.email : null,
                    phone: settings.enableSMS ? settings.phone : null
                })
            });
            
            const result = await response.json();
            setTestResult(result);
        } catch (error) {
            setTestResult({ success: false, error: 'Failed to send test alert' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Bell className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Alert Settings</h2>
                    <p className="text-sm text-gray-500">Configure notifications for system alerts</p>
                </div>
            </div>

            <div className="space-y-4">
                {/* Email Settings */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">Email Alerts</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.enableEmail}
                                onChange={(e) => setSettings(prev => ({ ...prev, enableEmail: e.target.checked }))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    {settings.enableEmail && (
                        <input
                            type="email"
                            placeholder="admin@yourbank.com"
                            value={settings.email}
                            onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    )}
                </div>

                {/* SMS Settings */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-900">SMS Alerts (Critical Only)</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.enableSMS}
                                onChange={(e) => setSettings(prev => ({ ...prev, enableSMS: e.target.checked }))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    {settings.enableSMS && (
                        <input
                            type="tel"
                            placeholder="+1234567890"
                            value={settings.phone}
                            onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    )}
                </div>

                {/* Test Alert Button */}
                <button
                    onClick={handleTestAlert}
                    disabled={loading || (!settings.enableEmail && !settings.enableSMS)}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            <span>Send Test Alert</span>
                        </>
                    )}
                </button>

                {/* Test Result */}
                {testResult && (
                    <div className={`p-3 rounded-md ${testResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        <div className="flex items-center space-x-2">
                            {testResult.success ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-red-600"></div>
                            )}
                            <span className="text-sm font-medium">
                                {testResult.success ? 'Test alert sent successfully!' : 'Failed to send test alert'}
                            </span>
                        </div>
                        {testResult.error && (
                            <p className="text-xs mt-1">{testResult.error}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Alert Types Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Alert Types</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Model accuracy drops below 70%</li>
                    <li>• System resource usage exceeds 80%</li>
                    <li>• API response time exceeds 1 second</li>
                    <li>• LLM costs exceed daily limits</li>
                    <li>• High hallucination rates detected</li>
                </ul>
            </div>
        </div>
    );
};

export default AlertSettings;