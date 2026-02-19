import { useState } from 'react';
import { AlertTriangle, TrendingDown, Scale, RotateCcw } from 'lucide-react';
import { api } from '../../services/api';

const SimulationControls = () => {
  const [simulating, setSimulating] = useState<string | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);

  const handleSimulate = async (type: 'drift' | 'bias' | 'accuracy') => {
    setSimulating(type);
    try {
      let response;
      switch (type) {
        case 'drift':
          response = await api.simulateDrift();
          break;
        case 'bias':
          response = await api.simulateBias();
          break;
        case 'accuracy':
          response = await api.simulateAccuracyDrop();
          break;
      }
      
      setSimulationActive(true);
      
      // Show success message with email notification status
      const messages = {
        drift: '🔴 Drift scenario activated!\n📧 Email alert sent\n📊 Watch trust score decrease.',
        bias: '⚠️ Bias detected!\n📧 Email alert sent\n🚨 Governance alerts triggered.',
        accuracy: '📉 Accuracy drop simulated!\n📧 Email alert sent\n🔍 Review required.'
      };
      
      if (response.success && response.notification?.email_sent) {
        alert(messages[type]);
      } else {
        alert(messages[type].replace('📧 Email alert sent', '⚠️ Email alert failed'));
      }
      
      // Trigger dashboard refresh
      window.dispatchEvent(new Event('simulation-triggered'));
      
    } catch (error) {
      console.error(`Failed to simulate ${type}:`, error);
      alert(`❌ Failed to simulate ${type}.\nMake sure Backend (port 5000) and ML API (port 8000) are running.`);
    } finally {
      setSimulating(null);
    }
  };

  const handleReset = async () => {
    setSimulating('reset');
    try {
      await api.resetSimulation();
      setSimulationActive(false);
      alert('✅ Simulation reset! System restored to normal operation.');
      
      // Trigger dashboard refresh
      window.dispatchEvent(new Event('simulation-triggered'));
      
    } catch (error) {
      console.error('Failed to reset simulation:', error);
      alert('Failed to reset simulation. Ensure backend is running.');
    } finally {
      setSimulating(null);
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-purple-100 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-primary">Simulation Mode</h3>
            <p className="text-xs text-gray-500">Test governance responses</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Drift Simulation */}
          <button
            onClick={() => handleSimulate('drift')}
            disabled={simulating !== null}
            className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{simulating === 'drift' ? 'Simulating...' : 'Simulate Drift'}</span>
          </button>

          {/* Bias Simulation */}
          <button
            onClick={() => handleSimulate('bias')}
            disabled={simulating !== null}
            className="flex items-center space-x-2 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Scale className="w-4 h-4" />
            <span>{simulating === 'bias' ? 'Simulating...' : 'Simulate Bias'}</span>
          </button>

          {/* Accuracy Drop Simulation */}
          <button
            onClick={() => handleSimulate('accuracy')}
            disabled={simulating !== null}
            className="flex items-center space-x-2 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <TrendingDown className="w-4 h-4" />
            <span>{simulating === 'accuracy' ? 'Simulating...' : 'Accuracy Drop'}</span>
          </button>

          {/* Reset Button */}
          {simulationActive && (
            <button
              onClick={handleReset}
              disabled={simulating !== null}
              className="flex items-center space-x-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{simulating === 'reset' ? 'Resetting...' : 'Reset'}</span>
            </button>
          )}
        </div>
      </div>

      {simulationActive && (
        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800 font-medium">
            ⚠️ Simulation active - System behavior is being artificially modified for demonstration
          </p>
        </div>
      )}
    </div>
  );
};

export default SimulationControls;
