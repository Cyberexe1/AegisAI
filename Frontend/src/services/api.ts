const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface PredictionInput {
  income: number;
  age: number;
  loan_amount: number;
  credit_history: string;  // Changed from number to string
  employment_type: string;
  existing_debts: number;
  user_id?: string;  // Added optional user_id
}

export interface PredictionResponse {
  risk_score?: number;  // Made optional since backend doesn't return this
  risk_category: string;
  confidence: number;  // Backend calls this confidence_score
  approval_probability: number;
  processing_time_ms: number;
  model_version: string;
  timestamp?: string;  // Made optional
  confidence_score?: number;  // Backend field name
}

export interface TrustScore {
  timestamp: string;
  trust_score: number;
  autonomy_level: string;
  risk_factors: {
    drift_score: number;
    accuracy_drop: number;
    bias_score: number;
    manual_overrides: number;
  };
  contributing_metrics: {
    drift_severity?: string;
    accuracy_drop_percent?: number;
    bias_score?: number;
    manual_overrides_count?: number;
  };
  alerts_triggered: string[];
  governance_action: string;
}

export interface DriftResult {
  feature: string;
  drift_detected: boolean;
  severity: string;
  psi_score: number;
  p_value: number;
  ks_statistic?: number;
  distribution_comparison: {
    training_mean: number;
    current_mean: number;
    training_std: number;
    current_std: number;
  };
  timestamp?: string;
}

export interface SystemHealth {
  timestamp: string;
  avg_response_time_ms: number;
  avg_confidence: number;
  predictions_count_last_100: number;
  cpu_usage_percent: number;
  memory_usage_mb: number;
  memory_percent: number;
  uptime_seconds: number;
}

export interface LLMQuery {
  prompt: string;
  use_case?: string;
  user_id?: string;
}

export interface LLMMetrics {
  time_window_hours: number;
  total_requests: number;
  total_tokens: number;
  total_cost_usd: number;
  avg_latency_ms: number;
  throughput_rph: number;
  hallucination_rate: number;
  safety_violation_rate: number;
  avg_quality_score: number;
}

export interface LLMInteraction {
  _id: string;
  timestamp: string;
  model: string;
  use_case: string;
  prompt: {
    text: string;
    tokens: number;
  };
  response: {
    text: string;
    tokens: number;
    finish_reason: string;
  };
  metrics: {
    latency_ms: number;
    total_tokens: number;
    cost_usd: number;
    quality_score: number;
    hallucination_detected: boolean;
    safety_passed: boolean;
  };
}

// API Functions
export const api = {
  // Predictions
  async predict(data: PredictionInput): Promise<PredictionResponse> {
    const BACKEND_URL = 'http://localhost:5000'; // Use backend, not ML API directly
    const response = await fetch(`${BACKEND_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Prediction failed');
    return response.json();
  },

  // Monitoring
  async getDrift(hours: number = 24): Promise<{ drift_results: DriftResult[] }> {
    const response = await fetch(`${API_BASE_URL}/monitoring/drift?hours=${hours}`);
    if (!response.ok) throw new Error('Failed to fetch drift data');
    return response.json();
  },

  async getPerformance(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/monitoring/performance`);
    if (!response.ok) throw new Error('Failed to fetch performance data');
    return response.json();
  },

  async getHealth(): Promise<SystemHealth> {
    const response = await fetch(`${API_BASE_URL}/monitoring/health`);
    if (!response.ok) throw new Error('Failed to fetch health data');
    return response.json();
  },

  async getMonitoringDashboard(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/monitoring/dashboard`);
    if (!response.ok) throw new Error('Failed to fetch dashboard data');
    return response.json();
  },

  // Governance
  async getTrustScore(): Promise<TrustScore> {
    const response = await fetch(`${API_BASE_URL}/governance/trust`);
    if (!response.ok) throw new Error('Failed to fetch trust score');
    return response.json();
  },

  async getTrustHistory(hours: number = 24): Promise<{ history: TrustScore[] }> {
    const response = await fetch(`${API_BASE_URL}/governance/history?hours=${hours}`);
    if (!response.ok) throw new Error('Failed to fetch trust history');
    return response.json();
  },

  async getIncidents(status: string = 'all'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/governance/incidents?status=${status}`);
    if (!response.ok) throw new Error('Failed to fetch incidents');
    return response.json();
  },

  async simulateIncident(): Promise<any> {
    const response = await fetch('http://localhost:5000/api/incidents/simulate', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to simulate incident');
    return response.json();
  },

  async exportReport(): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/governance/export-report`);
    if (!response.ok) throw new Error('Failed to export report');
    return response.blob();
  },

  // Simulation endpoints (for demo/hackathon)
  async simulateDrift(): Promise<any> {
    const response = await fetch('http://localhost:5000/api/incidents/simulate-drift', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to simulate drift');
    return response.json();
  },

  async simulateBias(): Promise<any> {
    const response = await fetch('http://localhost:5000/api/incidents/simulate-bias', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to simulate bias');
    return response.json();
  },

  async simulateAccuracyDrop(): Promise<any> {
    const response = await fetch('http://localhost:5000/api/incidents/simulate-accuracy-drop', {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to simulate accuracy drop');
    return response.json();
  },

  async resetSimulation(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/simulation/reset`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to reset simulation');
    return response.json();
  },

  async getSimulationStatus(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/simulation/status`);
    if (!response.ok) throw new Error('Failed to get simulation status');
    return response.json();
  },

  // Loan endpoints
  async getUserLoans(userId: string): Promise<any> {
    const response = await fetch(`http://localhost:5000/api/loans/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user loans');
    return response.json();
  },

  async getRecentLoans(limit: number = 10): Promise<any> {
    const response = await fetch(`http://localhost:5000/api/loans/recent?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch recent loans');
    return response.json();
  },

  async getLoanDetails(loanId: string): Promise<any> {
    const response = await fetch(`http://localhost:5000/api/loans/${loanId}`);
    if (!response.ok) throw new Error('Failed to fetch loan details');
    return response.json();
  },

  // LLM endpoints
  async queryLLM(query: LLMQuery): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/llm/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    });
    if (!response.ok) throw new Error('LLM query failed');
    return response.json();
  },

  async getLLMMetrics(hours: number = 24): Promise<LLMMetrics> {
    const response = await fetch(`${API_BASE_URL}/llm/metrics?hours=${hours}`);
    if (!response.ok) throw new Error('Failed to fetch LLM metrics');
    return response.json();
  },

  async getLLMInteractions(limit: number = 50): Promise<{ interactions: LLMInteraction[] }> {
    const response = await fetch(`${API_BASE_URL}/llm/interactions?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch LLM interactions');
    return response.json();
  },

  async getLLMAlerts(status: string = 'open'): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/llm/alerts?status=${status}`);
    if (!response.ok) throw new Error('Failed to fetch LLM alerts');
    return response.json();
  },

  // Stats
  async getStats(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },
};
