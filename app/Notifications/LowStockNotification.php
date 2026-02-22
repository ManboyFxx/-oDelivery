<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Collection;

class LowStockNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected Collection $ingredients;
    protected $tenant;

    /**
     * Create a new notification instance.
     */
    public function __construct($ingredients, $tenant = null)
    {
        $this->ingredients = $ingredients instanceof Collection ? $ingredients : collect([$ingredients]);
        $this->tenant = $tenant ?? ($ingredients instanceof Collection ? $ingredients->first()?->tenant : $ingredients->tenant);
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', \App\Channels\OneSignalChannel::class];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $ingredientsList = $this->ingredients->map(function ($ingredient) {
            return [
                'id' => $ingredient->id,
                'name' => $ingredient->name,
                'current_stock' => $ingredient->stock ?? 0,
                'min_stock' => $ingredient->min_stock,
            ];
        })->toArray();

        return [
            'type' => 'low_stock',
            'title' => 'Alerta de Estoque Baixo',
            'message' => count($ingredientsList) === 1
                ? "O ingrediente {$ingredientsList[0]['name']} está com estoque baixo."
                : count($ingredientsList) . ' ingredientes estão com estoque baixo.',
            'ingredients' => $ingredientsList,
            'tenant_id' => $this->tenant?->id,
            'tenant_name' => $this->tenant?->name,
        ];
    }

    public function toOneSignal($notifiable)
    {
        $ingredientsList = $this->ingredients->map(fn($i) => $i->name)->implode(', ');
        $message = count($this->ingredients) === 1
            ? "O ingrediente {$ingredientsList} está com estoque baixo."
            : count($this->ingredients) . ' ingredientes estão com estoque baixo.';

        return [
            'title' => 'Alerta de Estoque Baixo',
            'message' => $message,
            'url' => '/inventory',
            'data' => [
                'type' => 'low_stock',
            ],
        ];
    }
}
