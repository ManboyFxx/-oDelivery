# Implementação de Login com Google no oDelivery

## Índice
1. [Introdução](#introdução)
2. [Benefícios da Integração com Google](#benefícios-da-integração-com-google)
3. [Requisitos](#requisitos)
4. [Passo a Passo para Implementação](#passo-a-passo-para-implementação)
5. [Configuração do Console do Google Cloud](#configuração-do-console-do-google-cloud)
6. [Configuração no Laravel](#configuração-no-laravel)
7. [Rotas e Controladores](#rotas-e-controladores)
8. [Frontend](#frontend)
9. [Considerações de Segurança](#considerações-de-segurança)
10. [Solução de Problemas](#solução-de-problemas)

## Introdução

Esta documentação detalha o processo de implementação do login com Google na aplicação oDelivery. A autenticação OAuth com Google permite que os usuários façam login usando suas contas do Google, proporcionando uma experiência de usuário simplificada e aumentando a segurança.

## Benefícios da Integração com Google

### Facilidade de Uso
- Os usuários podem fazer login rapidamente com credenciais que já conhecem
- Reduz a barreira de entrada para novos usuários
- Elimina a necessidade de lembrar senhas adicionais

### Gerenciamento de Conta
- Recuperação de senha facilitada através do Google
- Menos solicitações de redefinição de senha
- Integração com o sistema de notificações do Google

### Segurança Aprimorada
- Validação robusta de identidade por meio do Google
- Menor superfície de ataque (menos credenciais armazenadas localmente)
- Autenticação de dois fatores disponível automaticamente para contas do Google
- Monitoramento de atividades suspeitas pelo Google

### Integração com Serviços Google
- Possibilidade de integrar com Gmail, Google Drive, Google Maps e outros serviços
- Melhor experiência para funcionalidades que utilizam APIs do Google

## Requisitos

Antes de começar, você precisa ter:

1. Uma conta do Google Cloud Platform
2. Um projeto criado no Console do Google Cloud
3. O pacote `laravel/socialite` instalado
4. Configurações adequadas no arquivo `.env`

## Passo a Passo para Implementação

### 1. Instalação do Pacote Socialite

```bash
composer require laravel/socialite
```

### 2. Registro do Provedor de Serviço

O Socialite já está registrado automaticamente no Laravel 5.1+, mas se necessário, adicione ao arquivo `config/app.php`:

```php
'providers' => [
    // Outros provedores de serviço
    Laravel\Socialite\SocialiteServiceProvider::class,
],

'aliases' => [
    // Outros aliases
    'Socialite' => Laravel\Socialite\Facades\Socialite::class,
],
```

### 3. Configuração das Credenciais

Adicione as credenciais do Google ao arquivo `config/services.php`:

```php
'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URI'),
],
```

### 4. Adição das Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env`:

```env
GOOGLE_CLIENT_ID=seu_client_id_aqui
GOOGLE_CLIENT_SECRET=seu_client_secret_aqui
GOOGLE_REDIRECT_URI=http://seudominio.com/login/google/callback
```

## Configuração do Console do Google Cloud

### 1. Criar Projeto no Google Cloud Console

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Clique em "Selecionar projeto" e depois em "Novo projeto"
3. Dê um nome ao projeto e clique em "Criar"

### 2. Habilitar a API do Google OAuth 2.0

1. No menu lateral, vá até "APIs e Serviços" > "Biblioteca"
2. Procure por "Google+ API" ou "People API" e habilite
3. No menu lateral, vá até "APIs e Serviços" > "Credenciais"

### 3. Criar Credenciais OAuth 2.0

1. Clique em "Criar credenciais" > "ID do cliente do OAuth"
2. Selecione "Aplicativo Web" como tipo
3. Defina um nome para a credencial
4. Em "URIs de redirecionamento autorizados", adicione:
   - `http://seudominio.com/login/google/callback`
   - `http://localhost:8000/login/google/callback` (para desenvolvimento)

### 4. Obter Client ID e Client Secret

Após criar as credenciais, copie o Client ID e Client Secret para usar nas configurações do Laravel.

## Configuração no Laravel

### 1. Atualizar o Modelo de Usuário

Certifique-se de que o modelo de usuário possa armazenar informações adicionais do Google:

```php
// app/Models/User.php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'google_id', // Adicionando campo para armazenar ID do Google
        'avatar',    // Campo opcional para armazenar avatar do Google
    ];

    // Restante do modelo...
}
```

### 2. Rodar Migração para Adicionar Campos

Crie uma migração para adicionar os campos necessários:

```bash
php artisan make:migration add_google_fields_to_users_table
```

```php
// database/migrations/xxxx_xx_xx_xxxxxx_add_google_fields_to_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('google_id')->nullable()->unique();
            $table->string('avatar')->nullable();
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['google_id', 'avatar']);
        });
    }
};
```

Execute a migração:

```bash
php artisan migrate
```

## Rotas e Controladores

### 1. Adicionar Rotas

Adicione as rotas para login com Google no arquivo `routes/web.php`:

```php
use App\Http\Controllers\Auth\LoginController;

Route::get('/login/google', [LoginController::class, 'redirectToGoogle'])->name('login.google');
Route::get('/login/google/callback', [LoginController::class, 'handleGoogleCallback']);
```

### 2. Criar Controlador

Crie um controlador para lidar com o login do Google:

```php
// app/Http/Controllers/Auth/LoginController.php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class LoginController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $user = Socialite::driver('google')->user();
            
            // Verificar se o usuário já existe no banco de dados
            $existingUser = User::where('google_id', $user->id)->first();
            
            if ($existingUser) {
                // Login do usuário existente
                Auth::login($existingUser);
            } else {
                // Verificar se já existe um usuário com este email
                $existingEmailUser = User::where('email', $user->email)->first();
                
                if ($existingEmailUser) {
                    // Associar a conta do Google ao usuário existente
                    $existingEmailUser->update([
                        'google_id' => $user->id,
                        'avatar' => $user->avatar
                    ]);
                    
                    Auth::login($existingEmailUser);
                } else {
                    // Criar novo usuário
                    $newUser = User::create([
                        'name' => $user->name,
                        'email' => $user->email,
                        'google_id' => $user->id,
                        'avatar' => $user->avatar,
                        'password' => encrypt(''), // Senha vazia para contas sociais
                    ]);
                    
                    Auth::login($newUser);
                }
            }

            return redirect()->intended('/dashboard');
        } catch (\Exception $e) {
            \Log::error('Erro no login com Google: ' . $e->getMessage());
            return redirect('/login')->withErrors(['error' => 'Falha no login com Google.']);
        }
    }
}
```

## Frontend

### 1. Botão de Login com Google

Adicione um botão de login com Google na página de login:

```html
<!-- resources/views/auth/login.blade.php -->
<div class="flex items-center justify-center">
    <a href="{{ route('login.google') }}" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center">
        <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
            <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
            <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
            <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
        </svg>
        Entrar com Google
    </a>
</div>
```

Para aplicações Inertia/React, o componente seria semelhante:

```jsx
// resources/js/Pages/Auth/Login.jsx
import { Link } from '@inertiajs/react';

export default function Login() {
    return (
        <div className="flex items-center justify-center">
            <Link 
                href={route('login.google')} 
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded flex items-center"
            >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                    <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                    <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
                    <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                </svg>
                Entrar com Google
            </Link>
        </div>
    );
}
```

## Considerações de Segurança

### 1. Proteger Rotas de Callback
Certifique-se de que as rotas de callback OAuth são protegidas contra CSRF e outras vulnerabilidades.

### 2. Validar Informações do Usuário
Sempre valide e sanitize as informações recebidas do provedor OAuth antes de armazená-las.

### 3. Armazenamento Adequado de Tokens
Se você precisar armazenar tokens de acesso, faça isso de forma segura com criptografia adequada.

### 4. Política de Privacidade
Certifique-se de ter uma política de privacidade clara sobre como os dados dos usuários serão usados.

## Solução de Problemas

### Erro: "SSL certificate verify failed"
Este erro ocorre quando o ambiente não consegue verificar o certificado SSL. Para resolver:

1. Atualize o cacert.pem no seu ambiente
2. Ou configure o PHP para ignorar temporariamente a verificação (não recomendado para produção)

### Erro: "Invalid Scopes"
Verifique se os escopos solicitados estão corretos e habilitados no Console do Google Cloud.

### Erro: "redirect_uri_mismatch"
Certifique-se de que o URI de redirecionamento configurado no Google Cloud Console corresponde exatamente ao definido no Laravel.

### Permissões de API
Certifique-se de que as APIs necessárias estão habilitadas no Console do Google Cloud:
- People API (para obter informações do perfil)
- Google+ API (se ainda estiver usando)

## Conclusão

A implementação do login com Google melhora significativamente a experiência do usuário e a segurança da aplicação. Siga esta documentação cuidadosamente para garantir uma implementação bem-sucedida.

Lembre-se de testar a funcionalidade em diferentes ambientes (desenvolvimento, homologação e produção) e de manter as credenciais do Google seguras e atualizadas.