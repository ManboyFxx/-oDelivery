# Pontos de Melhoria: Terminal de Impressão (óoprint)

Este documento detalha as oportunidades de melhoria e convergência entre o terminal local `óoprint` e o sistema principal `oDelivery`.

---

## 1. Sincronização e Configuração Inteligente

### 🔄 Sincronização Bidirecional
- [ ] **Configuração Via Nuvem:** Atualmente o `óoprint` exige configuração manual de largura de papel e cópias. O app deve buscar essas definições automaticamente do Dashboard (`StoreSetting`).
- [ ] **Device Health Check:** Reportar o status da impressora (Online, Sem Papel, Erro) de volta para o Dashboard para que o administrador saiba se o terminal está operacional.
- [ ] **Auto-Update:** Sistema de atualização automática do binário (.exe) quando uma nova versão for detectada no servidor.

## 2. Enriquecimento do Cupom (Layout)

### 🎨 Identidade e Marketing
- [ ] **Impressão de Logotipo:** Suporte para converter o logo da loja em bitmap P&B para impressão no cabeçalho.
- [ ] **QR Code Pix:** Gerar o QR Code estático ou dinâmico (Pix Copia e Cola) diretamente no cupom para facilitar o pagamento na entrega.
- [ ] **Fidelidade (Loyalty):** Exibir saldo de pontos do cliente e quantos pontos ele ganhou com aquele pedido no rodapé.
- [ ] **Pesquisa de Satisfação:** QR Code linkando para a avaliação do pedido no Google ou no próprio sistema.

### 📋 Detalhamento Técnico
- [ ] **Endereço Completo:** Incluir Ponto de Referência e Complemento (se disponível) com maior destaque.
- [ ] **Separação por Categoria:** Opção de imprimir comandas separadas por categoria (ex: Bebidas vs. Comida) em impressoras diferentes ou com corte entre elas.

## 3. Experiência de Operação (UX)

### ⚡ Ações Rápidas no Terminal
- [ ] **Fluxo de Status Completo:** Permitir que o operador altere o status do pedido (Confirmar, Em Preparo, Pronto, Finalizado) diretamente no `óoprint`, sincronizando o estado com o Dashboard Web.
- [ ] **Persistência de Pedidos Recentes:** Os pedidos não devem sumir da tela principal logo após a impressão. Manter uma seção de "Pedidos em Aberto/Recentes" para que o operador tenha controle visual do que ainda está sendo preparado ou aguardando entrega.
- [ ] **Apresentação Aprimorada:** Melhorar a visualização do card do pedido no app (UI) para exibir ícones de status, tempo de espera e botões de ação rápida de forma mais clara e "premium".
- [ ] **Filtros de Visão:** Alternar rapidamente entre "Todos", "Delivery", "Retirada" e "Mesas".
- [ ] **Histórico Local Robusto:** Busca local por pedidos antigos já impressos para re-impressão rápida.

### 🍱 Visual e Estética
- [ ] **Aceleração por Hardware:** Refinar as animações de entrada de pedidos para um efeito "Premium" (Fade-in suave, Glow nas bordas).
- [ ] **Dark Mode Nativo:** Sincronizar o tema visual com as cores exatas do Dashboard Principal.

## 4. Hardware e Infraestrutura

### 🔌 Comunicação de Baixo Nível e Precisão
- [ ] **Suporte ESC/POS Nativo:** Implementar biblioteca de baixo nível para falar com a porta USB/Serial (COM) sem passar pelo Spooler do Windows, garantindo:
  - **Precisão Milimétrica:** Controle total das margens para evitar que o texto "vaze" para os lados ou saia cortado.
  - **Controle de Guilhotina:** Comandos precisos para corte (parcial/total) no final de cada via, sem desperdiçar papel.
  - **Abertura de Gaveta:** Comando nativo para abrir a gaveta de dinheiro em pagamentos em espécie.
  - **Beep Nativo:** Usar o buzzer da própria impressora para alertas, que é muito mais alto que o do PC.
- [ ] **Layout Auto-Responsivo:** Calibração automática do layout baseada no modelo detectado (ex: ajustar densidade de caracteres para 58mm vs 80mm de forma proporcional).
- [ ] **Validação de Área de Impressão:** Ferramenta interna de "Página de Teste de Alinhamento" para o usuário calibrar margens e escalas visualmente.
- [ ] **Suporte a Múltiplas Impressoras:** Configurar uma impressora específica para Comandas (Cozinha) e outra para Cupons (Balcão).

## 5. Roadmap de Prioridades

### 🚀 Curto Prazo (Impacto)
1.  **QR Code Pix** no cupom (Facilita recebimento).
2.  **Sincronização de Configurações** (Facilita setup).
3.  **Ações de Status** (Confirmar/Pronto) no terminal.

### 🛠️ Longo Prazo (Estabilidade)
1.  **Driver ESC/POS Nativo** (Fim da dependência do Spooler).
2.  **Monitoramento de Status** de Hardware.
3.  **Auto-Update** do software.
