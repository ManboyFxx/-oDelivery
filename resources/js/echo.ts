import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Configuração do Pusher (ou mude para 'ably' se usar Ably)
// Usa a chave import.meta.env.VITE_BROADCAST_DRIVER (que mapeia para BROADCAST_DRIVER no Laravel 11)
// ou assume 'pusher' se as chaves PUSHER existirem
const broadcastDriver = (import.meta.env.VITE_BROADCAST_DRIVER || (import.meta.env.VITE_PUSHER_APP_KEY ? 'pusher' : 'log')) as string;

// Criar instância do Echo baseado no driver
let echo: any;

if (broadcastDriver === 'pusher') {
    const pusherConfig: any = {
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
        forceTLS: import.meta.env.VITE_PUSHER_SCHEME === 'https',
    };

    if (import.meta.env.VITE_PUSHER_HOST) {
        pusherConfig.wsHost = import.meta.env.VITE_PUSHER_HOST;
        pusherConfig.wsPort = import.meta.env.VITE_PUSHER_PORT || 6001;
        pusherConfig.wssPort = import.meta.env.VITE_PUSHER_PORT || 443;
    }

    echo = new Echo({
        broadcaster: 'pusher' as any,
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: pusherConfig.cluster,
        wsHost: pusherConfig.wsHost,
        wsPort: pusherConfig.wsPort,
        wssPort: pusherConfig.wssPort,
        authEndpoint: '/broadcasting/auth',
        useTLS: pusherConfig.forceTLS,
        forceTLS: pusherConfig.forceTLS,
        client: new Pusher(import.meta.env.VITE_PUSHER_APP_KEY!, {
            cluster: pusherConfig.cluster,
            wsHost: pusherConfig.wsHost,
            wsPort: pusherConfig.wsPort,
            wssPort: pusherConfig.wssPort,
            forceTLS: pusherConfig.forceTLS,
        } as any),
    } as any);
} else if (broadcastDriver === 'ably') {
    echo = new Echo({
        broadcaster: 'ably' as any,
        key: import.meta.env.VITE_ABLY_PUBLIC_KEY,
    } as any);
} else {
    // Log driver for development
    // Log driver for development - use 'null' to avoid client error
    echo = new Echo({
        broadcaster: 'null' as any,
    } as any);
}

console.log(`🔊 Broadcasting initialized with driver: ${broadcastDriver}`);

export default echo;
