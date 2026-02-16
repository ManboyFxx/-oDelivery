import React, { useState, useCallback, useEffect } from 'react';
import { ApiSettings } from '../services/settingsService';
import { getRestApiClient } from '../services/restApiClient';
import { getDeviceInfo, clearAuthSession } from '../services/authService';

interface ApiSettingsPanelProps {
  settings: ApiSettings | null;
  onChange: (settings: ApiSettings) => void;
}

const ApiSettingsPanel: React.FC<ApiSettingsPanelProps> = ({ settings, onChange }) => {
  const [baseUrl, setBaseUrl] = useState(settings?.baseUrl || '');
  const [accessToken, setAccessToken] = useState(settings?.accessToken || '');
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    setDeviceInfo(getDeviceInfo());
  }, []);

  const handleSave = useCallback(() => {
    if (!baseUrl || !accessToken) {
      setTestResult({
        success: false,
        message: 'Por favor, preencha todos os campos',
      });
      return;
    }

    onChange({ baseUrl, accessToken });
    setTestResult({
      success: true,
      message: 'Configurações salvas com sucesso',
    });

    setTimeout(() => {
      setTestResult(null);
    }, 3000);
  }, [baseUrl, accessToken, onChange]);

  const handleTestConnection = async () => {
    if (!baseUrl || !accessToken) {
      setTestResult({
        success: false,
        message: 'Por favor, preencha todos os campos antes de testar',
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const apiClient = getRestApiClient();
      apiClient.configure({ baseUrl, accessToken });

      const result = await apiClient.testConnection();
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Erro ao conectar com a API',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Deseja sair da sua conta? Você precisará fazer login novamente.')) {
      clearAuthSession();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      {/* Base URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          🔗 URL Base da API
        </label>
        <input
          type="url"
          placeholder="https://oodelivery.online"
          value={baseUrl}
          onChange={(e) => {
            setBaseUrl(e.target.value);
            setTestResult(null);
          }}
          className="w-full px-4 py-2 rounded-lg bg-[#0f1217] border border-[#2d3748] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff3d03]"
        />
        <p className="text-xs text-gray-500 mt-1">
          Ex: https://api.oodelivery.com ou https://seu-dominio.com
        </p>
      </div>

      {/* Access Token Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          🎫 Token de Impressão Local
        </label>
        <div className="relative group/token">
          <input
            type={showToken ? 'text' : 'password'}
            placeholder="Seu token de acesso"
            value={accessToken}
            onChange={(e) => {
              setAccessToken(e.target.value);
              setTestResult(null);
            }}
            className="w-full px-4 py-2 rounded-lg bg-[#0f1217] border border-[#2d3748] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff3d03] pr-10"
          />
          <div className="absolute right-3 top-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(accessToken);
                const btn = document.getElementById('copy-token-btn');
                if (btn) {
                  const originalText = btn.innerHTML;
                  btn.innerHTML = '✅';
                  setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                }
              }}
              id="copy-token-btn"
              className="text-gray-400 hover:text-[#ff3d03] transition-colors text-xs font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/10"
              title="Copiar Token"
            >
              Copiar
            </button>
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="text-gray-400 hover:text-gray-300 text-lg leading-none"
            >
              {showToken ? '🙈' : '👁'}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Este é o código que liga este terminal à sua conta no oDelivery.
        </p>
      </div>

      {/* Test Result */}
      {testResult && (
        <div
          className={`p-4 rounded-lg border text-sm ${testResult.success
              ? 'bg-green-900/20 border-green-500/30 text-green-400'
              : 'bg-red-900/20 border-red-500/30 text-red-400'
            }`}
        >
          {testResult.success ? '✅' : '❌'} {testResult.message}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleTestConnection}
          disabled={testing || !baseUrl || !accessToken}
          className="flex-1 px-4 py-2 rounded-lg border border-[#2d3748] text-white hover:bg-[#1f2937] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {testing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Testando...
            </>
          ) : (
            <>🧪 Testar Conexão</>
          )}
        </button>

        <button
          onClick={handleSave}
          disabled={!baseUrl || !accessToken}
          className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#ff3d03] to-[#ff6b35] text-white hover:shadow-lg hover:shadow-[#ff3d03]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          💾 Salvar
        </button>
      </div>

      {/* Connection Status & Device Info */}
      <div className="pt-4 border-t border-[#2d3748]">
        <div className="space-y-3">
          {/* Status */}
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${testResult?.success ? 'bg-green-500' : 'bg-gray-500'
                }`}
            ></div>
            <span className="text-gray-400">
              {testResult?.success ? 'Conectado' : 'Configuração pendente'}
            </span>
          </div>

          {/* Tenant Info */}
          {settings?.tenantName && (
            <div className="text-xs bg-[#ff3d03]/5 border border-[#ff3d03]/20 rounded p-2">
              <span className="text-gray-500">Tenant:</span>{' '}
              <span className="text-[#ff3d03] font-bold">{settings.tenantName.toUpperCase()}</span>
            </div>
          )}

          {/* Device ID */}
          {deviceInfo && (
            <div className="text-xs bg-blue-500/5 border border-blue-500/20 rounded p-2">
              <span className="text-gray-500">Dispositivo:</span>{' '}
              <span className="text-blue-400 font-mono">#{deviceInfo.fingerprint}</span>
              <p className="text-gray-600 mt-1">Este computador será reconhecido nas próximas conexões</p>
            </div>
          )}
        </div>
      </div>

      {/* Logout Button */}
      {settings && (
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
        >
          🔓 Sair da Conta
        </button>
      )}
    </div>
  );
};

export default ApiSettingsPanel;
