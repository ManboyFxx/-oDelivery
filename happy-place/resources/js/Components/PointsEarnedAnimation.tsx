import { useEffect } from 'react';
import { Sparkles, Gift } from 'lucide-react';

interface PointsEarnedAnimationProps {
    points: number;
    show: boolean;
    onComplete: () => void;
}

export function PointsEarnedAnimation({ points, show, onComplete }: PointsEarnedAnimationProps) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onComplete, 3500);
            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
            {/* Background overlay */}
            <div className="absolute inset-0 bg-black/30 animate-fade-in pointer-events-auto" />

            {/* Celebration card */}
            <style>{`
                @keyframes celebrationBounce {
                    0% {
                        transform: scale(0.5) translateY(20px);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.05) rotate(5deg);
                    }
                    100% {
                        transform: scale(1) translateY(0);
                        opacity: 1;
                    }
                }

                @keyframes spin-slowly {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(10deg) scaleY(1.1); }
                }

                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(255, 61, 3, 0.5); }
                    50% { box-shadow: 0 0 40px rgba(255, 61, 3, 0.8); }
                }

                @keyframes float-up {
                    0% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    100% {
                        opacity: 0;
                        transform: translateY(-100px);
                    }
                }

                .celebration-card {
                    animation: celebrationBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .celebration-icon {
                    animation: spin-slowly 2s ease-in-out infinite;
                }

                .celebration-glow {
                    animation: pulse-glow 1.5s ease-in-out infinite;
                }

                .floating-points {
                    animation: float-up 2s ease-out forwards;
                }
            `}</style>

            <div className="celebration-card relative z-10">
                <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 rounded-3xl p-8 shadow-2xl celebration-glow text-center max-w-sm w-full">
                    {/* Sparkles background */}
                    <div className="absolute inset-0 rounded-3xl overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <Sparkles
                                key={i}
                                className="absolute h-6 w-6 text-white/40"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animation: `float-up ${2 + Math.random() * 1}s ease-out forwards`,
                                    animationDelay: `${i * 0.2}s`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="celebration-icon mb-4">
                            <Gift className="h-16 w-16 mx-auto text-white drop-shadow-lg" />
                        </div>

                        <h2 className="text-3xl md:text-4xl font-black text-white mb-2 drop-shadow-lg">
                            Parabéns!
                        </h2>

                        <div className="text-white">
                            <p className="text-5xl font-black mb-2 drop-shadow-lg">
                                +{points}
                            </p>
                            <p className="text-lg font-bold drop-shadow-lg">pontos!</p>
                        </div>

                        <p className="text-white/90 text-sm mt-3 drop-shadow-lg">
                            Você está acumulando prêmios 🎉
                        </p>
                    </div>
                </div>
            </div>

            {/* Floating confetti points */}
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="absolute floating-points pointer-events-none"
                    style={{
                        left: `calc(50% + ${(i - 4) * 30}px)`,
                        top: '50%',
                        animationDelay: `${i * 0.1}s`,
                    }}
                >
                    <span className="text-2xl font-black text-orange-500">+{Math.floor(points / 4)}</span>
                </div>
            ))}
        </div>
    );
}
