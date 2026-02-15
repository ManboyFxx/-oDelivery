# Story 004: Concluir Painel do Motoboy

**ID:** 3.1
**Status:** Done
**Prioridade:** Alta
**Responsável:** @dev (Dex)

## 📋 Descrição
Como entregador, quero poder aceitar pedidos, iniciar rotas de entrega e confirmar o recebimento pelo cliente de forma intuitiva no meu painel, para que eu possa gerenciar meu trabalho com eficiência.

## 🎯 Critérios de Aceite
- [ ] O botão "Aceitar" no Dashboard deve atribuir o pedido ao motoboy logado e mudar status para `motoboy_accepted`.
- [ ] A página de listagem de pedidos deve mostrar pedidos "Em andamento" e "Histórico".
- [ ] A página de detalhes do pedido deve exibir endereço completo (com link para Maps) e lista de itens.
- [ ] O motoboy deve poder alternar o status do pedido entre `motoboy_accepted` -> `out_for_delivery` -> `delivered`.
- [ ] O Dashboard deve atualizar o valor de "Ganhos Hoje" ao finalizar uma entrega.

## 🛠️ Notas de Desenvolvimento (Contexto Técnico)
- **Rotas**: Usar o prefixo `/motoboy`.
- **Service**: Usar `MotoboyOrderService.php` para todas as mutações de status.
- **Frontend**: Utilizar `Lucide React` para ícones e `Axios` para chamadas API.
- **Layout**: Manter o `MotoboyLayout` já existente.

## 📝 Change Log
- 2026-02-15: Story criada pelo Orion (Orchestrator).
