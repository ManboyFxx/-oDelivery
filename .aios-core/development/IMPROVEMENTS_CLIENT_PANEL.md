# Pontos de Melhoria: Painel do Cliente (Tenant)

Este documento lista sugestões de melhoria para o Painel Administrativo do Cliente (Tenant), abrangendo todas as rotas principais.

> [!IMPORTANT]
> **Sincronização com Menu Público:** Muitas das melhorias listadas neste documento impactam diretamente o **menu público** (loja online visível aos clientes). Alterações em áreas como Cardápio, Complementos, Categorias, Produtos, Cupons, Horários e Disponibilidade devem ser refletidas em tempo real no menu público para garantir consistência na experiência do cliente.
> 
> Ver também: [IMPROVEMENTS_PUBLIC_MENU.md](file:///c:/Users/Vertinho/Documents/Sistemas/OoDelivery/-oDelivery/.aios-core/development/IMPROVEMENTS_PUBLIC_MENU.md) para melhorias específicas da interface do cliente.


## 1. Dashboard (Visão Geral)

### UX e Visual
- [ ] **Onboarding Interativo:** Adicionar checklist de "Primeiros Passos" (Configurar Cardápio -> Impressora -> Link da Loja).
- [ ] **Comparativo de Métricas:** Implementar cálculo de % de crescimento vs. dia anterior nos cards de métricas.
- [ ] **Personalização:** Permitir ocultar/mostrar widgets específicos.

### Funcionalidades
- [ ] **Top Produtos Dinâmico:** Adicionar filtro de período (Hoje/Semana/Mês) no widget de Mais Vendidos.
- [ ] **Ações Rápidas:** Botões de atalho no topo: "Novo Pedido", "Fechar Caixa", "Pausar Loja".

## 2. Gestão de Pedidos (Kanban)

### Usabilidade
- [ ] **Drag & Drop:** Permitir arrastar cards entre colunas para mudança rápida de status.
- [ ] **Visualização Rápida (Drawer):** Modal lateral para ver detalhes do pedido sem sair do contexto do quadro.
- [ ] **Filtros Avançados:** Filtros por Bairro, Entregador e Forma de Pagamento.
- [ ] **Expedição em Massa:** Seleção múltipla para impressão de comandas ou despacho de motoboy.

### Técnico
- [ ] **Centralização de Polling:** Unificar lógica de busca de novos pedidos para evitar requisições duplicadas.

## 3. Gestão de Cardápio (Produtos/Categorias)

### Agilidade (Quick Actions)
- [ ] **Edição Rápida:** Permitir alterar **Preço** e **Disponibilidade (On/Off)** diretamente na listagem, sem abrir o formulário de edição.
- [ ] **Controle de Estoque Simples:** Botão "Esgotado" direto no card do produto.
- [ ] **Ações em Massa:** Checkbox para selecionar vários produtos e "Mudar Categoria" ou "Pausar Vendas".

### Organização
- [ ] **Reordenação Visual:** Implementar Drag & Drop para ordenar Categorias e Produtos como aparecem no cardápio digital.
- [ ] **Preview de Imagem:** Melhorar visualização das imagens na listagem (zoom ao passar o mouse).

## 4. Configurações da Loja

### Experiência de Configuração
- [ ] **Horários Visuais:** Substituir a lista de inputs por um "Agenda Visual" ou botão "Replicar para todos os dias".
- [ ] **Mapa de Entrega:** Se possível, integrar mapa para desenhar ou visualizar as zonas de entrega e raios (Google Maps/Mapbox).
- [ ] **Teste de Impressão:** Botão de "Imprimir Teste" com feedback real da conexão com a impressora térmica.

### Onboarding
- [ ] **Setup Wizard:** Criar um passo-a-passo guiado para a primeira configuração (Nome -> Logo -> Horário -> Entrega), essencial para novos clientes.

## 5. Financeiro e Relatórios

### Análise de Dados
- [ ] **Filtro de Data:** Adicionar seletor de período (Date Range Picker) para visualizar relatórios de qualquer intervalo, não apenas Mensal/Semanal fixo.
- [ ] **Detalhamento de Transação:** Ao clicar em uma transação, exibir os itens do pedido relacionado (Drawer lateral).

### Exportação
- [ ] **Exportar Relatórios:** Funcionalidade real de exportar para PDF (Fechamento de Caixa) e CSV (Contabilidade).
- [ ] **Gráficos Comparativos:** Adicionar gráfico comparando Vendas da Semana Atual vs. Semana Anterior.

## 6. Gestão de Entregadores (Motoboys)

### Monitoramento
- [ ] **Indicadores de Performance:** Exibir no card do entregador: "Entregas Hoje", "Tempo Médio", "Avaliação".
- [ ] **Status Online/Offline:** Toggle para indicar se o entregador está disponível no momento para receber pedidos.
- [ ] **Taxa Fixa Individual:** Permitir configurar uma taxa fixa diferente por entregador, se necessário.

## 7. Integrações (WhatsApp)

### Personalização
- [ ] **Editor de Mensagens:** Permitir que o cliente edite os textos das mensagens automáticas (atualmente parecem fixos). Ex: "Olá {nome}, seu pedido saiu!"
- [ ] **Teste de Envio:** Botão "Enviar Mensagem de Teste" para o próprio número do administrador para validar a conexão.
- [ ] **Status da Conexão:** Exibir status detalhado da sessão do WhatsApp (Bateria do celular, Qualidade da conexão) se a API permitir.

## 8. Gestão de Clientes (Customers)

### Informações e Análise
- [ ] **Histórico de Pedidos:** Exibir lista completa de pedidos do cliente ao clicar no card, com filtros por período.
- [ ] **Análise de Comportamento:** Mostrar métricas como "Ticket Médio", "Frequência de Compra", "Último Pedido".
- [ ] **Segmentação:** Tags ou categorias para clientes (VIP, Frequente, Novo, Inativo).

### Fidelidade
- [ ] **Visualização de Pontos:** Exibir saldo de pontos de fidelidade diretamente no card do cliente.
- [ ] **Ajuste Manual:** Permitir adicionar/remover pontos manualmente com justificativa (já existe na rota de fidelidade, integrar melhor).
- [ ] **Histórico de Resgates:** Mostrar quando e como os pontos foram utilizados.

### Comunicação
- [ ] **Envio Direto de WhatsApp:** Botão para enviar mensagem direta ao cliente via WhatsApp integrado.
- [ ] **Notas do Cliente:** Campo para adicionar observações internas sobre preferências ou restrições alimentares.

## 9. Gestão de Mesas (Tables)

### Visualização e Controle
- [ ] **Layout Visual:** Criar um mapa visual das mesas (grid ou canvas) mostrando status em tempo real (Livre/Ocupada/Reservada).
- [ ] **Código de Cores:** Usar cores distintas para cada status e tempo de ocupação (ex: verde=livre, amarelo=ocupada <1h, vermelho=ocupada >2h).
- [ ] **Detalhes Rápidos:** Ao clicar na mesa, mostrar drawer lateral com pedido atual, itens, tempo de ocupação e cliente.

### Operações
- [ ] **Transferência de Mesa:** Permitir mover pedido de uma mesa para outra com drag & drop ou botão.
- [ ] **Junção de Mesas:** Funcionalidade para unir mesas e seus pedidos.
- [ ] **Reservas:** Sistema de reserva de mesas com horário e nome do cliente.
- [ ] **Notificações:** Alertas quando uma mesa está ocupada há muito tempo.

## 10. PDV (Ponto de Venda)

### Interface e Usabilidade
- [ ] **Teclado Numérico Virtual:** Adicionar teclado numérico para facilitar entrada de valores em tablets.
- [ ] **Atalhos de Teclado:** Implementar shortcuts (F1-F12) para produtos mais vendidos ou ações frequentes.
- [ ] **Modo Tela Cheia:** Opção de visualização fullscreen para uso dedicado em tablets.
- [ ] **Busca Rápida:** Melhorar busca de produtos com suporte a código de barras ou SKU.

### Carrinho e Checkout
- [ ] **Edição de Item:** Permitir editar complementos de um item já adicionado ao carrinho.
- [ ] **Desconto por Item:** Aplicar desconto individual em produtos específicos, não apenas no total.
- [ ] **Divisão de Conta:** Funcionalidade para dividir a conta entre múltiplos clientes ou formas de pagamento.
- [ ] **Impressão Parcial:** Imprimir comanda de itens específicos sem fechar a mesa.

### Gestão de Pedidos
- [ ] **Pedidos Salvos:** Salvar pedidos em andamento para retomar depois (útil em caso de interrupção).
- [ ] **Histórico de Sessão:** Ver todos os pedidos fechados na sessão atual do PDV.

## 11. Cozinha (Kitchen Display)

### Visualização e Organização
- [ ] **Modo Kanban Aprimorado:** Colunas configuráveis (Novo → Preparando → Pronto → Entregue).
- [ ] **Priorização Visual:** Destacar pedidos urgentes ou com tempo de espera acima do normal.
- [ ] **Filtros por Tipo:** Separar visualização por tipo de pedido (Delivery, Mesa, Balcão).
- [ ] **Agrupamento:** Agrupar itens iguais de pedidos diferentes para otimizar preparo.

### Operação
- [ ] **Timer Automático:** Iniciar contador automático ao mover para "Preparando".
- [ ] **Notificação Sonora:** Alertas sonoros para novos pedidos ou pedidos atrasados.
- [ ] **Impressão Automática:** Opção de imprimir automaticamente comandas ao receber novo pedido.
- [ ] **Modo Tela Cheia:** Visualização dedicada para TV/monitor na cozinha.

### Comunicação
- [ ] **Chat com Salão:** Sistema de mensagens rápidas entre cozinha e atendimento.
- [ ] **Marcar Item Faltante:** Botão para sinalizar quando um ingrediente acabou.

## 12. Funcionários (Employees)

### Gestão de Acesso
- [ ] **Permissões Granulares:** Definir permissões específicas por módulo (ex: pode ver financeiro mas não editar).
- [ ] **Perfis Pré-definidos:** Templates de permissões (Gerente, Atendente, Cozinheiro).
- [ ] **Histórico de Ações:** Log de atividades importantes realizadas por cada funcionário.

### Produtividade
- [ ] **Relatório de Performance:** Métricas por funcionário (pedidos atendidos, tempo médio, vendas geradas).
- [ ] **Controle de Ponto:** Registro de entrada/saída para controle de jornada.
- [ ] **Metas e Comissões:** Sistema de metas de vendas e cálculo de comissões.

### Comunicação
- [ ] **Notificações Internas:** Sistema de avisos e comunicados para a equipe.
- [ ] **Troca de Turno:** Checklist de passagem de turno com pendências.

## 13. Estoque (Stock)

### Controle e Monitoramento
- [ ] **Alertas de Estoque Baixo:** Notificações automáticas quando produtos atingirem nível mínimo.
- [ ] **Previsão de Consumo:** Calcular estimativa de quando o estoque vai acabar baseado no histórico.
- [ ] **Categorização:** Organizar produtos por categoria/fornecedor para facilitar gestão.
- [ ] **Código de Barras:** Suporte a leitura de código de barras para entrada/saída de estoque.

### Movimentações
- [ ] **Histórico Detalhado:** Registro completo de todas as movimentações (entrada, saída, ajuste, perda).
- [ ] **Motivos de Ajuste:** Obrigar justificativa em ajustes manuais de estoque.
- [ ] **Inventário:** Funcionalidade de contagem de estoque com comparação vs. sistema.
- [ ] **Transferência entre Locais:** Se houver múltiplos pontos, permitir transferência de estoque.

### Integração
- [ ] **Sincronização com Vendas:** Baixa automática de estoque ao confirmar pedido.
- [ ] **Receitas/Fichas Técnicas:** Vincular produtos compostos aos ingredientes para baixa automática.
- [ ] **Relatório de Perdas:** Análise de produtos com maior índice de perda/vencimento.

## 14. Cupons (Coupons)

### Criação e Gestão
- [ ] **Templates de Cupons:** Modelos pré-configurados (Primeira Compra, Aniversário, Black Friday).
- [ ] **Condições Avançadas:** Regras como "válido apenas para categoria X" ou "mínimo de Y itens".
- [ ] **Cupons Automáticos:** Geração automática para clientes que atingirem critérios (ex: 10º pedido).
- [ ] **Limite por Cliente:** Restringir uso a 1x por cliente ou X usos por CPF/telefone.

### Análise
- [ ] **Relatório de Performance:** Mostrar quantas vezes cada cupom foi usado e receita gerada/perdida.
- [ ] **Taxa de Conversão:** Quantos cupons gerados vs. efetivamente utilizados.
- [ ] **ROI de Campanhas:** Análise de retorno sobre investimento em promoções.

### Distribuição
- [ ] **Compartilhamento Direto:** Gerar link ou QR code do cupom para compartilhar em redes sociais.
- [ ] **Envio por WhatsApp:** Integração para enviar cupons diretamente aos clientes.

## 15. Complementos (Complements)

### Organização e Usabilidade
- [ ] **Categorização de Grupos:** Organizar grupos de complementos por tipo (Proteínas, Molhos, Adicionais).
- [ ] **Reordenação Visual:** Drag & drop para ordenar grupos e opções como aparecem no cardápio.
- [ ] **Ordenação de Opcionais:** Permitir reordenar os opcionais dentro de cada grupo de complementos (drag & drop ou botões de seta cima/baixo).
- [ ] **Duplicação Rápida:** Melhorar UX do botão de duplicar grupo (já existe, mas pode ter confirmação visual melhor).
- [ ] **Preview do Cardápio:** Visualizar como os complementos aparecem na visão do cliente.

### Precificação
- [ ] **Preço Dinâmico:** Permitir preço diferente do complemento dependendo do produto (ex: bacon na pizza vs. no hambúrguer).
- [ ] **Combos de Complementos:** Criar pacotes de complementos com desconto (ex: "Combo Completo" com 3 adicionais por preço fixo).
- [ ] **Custo de Ingrediente:** Vincular complementos a ingredientes do estoque para controle de custo.

### Disponibilidade
- [ ] **Desativação em Cascata:** Ao desativar um opcional de complemento, permitir escolher entre:
  - Desativar apenas neste produto específico
  - Desativar em todos os produtos onde este opcional foi atribuído (ação em massa)
- [ ] **Ativação em Cascata:** Mesma lógica para reativar opcionais desativados em múltiplos produtos simultaneamente.
- [ ] **Horário de Disponibilidade:** Complementos disponíveis apenas em certos horários (ex: café da manhã).
- [ ] **Estoque de Complementos:** Controlar quantidade disponível e desabilitar automaticamente quando acabar.

## 16. Prioridades de Implementação (Roadmap)

### Alta Prioridade (Impacto Imediato)
1.  **UX Crítica:** Drag & Drop (Kanban de Pedidos e Cozinha) e Edição Rápida (Cardápio).
2.  **Retenção:** Onboarding Interativo e Setup Wizard.
3.  **Operacional:** Layout Visual de Mesas e Modo Tela Cheia (Kitchen Display).

### Média Prioridade (Melhoria de Gestão)
4.  **Gestão:** Filtros de Data no Financeiro e Relatórios de Performance.
5.  **Estoque:** Alertas de Estoque Baixo e Histórico de Movimentações.
6.  **Clientes:** Análise de Comportamento e Segmentação.

### Baixa Prioridade (Otimizações Avançadas)
7.  **Integrações:** Editor de Mensagens WhatsApp e Envio de Cupons.
8.  **Avançado:** Previsão de Consumo, Permissões Granulares, ROI de Campanhas.
