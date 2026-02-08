import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
    server: {
        cors: {
            origin: '*',
        },
        host: '127.0.0.1',
    },
    build: {
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                            return 'vendor-react';
                        }
                        if (id.includes('lucide-react')) {
                            return 'vendor-icons';
                        }
                        if (id.includes('recharts')) {
                            return 'vendor-charts';
                        }
                        if (id.includes('framer-motion')) {
                            return 'vendor-animation';
                        }
                        if (id.includes('axios') || id.includes('lodash')) {
                            return 'vendor-utils';
                        }
                        return 'vendor-others';
                    }
                },
            },
        },
    },
});
