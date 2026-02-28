<?php

namespace App\Broadcasting;

use Illuminate\Broadcasting\Broadcasters\Broadcaster;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * FASE 2 – ESCALA REAL: Broadcaster customizado via HTTP.
 * 
 * Motivo: Impossibilidade de instalar o SDK oficial (pusher/pusher-php-server)
 * em ambiente compartilhado sem SSH e com restrições locais de SSL.
 * 
 * Este Broadcaster faz chamadas diretas para a API REST do Pusher.
 * 
 * Agente: @architect
 */
class LightPusherBroadcaster extends Broadcaster
{
    protected array $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    /**
     * Autenticação de canais privados (necessária para private-tenant.{id}).
     */
    public function auth($request)
    {
        $channelName = $request->channel_name;
        $socketId = $request->socket_id;

        $stringToSign = "{$socketId}:{$channelName}";
        $signature = hash_hmac('sha256', $stringToSign, $this->config['secret']);

        return [
            'auth' => "{$this->config['key']}:{$signature}"
        ];
    }

    /**
     * Verifica se o usuário pode acessar o canal privado.
     */
    public function validAuthenticationResponse($request, $result)
    {
        return json_encode($result);
    }

    /**
     * Dispara o evento para a API REST do Pusher.
     */
    public function broadcast(array $channels, $event, array $payload = [])
    {
        $appId = $this->config['app_id'];
        $key = $this->config['key'];
        $secret = $this->config['secret'];
        $cluster = $this->config['cluster'] ?? 'mt1';

        $host = "api-{$cluster}.pusher.com";
        $path = "/apps/{$appId}/events";

        $body = json_encode([
            'name' => $event,
            'channels' => $channels,
            'data' => json_encode($payload),
        ]);

        $timestamp = time();
        $bodyMd5 = md5($body);

        $queryString = "auth_key={$key}&auth_timestamp={$timestamp}&auth_version=1.0&body_md5={$bodyMd5}";
        $authString = "POST\n{$path}\n{$queryString}";
        $signature = hash_hmac('sha256', $authString, $secret);

        $url = "https://{$host}{$path}?{$queryString}&auth_signature={$signature}";

        try {
            $response = Http::timeout(5)->post($url, json_decode($body, true));

            if ($response->failed()) {
                Log::error('LightPusherBroadcaster: Falha ao enviar evento', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('LightPusherBroadcaster: Erro de conexão', ['error' => $e->getMessage()]);
        }
    }
}
