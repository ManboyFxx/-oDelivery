import React, { useEffect, useState } from 'react';
import { getApiSettings } from '../services/settingsService';
import { getDeviceInfo } from '../services/authService';

interface HeaderProps {
  isSyncing: boolean;
  lastChecked: Date | null;
  onRefresh: () => void;
  error: string | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isSyncing, lastChecked, onRefresh, error, onLogout }) => {
  const [tenantName, setTenantName] = useState<string | null>(null);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string | null>(null);

  useEffect(() => {
    const apiSettings = getApiSettings();
    if (apiSettings) {
      setTenantName(apiSettings.tenantName || 'odelivery');
    }

    const deviceInfo = getDeviceInfo();
    setDeviceFingerprint(deviceInfo.fingerprint);
  }, []);

  const formatTime = (date: Date | null): string => {
    if (!date) return 'Nunca';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);

    if (diffSec < 60) return `${diffSec}s atrás`;
    if (diffMin < 60) return `${diffMin}m atrás`;
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const statusColor = error ? '#ff3d03' : '#10b981';
  const statusText = error ? 'Erro de Conexão' : 'Conectado';

  return (
    <header className="h-20 border-b border-[#1e293b] bg-[#05070a]/80 backdrop-blur-md flex items-center justify-between px-8 z-10 font-sans">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-200 tracking-tight">óoprint</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-xs text-gray-500 font-medium whitespace-nowrap">v2.4</p>
            {tenantName && (
              <span className="text-[9px] bg-[#ff3d03]/10 text-[#ff3d03] px-2 py-0.5 rounded font-bold whitespace-nowrap">
                🏪 {tenantName.toUpperCase()}
              </span>
            )}
            {deviceFingerprint && (
              <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-bold whitespace-nowrap">
                💻 #{deviceFingerprint}
              </span>
            )}
            {error && (
              <span className="text-[9px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded font-bold whitespace-nowrap">
                {error}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6">
        {/* Connection Status */}
        <div
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors border ${error ? 'bg-[#ff3d03]/10 border-[#ff3d03]/30' : 'bg-emerald-500/10 border-emerald-500/20'
            }`}
        >
          <div
            className={`w-2 h-2 rounded-full ${isSyncing ? 'animate-ping' : ''}`}
            style={{ backgroundColor: statusColor }}
          />
          <span
            className={`text-[10px] font-bold uppercase tracking-widest`}
            style={{ color: statusColor }}
          >
            {isSyncing ? 'Sincronizando...' : statusText}
          </span>
        </div>

        {/* Last Checked & Refresh */}
        <div className="flex items-center gap-3 sm:gap-4 border-l border-[#1e293b] pl-4 sm:pl-6">
          <div className="text-right hidden lg:block">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              Check
            </p>
            <p className="text-xs font-bold text-gray-300 whitespace-nowrap">{formatTime(lastChecked)}</p>
          </div>

          <button
            onClick={onRefresh}
            disabled={isSyncing}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Atualizar agora"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-5 h-5 text-gray-400 ${isSyncing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          {onLogout && (
            <button
              onClick={() => {
                if (confirm('Deseja realmente sair da conta? Você poderá reconectar rapidamente neste computador.')) {
                  onLogout();
                }
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20 hover:bg-red-500/20 transition-colors group"
              title="Sair do terminal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
