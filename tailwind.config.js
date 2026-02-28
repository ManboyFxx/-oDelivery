import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    darkMode: 'class',

    theme: {
        extend: {
            indigo: {
                ...defaultTheme.colors.indigo,
                500: '#ff3d03', // Primary brand color
                600: '#e53703', // Hover
                700: '#cc3102', // Active
            },
            primary: {
                DEFAULT: 'var(--primary-color)',
                500: 'var(--primary-color)',
                600: 'var(--primary-hover)', // We can calculate this or use a filter
                700: 'var(--primary-active)',
            },
            colors: {
                'premium-dark': '#0f1012',
                'premium-card': '#1a1b1e',
                'light-card': '#0B1228',
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', ...defaultTheme.fontFamily.sans],
            },
        },
    },

    plugins: [forms],
};
