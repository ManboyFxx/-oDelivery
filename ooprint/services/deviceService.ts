import { v4 as uuidv4 } from 'uuid';

const DEVICE_ID_KEY = 'printbot_device_id';

/**
 * Gera um novo device_id único ou recupera o existente do localStorage
 */
export function getOrCreateDeviceId(): string {
    try {
        // Tentar recuperar do localStorage
        const existingId = localStorage.getItem(DEVICE_ID_KEY);
        if (existingId) {
            console.log('📱 Device ID recuperado:', existingId);
            return existingId;
        }
    } catch (e) {
        console.warn('⚠️ Erro ao acessar localStorage:', e);
    }

    // Gerar novo device_id
    const deviceId = uuidv4();

    try {
        localStorage.setItem(DEVICE_ID_KEY, deviceId);
        console.log('📱 Novo Device ID gerado:', deviceId);
    } catch (e) {
        console.error('❌ Erro ao salvar device_id:', e);
    }

    return deviceId;
}

/**
 * Coleta metadados do dispositivo
 */
export function getDeviceMetadata() {
    return {
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        language: navigator.language,
        online: navigator.onLine,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timestamp: new Date().toISOString()
    };
}

/**
 * Detecta o IP local (simulado - em produção usar API ou Electron)
 */
export function getLocalIP(): string {
    // Em ambiente web, não temos acesso direto ao IP
    // Em Electron, poderia usar `os.networkInterfaces()`
    return 'unknown';
}
