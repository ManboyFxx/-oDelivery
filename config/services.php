<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'evolution' => [
        'url' => env('EVOLUTION_API_URL', 'http://104.243.41.159:8080'),
        'api_key' => env('EVOLUTION_API_KEY'),
        'webhook_url' => env('APP_URL') . '/api/webhooks/evolution',
        // FASE 1 – BLINDAGEM: Segredo HMAC para validar webhooks recebidos da Evolution API
        'webhook_secret' => env('EVOLUTION_WEBHOOK_SECRET'),
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'price_unified_monthly' => env('STRIPE_PRICE_UNIFIED_MONTHLY'),
        'price_unified_yearly' => env('STRIPE_PRICE_UNIFIED_YEARLY'),
        'price_basic_monthly' => env('STRIPE_PRICE_BASIC_MONTHLY'),
        'price_basic_yearly' => env('STRIPE_PRICE_BASIC_YEARLY'),
        'price_pro_monthly' => env('STRIPE_PRICE_PRO_MONTHLY'),
        'price_pro_yearly' => env('STRIPE_PRICE_PRO_YEARLY'),
        'price_custom_monthly' => env('STRIPE_PRICE_CUSTOM_MONTHLY'),
        'price_custom_yearly' => env('STRIPE_PRICE_CUSTOM_YEARLY'),
    ],

    'mercadopago' => [
        'public_key' => env('MERCADOPAGO_PUBLIC_KEY'),
        'access_token' => env('MERCADOPAGO_ACCESS_TOKEN'),
    ],

    'payment' => [
        'default_gateway' => env('PAYMENT_GATEWAY', 'stripe'),
        'retry_attempts' => env('PAYMENT_RETRY_ATTEMPTS', 3),
        'retry_interval_days' => env('PAYMENT_RETRY_INTERVAL_DAYS', 2),
        'checkout_abandonment_hours' => env('CHECKOUT_ABANDONMENT_HOURS', 1),
    ],

    'onesignal' => [
        'app_id' => env('ONESIGNAL_APP_ID'),
        'rest_api_key' => env('ONESIGNAL_REST_API_KEY'),
        'safari_web_id' => env('ONESIGNAL_SAFARI_WEB_ID'),
    ],

];
