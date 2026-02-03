import React from 'react';

export default function LogoSvg({ className = "w-20 h-20" }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 200"
            fill="none"
            className={className}
        >
            {/* Left loop with checkmark */}
            <path d="M 50 100 C 50 70, 70 50, 100 50 C 130 50, 150 70, 150 100 C 150 130, 130 150, 100 150 C 70 150, 50 130, 50 100 Z" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />

            {/* Right loop with circular arrow */}
            <path d="M 100 50 C 130 50, 150 70, 150 100 C 150 130, 130 150, 100 150 C 130 150, 150 130, 150 100 C 150 70, 130 50, 100 50" fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" />

            {/* Infinity symbol base */}
            <path d="M 40 100 C 40 65, 65 40, 85 40 C 105 40, 115 55, 115 70 C 115 55, 125 40, 145 40 C 165 40, 190 65, 190 100 C 190 135, 165 160, 145 160 C 125 160, 115 145, 115 130 C 115 145, 105 160, 85 160 C 65 160, 40 135, 40 100 Z" fill="currentColor" />

            {/* Checkmark in left loop - Keep White for Contrast */}
            <path d="M 70 95 L 85 110 L 110 75" fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

            {/* Circular arrows in right loop - Keep White */}
            <circle cx="145" cy="100" r="15" fill="none" stroke="white" strokeWidth="5" strokeDasharray="50 10" />
            <path d="M 155 85 L 160 80 L 165 85" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

            {/* Steam/heat lines on top */}
            <path d="M 85 25 Q 85 15, 90 10" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            <path d="M 100 20 Q 100 10, 105 5" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
            <path d="M 115 25 Q 115 15, 120 10" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </svg>
    );
}
