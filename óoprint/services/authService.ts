import { ApiSettings } from './settingsService';
import { TenantProfile } from '../types';
import { getOrCreateDeviceId } from './deviceService';

const AUTH_STORAGE_KEY = 'ooprint_auth_session';

export interface AuthSession {
  apiSettings: ApiSettings;
  tenantProfile?: TenantProfile;
  deviceId: string;
  loginTimestamp: number;
  lastActivity: number;
}

/**
 * Salva a sessão de autenticação quando "Permanecer conectado" é ativado
 */
export function saveAuthSession(apiSettings: ApiSettings, rememberMe: boolean, tenantProfile?: TenantProfile): void {
  const deviceId = getOrCreateDeviceId();

  if (rememberMe) {
    const session: AuthSession = {
      apiSettings: {
        ...apiSettings,
        deviceId,
        rememberMe: true,
      },
      tenantProfile,
      deviceId,
      loginTimestamp: Date.now(),
      lastActivity: Date.now(),
    };

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      console.log('✅ Sessão salva: você será reconectado automaticamente neste dispositivo');
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  } else {
    // Limpar sessão se não quer permanecer conectado
    clearAuthSession();
  }
}

/**
 * Carrega a sessão de autenticação salva
 */
export function loadAuthSession(): AuthSession | null {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const session: AuthSession = JSON.parse(stored);
    const currentDeviceId = getOrCreateDeviceId();

    // Validar se é o mesmo dispositivo
    if (session.deviceId !== currentDeviceId) {
      console.warn('⚠️ Dispositivo diferente detectado. Sessão anterior será descartada.');
      clearAuthSession();
      return null;
    }

    // Validar se a sessão não expirou (7 dias)
    const sessionAge = Date.now() - session.loginTimestamp;
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    if (sessionAge > SEVEN_DAYS) {
      console.log('🔄 Sessão expirada. Faça login novamente.');
      clearAuthSession();
      return null;
    }

    // Atualizar última atividade
    session.lastActivity = Date.now();
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
    }

    return session;
  } catch (error) {
    console.error('Erro ao carregar sessão:', error);
    return null;
  }
}

/**
 * Limpa a sessão de autenticação
 */
export function clearAuthSession(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    console.log('🔐 Sessão encerrada');
  } catch (error) {
    console.error('Erro ao limpar sessão:', error);
  }
}

/**
 * Obtém informações do dispositivo para exibição
 */
export function getDeviceInfo(): {
  deviceId: string;
  fingerprint: string;
  userAgent: string;
} {
  const deviceId = getOrCreateDeviceId();
  return {
    deviceId,
    fingerprint: deviceId.substring(0, 8).toUpperCase(),
    userAgent: navigator.userAgent.substring(0, 50),
  };
}
