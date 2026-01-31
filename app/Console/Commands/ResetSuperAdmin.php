<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class ResetSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:reset-admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reseta ou cria o usuário Super Admin com as credenciais padrão';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = 'contato@oodelivery.online';
        $password = 'Bobela102030@';

        $this->info("Configurando Super Admin...");

        // 1. Tenta encontrar pelo email novo
        $user = User::where('email', $email)->first();

        // 2. Se não achar, tenta encontrar pelo antigo (admin@happyplace.com) para migrar
        if (!$user) {
            $user = User::where('email', 'admin@happyplace.com')->first();
            if ($user) {
                $this->info("Usuário antigo encontrado. Atualizando email...");
                $user->email = $email;
            }
        }

        if ($user) {
            $user->name = 'Super Admin';
            $user->password = Hash::make($password);
            $user->role = 'super_admin';
            $user->save();
            $this->info("Usuario {$email} ATUALIZADO com sucesso.");
        } else {
            User::create([
                'name' => 'Super Admin',
                'email' => $email,
                'password' => Hash::make($password),
                'role' => 'super_admin',
            ]);
            $this->info("Usuario {$email} CRIADO com sucesso.");
        }

        $this->info("Senha definida: {$password}");
    }
}
