# Story 005: Demonstrativo do Sistema (Modo Demo)

**ID:** 5.1
**Status:** In Progress
**Prioridade:** Alta
**Responsável:** @dev (Antigravity)

## 📋 Descrição

Como um visitante (potencial cliente), quero poder acessar um ambiente de demonstração completo com um único clique, para ver como o sistema funciona por dentro (Dashboard, Cardápio, Gestão de Motoboys) sem precisar criar uma conta ou configurar dados.

## 🎯 Critérios de Aceite

- [ ] Criar um `DemoSeeder` que populé um tenant de teste ("OoDelivery Demo") com dados realistas.
- [ ] Implementar um botão "Acessar Demo" na Landing Page.
- [ ] O botão "Acessar Demo" deve realizar login automático em um usuário pré-definido do tenant demo (`demo@oodelivery.online`).
- [ ] O Dashboard do tenant demo deve mostrar métricas realistas (faturamento fictício, pedidos concluídos).
- [ ] Implementar um aviso (banner) no topo informando: "Você está no ambiente de demonstração. Os dados são resetados periodicamente."

## 🛠️ Notas de Desenvolvimento (Contexto Técnico)

- **Tenant ID**: Fixar um ID ou nome amigável para o tenant demo.
- **Seeder**: O `DemoSeeder` deve ser idempotente (usar `updateOrCreate`).
- **Autenticação**: Criar uma rota `/demo-login` que autentica o usuário via `Auth::login()`.
- **Diferenciação**: Usar uma variavel de ambiente ou config para identificar se o tenant atual é o "demo".

## 📝 Change Log

- 2026-02-22: Story criada pelo Antigravity seguindo o padrão AIOS.
