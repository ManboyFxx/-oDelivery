import React, { useState, useEffect } from 'react';
import { getDebugService } from '../services/debugService';
import { getRestApiClient } from '../services/restApiClient';

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isOpen, onClose }) => {
  const [endpoint, setEndpoint] = useState('/api/printer/orders');
  const [method, setMethod] = useState('GET');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const debugService = getDebugService();
  const [stats, setStats] = useState(debugService.getStats());
  const [logs, setLogs] = useState(debugService.getLogs());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(debugService.getStats());
      setLogs(debugService.getLogs());
    }, 1000);

    return () => clearInterval(interval);
  }, [debugService]);

  const handleTestEndpoint = async () => {
    setTestLoading(true);
    setTestResult(null);

    try {
      const apiClient = getRestApiClient();
      const result = await apiClient.testConnection();
      setTestResult({
        success: true,
        data: result,
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleExportLogs = () => {
    const data = debugService.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full max-h-[80vh] bg-[#0d1117] border-t border-[#1e293b] rounded-t-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#1e293b]">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            🔧 Painel de Debug
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-[#1f2937] rounded p-3">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
              <p className="text-xs text-green-400">✅ OK</p>
              <p className="text-2xl font-bold text-green-400">{stats.successful}</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
              <p className="text-xs text-red-400">❌ Erro</p>
              <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
              <p className="text-xs text-blue-400">⏱️ Média</p>
              <p className="text-xl font-bold text-blue-400">{stats.averageResponseTime}ms</p>
            </div>
          </div>

          {/* Test Endpoint */}
          <div className="bg-[#1f2937] rounded-lg p-4 space-y-3">
            <h4 className="font-bold text-white text-sm">🧪 Testar Endpoint</h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="/api/printer/orders"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0f1217] border border-[#2d3748] text-white text-sm"
              />
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full px-3 py-2 rounded bg-[#0f1217] border border-[#2d3748] text-white text-sm"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
              </select>
              <button
                onClick={handleTestEndpoint}
                disabled={testLoading}
                className="w-full px-3 py-2 rounded bg-[#ff3d03] text-white font-semibold text-sm hover:bg-[#ff5c2c] disabled:opacity-50 transition-colors"
              >
                {testLoading ? 'Testando...' : '🔗 Testar Requisição'}
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded border text-sm ${
                  testResult.success
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-red-500/10 border-red-500/30 text-red-400'
                }`}
              >
                <p className="font-bold mb-1">{testResult.success ? '✅ Sucesso' : '❌ Erro'}</p>
                <pre className="text-xs overflow-x-auto max-h-24">
                  {JSON.stringify(testResult.data || testResult.error, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Recent Logs */}
          <div className="bg-[#1f2937] rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-sm">📋 Logs Recentes</h4>
              <button
                onClick={handleExportLogs}
                className="text-xs px-2 py-1 rounded bg-[#ff3d03]/20 text-[#ff3d03] hover:bg-[#ff3d03]/30 transition-colors"
              >
                📥 Exportar
              </button>
            </div>

            <div className="space-y-1 max-h-48 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-xs text-gray-500">Nenhum log ainda</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className={`text-xs p-2 rounded font-mono ${
                      log.success
                        ? 'bg-green-500/5 border border-green-500/20 text-green-400'
                        : 'bg-red-500/5 border border-red-500/20 text-red-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span>
                        {log.success ? '✅' : '❌'} {log.method} {log.endpoint}
                      </span>
                      <span className="text-gray-500">{log.duration}ms</span>
                    </div>
                    {log.status && <span className="text-gray-500">{log.status} {log.statusText}</span>}
                    {log.error && <span className="text-red-400">{log.error}</span>}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-[#1f2937] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">Taxa de Sucesso</span>
              <span className="text-lg font-bold text-[#ff3d03]">{stats.successRate}%</span>
            </div>
            <div className="w-full bg-[#0f1217] rounded-full h-2">
              <div
                className="bg-gradient-to-r from-[#ff3d03] to-[#ff6b35] h-2 rounded-full transition-all"
                style={{ width: `${stats.successRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;
