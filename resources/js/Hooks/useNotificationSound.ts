import { useEffect, useRef } from 'react';

export function useNotificationSound(enabled: boolean = true) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (enabled) {
            // Create audio element with notification sound
            // Using a simple beep sound data URL (440Hz tone)
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            audioRef.current = new Audio();
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [enabled]);

    const play = () => {
        if (!enabled || !audioRef.current) return;

        // Create a simple notification sound using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Configure sound (pleasant notification tone)
        oscillator.frequency.value = 800; // 800Hz
        oscillator.type = 'sine';

        // Envelope for smooth sound
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);

        // Play a second tone for double beep
        setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();

            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);

            oscillator2.frequency.value = 1000; // 1000Hz (higher pitch)
            oscillator2.type = 'sine';

            gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode2.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator2.start(audioContext.currentTime);
            oscillator2.stop(audioContext.currentTime + 0.5);
        }, 200);
    };

    return { play };
}
