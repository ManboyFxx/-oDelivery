/**
 * Generate a device fingerprint based on browser characteristics
 * This is used to identify trusted devices for adaptive authentication
 */
export function generateDeviceFingerprint(): string {
    const data = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages?.join(',') || '',
        platform: navigator.platform,
        screenResolution: `${screen.width}x${screen.height}`,
        screenColorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        timezoneOffset: new Date().getTimezoneOffset(),
        hardwareConcurrency: navigator.hardwareConcurrency || 0,
        deviceMemory: (navigator as any).deviceMemory || 0,
    };

    // Convert to JSON and encode as base64
    const jsonString = JSON.stringify(data);
    return btoa(jsonString);
}

/**
 * Check if device fingerprinting is supported
 */
export function isDeviceFingerprintingSupported(): boolean {
    return typeof navigator !== 'undefined' && typeof btoa !== 'undefined';
}
