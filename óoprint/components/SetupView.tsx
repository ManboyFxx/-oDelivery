import React, { useState, useEffect } from 'react';
import { ApiSettings } from '../services/settingsService';
import { getRestApiClient } from '../services/restApiClient';
import { saveAuthSession, loadAuthSession, getDeviceInfo } from '../services/authService';
import TokenHelpModal from './TokenHelpModal';

interface SetupViewProps {
  onComplete: (settings: ApiSettings) => void;
}

const SetupView: React.FC<SetupViewProps> = ({ onComplete }) => {
  const [baseUrl, setBaseUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{ fingerprint: string } | null>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  // Carregar sessão salva ao montar o componente
  useEffect(() => {
    const savedSession = loadAuthSession();
    if (savedSession) {
      setBaseUrl(savedSession.apiSettings.baseUrl);
      setAccessToken(savedSession.apiSettings.accessToken);
      setRememberMe(true);

      // Auto-complete com a sessão salva
      setTimeout(() => {
        onComplete(savedSession.apiSettings);
      }, 500);
    }

    // Mostrar identificação do dispositivo
    const info = getDeviceInfo();
    setDeviceInfo({ fingerprint: info.fingerprint });
  }, [onComplete]);

  const handleTestConnection = async () => {
    if (!baseUrl || !accessToken) {
      setError('Por favor, preencha os dois campos');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const apiClient = getRestApiClient();
      apiClient.configure({ baseUrl, accessToken });

      const result = await apiClient.testConnection();

      if (result.success) {
        setSuccess(true);
        setError(null);

        const apiSettings: ApiSettings = {
          baseUrl,
          accessToken,
        };

        // Fetch profile
        try {
          const profile = await apiClient.fetchProfile();
          console.log('Profile loaded:', profile);

          // Salvar sessão se "Permanecer conectado" está ativo
          if (rememberMe) {
            saveAuthSession(apiSettings, true, profile);
          }
        } catch (e) {
          console.error('Error fetching profile:', e);
          // Proceed anyway, but without profile? Or fail? 
          // Better to proceed for now.
          if (rememberMe) {
            saveAuthSession(apiSettings, true);
          }
        }

        // Auto-complete after 1 second
        setTimeout(() => {
          onComplete(apiSettings);
        }, 1000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao conectar com a API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#05070a] to-[#0f1217]">
      <div className="w-full max-w-md px-6">
        {/* Logo / Branding */}
        <div className="text-center mb-12 flex flex-col items-center">
          <img
            src="./logo.png"
            alt="OoDelivery Logo"
            className="h-16 mb-6 object-contain"
          />
          <h1 className="text-2xl font-bold text-white mb-1">óoprint</h1>
          <p className="text-gray-400">Sistema de Impressão</p>
        </div>

        {/* Setup Form */}
        <div className="bg-gradient-to-br from-[#111418] to-[#16191e] rounded-2xl p-8 border border-[#1f2937]/30 mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Configure a API</h2>
          <p className="text-gray-400 text-sm mb-8">
            Para começar a usar o óoprint, você precisa configurar a conexão com o servidor oDelivery.
          </p>

          {/* Base URL Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL Base da API
            </label>
            <input
              type="url"
              placeholder="https://oodelivery.online"
              value={baseUrl}
              onChange={(e) => {
                setBaseUrl(e.target.value);
                setError(null);
              }}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg bg-[#0f1217] border border-[#2d3748] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff3d03] disabled:opacity-50"
            />
          </div>

          {/* Access Token Input */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token de Acesso
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                placeholder="Seu token de acesso"
                value={accessToken}
                onChange={(e) => {
                  setAccessToken(e.target.value);
                  setError(null);
                }}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-[#0f1217] border border-[#2d3748] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#ff3d03] disabled:opacity-50 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                disabled={loading}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-300 disabled:opacity-50"
              >
                {showToken ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Permanecer Conectado */}
          <div className="mb-6 p-4 bg-[#0f1217] border border-[#2d3748] rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: '#ff3d03' }}
              />
              <div>
                <p className="text-sm font-medium text-gray-300">Permanecer conectado</p>
                <p className="text-xs text-gray-500">
                  {deviceInfo ? (
                    <>
                      Reconectar automaticamente neste dispositivo <span className="font-mono text-[#ff3d03]">#{deviceInfo.fingerprint}</span>
                    </>
                  ) : (
                    'Reconectar automaticamente neste dispositivo'
                  )}
                </p>
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-900/20 border border-green-500/30 text-green-400 text-sm">
              ✅ Conectado com sucesso! Redirecionando...
            </div>
          )}

          {/* Test Connection Button */}
          <button
            onClick={handleTestConnection}
            disabled={loading || !baseUrl || !accessToken}
            className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-[#ff3d03] to-[#ff6b35] text-white font-semibold hover:shadow-lg hover:shadow-[#ff3d03]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Testando conexão...
              </>
            ) : (
              <>
                🔗 Testar Conexão
              </>
            )}
          </button>
        </div>

        {/* Help Text */}
        <div className="text-center text-gray-500 text-xs">
          <p>
            Precisa de ajuda?{' '}
            <button
              onClick={() => setHelpModalOpen(true)}
              className="text-[#ff3d03] hover:text-[#ff6b35] font-medium hover:underline focus:outline-none"
            >
              Saiba como gerar seu token
            </button>
          </p>
        </div>
      </div>

      <TokenHelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </div>
  );
};

export default SetupView;
