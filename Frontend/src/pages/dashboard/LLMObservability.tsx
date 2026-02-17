import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { api, LLMMetrics, LLMInteraction } from '../../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, DollarSign, AlertTriangle, Shield, MessageSquare, Send } from 'lucide-react';

const LLMObservability = () => {
    const [metrics, setMetrics] = useState<LLMMetrics | null>(null);
    const [interactions, setInteractions] = useState<LLMInteraction[]>([]);
    const [loading, setLoading] = useState(true);
    const [testQuery, setTestQuery] = useState('');
    const [testLoading, setTestLoading] = useState(false);
    const [testResult, setTestResult] = useState<any>(null);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const [metricsData, interactionsData] = await Promise.all([
                api.getLLMMetrics(24),
                api.getLLMInteractions(10)
            ]);
            setMetrics(metricsData);
            setInteractions(interactionsData.interactions);
        } catch (error) {
            console.error('Failed to fetch LLM data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTestQuery = async () => {
        if (!testQuery.trim()) return;

        setTestLoading(true);
        setTestResult(null);

        try {
            const result = await api.queryLLM({
                prompt: testQuery,
                use_case: 'test_query'
            });
            setTestResult(result);
            fetchData(); // Refresh metrics
        } catch (error) {
            console.error('LLM query failed:', error);
            setTestResult({ error: 'Query failed. Please ensure backend is running.' });
        } finally {
            setTestLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">LLM Observability</h1>
                        <p className="text-secondary mt-1">Monitor LLM performance, cost, and quality metrics</p>
                    </div>
                    <div className="text-xs text-gray-500">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>

                {/* Metrics Grid */}
                {metrics && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <MetricCard
                            icon={<Zap className="w-5 h-5" />}
                            title="Avg Latency"
                            value={`${metrics.avg_latency_ms.toFixed(0)}ms`}
                            subtitle={`${metrics.total_requests} requests (24h)`}
                            color="blue"
                        />
                        <MetricCard
                            icon={<DollarSign className="w-5 h-5" />}
                            title="Total Cost (24h)"
                            value={`$${metrics.total_cost_usd.toFixed(2)}`}
                            subtitle={`${metrics.total_tokens.toLocaleString()} tokens`}
                            color="green"
                        />
                        <MetricCard
                            icon={<AlertTriangle className="w-5 h-5" />}
                            title="Hallucination Rate"
                            value={`${(metrics.hallucination_rate * 100).toFixed(1)}%`}
                            subtitle={`Quality: ${(metrics.avg_quality_score * 100).toFixed(0)}%`}
                            color="amber"
                        />
                        <MetricCard
                            icon={<Shield className="w-5 h-5" />}
                            title="Safety Pass Rate"
                            value={`${((1 - metrics.safety_violation_rate) * 100).toFixed(1)}%`}
                            subtitle={`${metrics.throughput_rph.toFixed(1)} req/hr`}
                            color="emerald"
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Token Usage */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-primary mb-4">Token Usage & Cost</h2>
                        {metrics && (
                            <div className="space-y-4">
                                <div>
                                    <div className="text-4xl font-mono font-bold text-primary">
                                        {metrics.total_tokens.toLocaleString()}
                                    </div>
                                    <div className="text-sm text-gray-500">Total tokens (24h)</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500">Avg Cost/Request</div>
                                        <div className="text-xl font-bold text-primary">
                                            ${(metrics.total_cost_usd / metrics.total_requests).toFixed(4)}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className="text-xs text-gray-500">Avg Tokens/Request</div>
                                        <div className="text-xl font-bold text-primary">
                                            {Math.round(metrics.total_tokens / metrics.total_requests)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quality Metrics */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-primary mb-4">Quality & Safety</h2>
                        {metrics && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Quality Score</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500"
                                                style={{ width: `${metrics.avg_quality_score * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-primary">
                                            {(metrics.avg_quality_score * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Hallucination Rate</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-amber-500"
                                                style={{ width: `${metrics.hallucination_rate * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-primary">
                                            {(metrics.hallucination_rate * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600">Safety Violations</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-red-500"
                                                style={{ width: `${metrics.safety_violation_rate * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold text-primary">
                                            {(metrics.safety_violation_rate * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* LLM Tester */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                        <MessageSquare className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-bold text-primary">Test LLM Query</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={testQuery}
                                onChange={(e) => setTestQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleTestQuery()}
                                placeholder="Ask a banking question... (e.g., 'What is the interest rate for home loans?')"
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                            <button
                                onClick={handleTestQuery}
                                disabled={testLoading || !testQuery.trim()}
                                className="px-6 py-2 bg-primary hover:bg-green-900 text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                <Send className="w-4 h-4" />
                                <span>{testLoading ? 'Sending...' : 'Send'}</span>
                            </button>
                        </div>

                        {testResult && (
                            <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                                {testResult.error ? (
                                    <div className="text-red-600">{testResult.error}</div>
                                ) : (
                                    <>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Response:</div>
                                            <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded">
                                                {testResult.response}
                                            </div>
                                        </div>
                                        {testResult.metrics && (
                                            <div className="grid grid-cols-4 gap-3 pt-3 border-t border-gray-200">
                                                <div>
                                                    <div className="text-xs text-gray-500">Latency</div>
                                                    <div className="text-sm font-bold text-primary">
                                                        {testResult.metrics.latency_ms.toFixed(0)}ms
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Tokens</div>
                                                    <div className="text-sm font-bold text-primary">
                                                        {testResult.metrics.total_tokens}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Cost</div>
                                                    <div className="text-sm font-bold text-primary">
                                                        ${testResult.metrics.cost_usd.toFixed(4)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="text-xs text-gray-500">Quality</div>
                                                    <div className="text-sm font-bold text-primary">
                                                        {(testResult.metrics.quality_score * 100).toFixed(0)}%
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Interactions */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-primary mb-4">Recent Interactions</h2>
                    <div className="space-y-3">
                        {interactions.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                No LLM interactions yet. Try the test query above!
                            </div>
                        ) : (
                            interactions.map((interaction) => (
                                <div key={interaction._id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-sm text-gray-600 flex-1">
                                            <span className="font-medium">Prompt:</span> {interaction.prompt.text.substring(0, 100)}
                                            {interaction.prompt.text.length > 100 && '...'}
                                        </div>
                                        <div className="text-xs text-gray-400 ml-2">
                                            {new Date(interaction.timestamp).toLocaleTimeString()}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-3">
                                        <span className="font-medium">Response:</span> {interaction.response.text.substring(0, 150)}
                                        {interaction.response.text.length > 150 && '...'}
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-xs">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                            {interaction.metrics.latency_ms.toFixed(0)}ms
                                        </span>
                                        <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
                                            {interaction.metrics.total_tokens} tokens
                                        </span>
                                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded">
                                            ${interaction.metrics.cost_usd.toFixed(4)}
                                        </span>
                                        <span className={`px-2 py-1 rounded ${interaction.metrics.hallucination_detected
                                                ? 'bg-red-50 text-red-700'
                                                : 'bg-green-50 text-green-700'
                                            }`}>
                                            {interaction.metrics.hallucination_detected ? 'Hallucination' : 'Valid'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

const MetricCard = ({ icon, title, value, subtitle, color }: any) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className={`text-${color}-600 mb-2`}>{icon}</div>
        <div className="text-xs text-gray-500 mb-1">{title}</div>
        <div className="text-2xl font-bold text-primary mb-1">{value}</div>
        <div className="text-xs text-gray-400">{subtitle}</div>
    </div>
);

export default LLMObservability;
