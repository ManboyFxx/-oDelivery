# 🚀 PRÓXIMOS PASSOS - FASE 3

## ✅ O Que Já Foi Feito (Fase 1 + 2)

- ✅ Models Eloquent completos
- ✅ Migrações do banco de dados
- ✅ Middleware de proteção
- ✅ Login com checkbox "Sou Entregador"
- ✅ Autenticação e redirecionamento funcionando
- ✅ Dashboard vazio e funcional

---

## 📋 FASE 3: Layout e Navegação (Próxima)

### Tarefas:

#### 1. **Criar MotoboyLayout.tsx**
Arquivo: `resources/js/Layouts/MotoboyLayout.tsx`

Deve incluir:
- Sidebar esquerda com navegação
- Top bar com status/avatar
- Menu links:
  - Dashboard
  - Pedidos
  - Histórico
  - Métricas
  - Perfil
  - Notificações
  - Logout

Layout responsivo para mobile/desktop.

#### 2. **Criar Componentes de Navegação**
Arquivos:
- `resources/js/Components/Motoboy/Sidebar.tsx`
- `resources/js/Components/Motoboy/TopBar.tsx`
- `resources/js/Components/Motoboy/NavLink.tsx`

#### 3. **Modificar Dashboard.tsx**
- Usar MotoboyLayout ao invés de AuthenticatedLayout
- Manter cards de KPIs
- Remover mensagem "Em construção"

#### 4. **Criar Páginas Vazias** (para estrutura)
```
resources/js/Pages/Motoboy/
├─ Dashboard.tsx (modificar)
├─ Profile.tsx (nova)
├─ Orders/
│  ├─ Index.tsx (nova)
│  └─ Show.tsx (nova)
├─ History.tsx (nova)
├─ Metrics.tsx (nova)
└─ Notifications.tsx (nova)
```

#### 5. **Adicionar Rotas no web.php**
```php
Route::middleware(['auth', 'is_motoboy', 'check_subscription'])
    ->prefix('/motoboy')
    ->name('motoboy.')
    ->group(function () {
        Route::get('/dashboard', [MotoboysController::class, 'dashboard'])->name('dashboard');
        Route::get('/perfil', [MotoboysController::class, 'profile'])->name('profile');
        Route::get('/pedidos', [MotoboysController::class, 'orders'])->name('orders.index');
        Route::get('/pedidos/{order}', [MotoboysController::class, 'showOrder'])->name('orders.show');
        Route::get('/historico', [MotoboysController::class, 'history'])->name('history.index');
        Route::get('/metricas', [MotoboysController::class, 'metrics'])->name('metrics.index');
        Route::get('/notificacoes', [MotoboysController::class, 'notifications'])->name('notifications.index');
    });
```

---

## 🎨 Design Sugerido

### **Sidebar Esquerda**
- Logo/Ícone da marca
- Menu links com ícones
- Status toggle (ONLINE/OFFLINE) destacado
- Foto de perfil com nome
- Dropdown do usuário (Sair, Configurações)

### **Top Bar**
- Breadcrumb ou título da página
- Notificações (bell icon)
- Status atual do motoboy
- Hora/Data

### **Cores**
- Primária: #ff3d03 (laranja)
- Secundária: Cinza (text)
- Fundo: Branco/Light gray

### **Componentes Tailwind**
- Use Headless UI para dropdowns
- Lucide React para ícones
- Tailwind CSS para styling

---

## 📝 Exemplo de Sidebar

```tsx
// resources/js/Layouts/MotoboyLayout.tsx
import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X, LogOut, Settings } from 'lucide-react';

export default function MotoboyLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { url, auth } = usePage().props;
    const user = auth.user;

    const menuItems = [
        { label: 'Dashboard', icon: 'Home', href: route('motoboy.dashboard') },
        { label: 'Pedidos', icon: 'Package', href: route('motoboy.orders.index') },
        { label: 'Histórico', icon: 'Clock', href: route('motoboy.history.index') },
        { label: 'Métricas', icon: 'BarChart', href: route('motoboy.metrics.index') },
        { label: 'Perfil', icon: 'User', href: route('motoboy.profile') },
        { label: 'Notificações', icon: 'Bell', href: route('motoboy.notifications.index') },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300`}>
                {/* Logo */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    {sidebarOpen && <h1 className="font-black text-[#ff3d03]">ÓoDelivery</h1>}
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Status Toggle */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        {sidebarOpen && <span className="text-sm font-bold">OFFLINE</span>}
                    </div>
                </div>

                {/* Menu Items */}
                <nav className="space-y-2 p-4">
                    {menuItems.map((item) => (
                        <Link key={item.href} href={item.href} className="...">
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* User Profile */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    {/* User info and logout */}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8">
                    {/* Breadcrumb/Title */}
                </header>

                {/* Content */}
                <div className="p-8">{children}</div>
            </main>
        </div>
    );
}
```

---

## 🔗 Próximas Rotas a Adicionar

```php
Route::get('/perfil', ProfileController@show)->name('profile');
Route::put('/perfil', ProfileController@update)->name('profile.update');
Route::post('/perfil/avatar', ProfileController@uploadAvatar)->name('profile.avatar');

Route::get('/pedidos', OrderController@index)->name('orders.index');
Route::get('/pedidos/{order}', OrderController@show)->name('orders.show');
Route::post('/pedidos/{order}/aceitar', OrderController@accept)->name('orders.accept');
Route::post('/pedidos/{order}/recusar', OrderController@reject)->name('orders.reject');
Route::post('/pedidos/{order}/iniciar', OrderController@start)->name('orders.start');
Route::post('/pedidos/{order}/entregar', OrderController@deliver)->name('orders.deliver');

Route::get('/historico', HistoryController@index)->name('history.index');

Route::get('/metricas', MetricsController@index)->name('metrics.index');

Route::get('/notificacoes', NotificationController@index)->name('notifications.index');
Route::post('/notificacoes/{id}/ler', NotificationController@markAsRead)->name('notifications.read');

// API para mobile
Route::post('/api/motoboy/location', LocationController@store);
Route::get('/api/motoboy/location/history', LocationController@history);
```

---

## 💾 Controllers a Criar Próximo

```
app/Http/Controllers/Motoboy/
├─ MotoboysController.php (expandir)
├─ ProfileController.php (novo)
├─ OrderController.php (novo)
├─ HistoryController.php (novo)
├─ MetricsController.php (novo)
├─ NotificationController.php (novo)
└─ LocationController.php (novo)
```

---

## 🎯 Checklist para Começar Fase 3

- [ ] Criar `MotoboyLayout.tsx`
- [ ] Criar componentes de navegação (Sidebar, TopBar)
- [ ] Modificar `Dashboard.tsx` para usar novo layout
- [ ] Criar páginas vazias para structure
- [ ] Adicionar rotas em `web.php`
- [ ] Expandir `MotoboysController`
- [ ] Testar navegação entre páginas
- [ ] Verificar responsividade mobile

---

## 🚀 Comando para Começar

Quando estiver pronto, me diga:
```
Começar FASE 3 - Layout e Navegação
```

E vou criar:
1. MotoboyLayout completo
2. Todos os componentes
3. Todas as páginas
4. Todas as rotas
5. Testes

---

## 📞 Suporte

Se tiver dúvidas sobre:
- Design/CSS
- Componentes React
- Lógica de routing
- Estrutura de pastas

Me avisa que ajudamos!

---

**Documento Preparado em:** 01/02/2026
**Próxima Fase:** 3 (Layout e Navegação)
**Tempo Estimado:** 4-5 horas
