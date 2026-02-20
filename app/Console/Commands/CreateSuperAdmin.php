<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class CreateSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create-super-admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new Super Admin user for platform management (Support/Sales)';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Creating a new Super Admin...');

        $name = $this->ask('Name');
        $email = $this->ask('Email');

        while (User::where('email', $email)->exists()) {
            $this->error('User with this email already exists.');
            $email = $this->ask('Email');
        }

        $phone = $this->ask('Phone (optional)');

        $password = $this->secret('Password');
        $confirmPassword = $this->secret('Confirm Password');

        while ($password !== $confirmPassword) {
            $this->error('Passwords do not match.');
            $password = $this->secret('Password');
            $confirmPassword = $this->secret('Confirm Password');
        }

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'phone' => $phone,
            'password' => Hash::make($password),
            'role' => 'super_admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $this->info("Super Admin '{$user->name}' created successfully!");
        $this->info("Email: {$user->email}");
        $this->info("Role: super_admin");

        return Command::SUCCESS;
    }
}
