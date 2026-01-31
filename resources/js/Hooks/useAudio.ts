import { useCallback, useEffect, useRef } from 'react';

type SoundType = 'new-order' | 'notification' | 'success' | 'error' | 'alert' | 'order-updated' | 'ready';

const SOUND_FILES: Record<SoundType, string> = {
    'new-order': '/sounds/new-order.mp3',
    'notification': '/sounds/notification.mp3',
    'success': '/sounds/success.mp3',
    'error': '/sounds/error.mp3',
    'alert': '/sounds/alert.mp3',
    'order-updated': '/sounds/order-updated.mp3',
    'ready': '/sounds/pedido-pronto.mp3',
};

export const useAudio = () => {
    const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
    const initializedRef = useRef(false);
    const pendingPlaysRef = useRef<SoundType[]>([]);

    // Initialize audio elements on first user interaction
    const initializeAudio = useCallback(() => {
        if (initializedRef.current) return;

        Object.entries(SOUND_FILES).forEach(([key, src]) => {
            const audio = new Audio(src);
            audio.preload = 'auto';
            audio.crossOrigin = 'anonymous';
            audioRefs.current[key] = audio;
        });

        initializedRef.current = true;

        // Play any pending sounds
        while (pendingPlaysRef.current.length > 0) {
            const soundType = pendingPlaysRef.current.shift();
            if (soundType) {
                playSound(soundType);
            }
        }
    }, []);

    // Setup initialization on first click/touch
    useEffect(() => {
        const handleUserInteraction = () => {
            initializeAudio();
        };

        window.addEventListener('click', handleUserInteraction, { once: true });
        window.addEventListener('touchstart', handleUserInteraction, { once: true });

        return () => {
            window.removeEventListener('click', handleUserInteraction);
            window.removeEventListener('touchstart', handleUserInteraction);
        };
    }, [initializeAudio]);

    const playSound = useCallback(async (type: SoundType) => {
        const audio = audioRefs.current[type];
        if (!audio) {
            console.warn(`Audio element not found for: ${type}`);
            return;
        }

        try {
            audio.currentTime = 0;
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log(`Playing sound: ${type}`);
                    })
                    .catch((err) => {
                        console.warn(`Failed to play ${type}:`, err.message);
                    });
            }
        } catch (error) {
            console.warn(`Error playing sound ${type}:`, error);
        }
    }, []);

    const play = useCallback((type: SoundType) => {
        console.log(`[useAudio] play() called for: ${type}, initialized: ${initializedRef.current}`);

        // If not initialized, queue the sound for later
        if (!initializedRef.current) {
            console.warn(`[useAudio] Audio not initialized yet, queuing: ${type}`);
            if (!pendingPlaysRef.current.includes(type)) {
                pendingPlaysRef.current.push(type);
            }
            return;
        }

        playSound(type);
    }, [playSound]);

    // Cleanup
    useEffect(() => {
        return () => {
            Object.values(audioRefs.current).forEach(audio => {
                audio.pause();
                audio.src = '';
            });
        };
    }, []);

    return { play, initializeAudio };
};
