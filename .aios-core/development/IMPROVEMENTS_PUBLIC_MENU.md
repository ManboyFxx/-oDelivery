# Pontos de Melhoria: Menu Público (Loja Online)

Este documento lista sugestões de melhoria para o **Menu Público** - a interface que os clientes finais utilizam para visualizar produtos e fazer pedidos.

> [!NOTE]
> **Sincronização com Painel Admin:** Este documento é complementar ao [IMPROVEMENTS_CLIENT_PANEL.md](file:///c:/Users/Vertinho/Documents/Sistemas/OoDelivery/-oDelivery/.aios-core/development/IMPROVEMENTS_CLIENT_PANEL.md). Muitas melhorias do painel administrativo impactam diretamente a experiência do menu público.

## 1. Visualização de Produtos e Cardápio

### UX e Design
- [ ] **Imagens de Alta Qualidade:** Suporte a múltiplas imagens por produto com galeria/carousel.
- [ ] **Zoom de Imagem:** Permitir ampliar imagens dos produtos ao clicar.
- [ ] **Badges Visuais:** Destacar produtos com badges (Novo, Promoção, Mais Vendido, Vegano, etc.).
- [ ] **Modo Escuro:** Opção de tema escuro para melhor experiência noturna.
- [ ] **Skeleton Loading:** Animações de carregamento suaves ao invés de telas brancas.

### Navegação
- [ ] **Busca Inteligente:** Campo de busca com sugestões automáticas e busca por ingredientes.
- [ ] **Filtros Avançados:** Filtrar por preço, categoria, tags (vegetariano, sem glúten, etc.).
- [ ] **Menu Fixo/Sticky:** Barra de categorias fixa no topo ao rolar a página.
- [ ] **Breadcrumbs:** Navegação clara mostrando Categoria > Produto.
- [ ] **Scroll Suave:** Ao clicar em categoria, rolar suavemente até a seção.

### Informações do Produto
- [ ] **Descrição Expandida:** Mostrar descrição completa, ingredientes e informações nutricionais.
- [ ] **Avaliações:** Sistema de avaliações e comentários de clientes (se aplicável).
- [ ] **Tempo de Preparo:** Exibir tempo estimado de preparo por produto.
- [ ] **Indicadores Visuais:** Ícones para alérgenos, restrições alimentares, nível de picância.

## 2. Seleção de Complementos

### Interface
- [ ] **Modal Responsivo:** Modal de complementos otimizado para mobile e desktop.
- [ ] **Imagens nos Complementos:** Permitir adicionar fotos aos opcionais (ex: foto do bacon, queijo extra).
- [ ] **Contador Visual:** Botões +/- estilizados para ajustar quantidade de complementos.
- [ ] **Validação em Tempo Real:** Feedback visual quando atingir limite de seleções (min/max).
- [ ] **Resumo do Pedido:** Sidebar mostrando produto + complementos selecionados + preço total em tempo real.

### Usabilidade
- [ ] **Complementos Recomendados:** Sugestão de complementos populares ou combos.
- [ ] **Lembrar Preferências:** Salvar complementos favoritos do cliente para próximos pedidos.
- [ ] **Edição Rápida:** Permitir editar complementos de itens já no carrinho sem remover.
- [ ] **Indicador de Preço:** Mostrar claramente o preço de cada complemento (+R$ X,XX).

## 3. Carrinho de Compras

### Funcionalidades
- [ ] **Carrinho Persistente:** Manter carrinho salvo mesmo após fechar o navegador (localStorage).
- [ ] **Edição In-line:** Editar quantidade e complementos diretamente no carrinho.
- [ ] **Cupom de Desconto:** Campo para aplicar cupons com validação em tempo real.
- [ ] **Cálculo Dinâmico:** Atualização automática de subtotal, taxa de entrega e total.
- [ ] **Itens Sugeridos:** "Clientes também compraram" ou "Adicione uma bebida".

### Visual
- [ ] **Mini Carrinho:** Badge com contador de itens no ícone do carrinho.
- [ ] **Preview ao Adicionar:** Animação ou toast confirmando adição ao carrinho.
- [ ] **Carrinho Lateral (Drawer):** Slide-in lateral para visualizar carrinho sem sair da página.

## 4. Checkout e Finalização

### Informações do Cliente
- [ ] **Autocompletar Endereço:** Integração com API de CEP para preencher endereço automaticamente.
- [ ] **Múltiplos Endereços:** Permitir salvar e selecionar entre vários endereços cadastrados.
- [ ] **Localização Atual:** Botão para usar geolocalização do navegador.
- [ ] **Validação de Zona:** Verificar se o endereço está na área de entrega antes de finalizar.

### Formas de Pagamento
- [ ] **Ícones Visuais:** Mostrar ícones das formas de pagamento (dinheiro, cartão, Pix).
- [ ] **Troco:** Campo específico para "Troco para quanto?" quando selecionar dinheiro.
- [ ] **Pagamento Online:** Integração com gateways (Mercado Pago, PagSeguro, Stripe).
- [ ] **Pix Copia e Cola:** Gerar QR Code e chave Pix para pagamento instantâneo.

### Agendamento
- [ ] **Pedido Agendado:** Permitir agendar pedido para horário futuro.
- [ ] **Horários Disponíveis:** Mostrar slots de horário disponíveis baseado na capacidade da loja.
- [ ] **Estimativa de Entrega:** Calcular e exibir tempo estimado de entrega baseado em distância.

## 5. Acompanhamento de Pedido

### Rastreamento
- [ ] **Status em Tempo Real:** Atualização automática do status do pedido (Recebido → Preparando → Saiu para Entrega → Entregue).
- [ ] **Barra de Progresso:** Visualização gráfica do progresso do pedido.
- [ ] **Notificações Push:** Alertas no navegador quando status mudar (Web Push Notifications).
- [ ] **Mapa de Entrega:** Rastreamento do entregador no mapa (se integrado com GPS).
- [ ] **Tempo Estimado:** Contador regressivo mostrando tempo estimado para entrega.

### Comunicação
- [ ] **Chat com Loja:** Sistema de mensagens para tirar dúvidas sobre o pedido.
- [ ] **Avaliação Pós-Entrega:** Solicitar avaliação após pedido ser entregue.
- [ ] **Compartilhar Pedido:** Botão para compartilhar link do pedido com amigos.

## 6. Programa de Fidelidade (Cliente)

### Visualização
- [ ] **Saldo de Pontos:** Exibir saldo de pontos de fidelidade no menu.
- [ ] **Barra de Progresso:** Mostrar quanto falta para próxima recompensa.
- [ ] **Histórico de Pontos:** Ver ganhos e resgates de pontos.
- [ ] **Recompensas Disponíveis:** Catálogo de prêmios que podem ser resgatados.

### Gamificação
- [ ] **Badges/Conquistas:** Sistema de conquistas (1º pedido, 10º pedido, cliente VIP).
- [ ] **Níveis de Fidelidade:** Tiers com benefícios crescentes (Bronze, Prata, Ouro).
- [ ] **Indicação de Amigos:** Ganhar pontos ao indicar novos clientes.

## 7. Personalização e Configuração

### Preferências do Cliente
- [ ] **Conta de Usuário:** Permitir criar conta para salvar histórico e preferências.
- [ ] **Favoritos:** Marcar produtos favoritos para acesso rápido.
- [ ] **Pedidos Anteriores:** "Pedir Novamente" com um clique.
- [ ] **Restrições Alimentares:** Salvar restrições (alergia, vegetariano) e destacar produtos compatíveis.

### Acessibilidade
- [ ] **Modo Alto Contraste:** Para pessoas com deficiência visual.
- [ ] **Tamanho de Fonte:** Opção de aumentar/diminuir fonte.
- [ ] **Navegação por Teclado:** Suporte completo para navegação sem mouse.
- [ ] **Screen Reader:** Compatibilidade com leitores de tela (ARIA labels).

## 8. Performance e Otimização

### Velocidade
- [ ] **Lazy Loading:** Carregar imagens apenas quando visíveis na tela.
- [ ] **Cache Inteligente:** Cachear cardápio e produtos para carregamento instantâneo.
- [ ] **Compressão de Imagens:** Otimizar imagens automaticamente (WebP, AVIF).
- [ ] **PWA (Progressive Web App):** Permitir instalar menu como app no celular.
- [ ] **Offline Mode:** Visualizar cardápio mesmo sem internet (com aviso de que não pode fazer pedido).

### Mobile First
- [ ] **Design Responsivo:** Interface otimizada para celular (maioria dos pedidos).
- [ ] **Touch Gestures:** Suporte a gestos (swipe, pinch to zoom).
- [ ] **Botões Grandes:** Áreas de toque adequadas para dedos (mínimo 44x44px).
- [ ] **Teclado Numérico:** Abrir teclado numérico em campos de telefone/CEP.

## 9. Informações da Loja

### Transparência
- [ ] **Horário de Funcionamento:** Exibir claramente horários de abertura/fechamento.
- [ ] **Status da Loja:** Indicador visual se está aberta, fechada ou pausada.
- [ ] **Tempo de Entrega:** Estimativa de tempo de entrega por região.
- [ ] **Taxa de Entrega:** Mostrar taxa de entrega antes de adicionar itens ao carrinho.
- [ ] **Pedido Mínimo:** Informar valor mínimo de pedido, se houver.

### Contato e Localização
- [ ] **Mapa da Loja:** Integração com Google Maps mostrando localização.
- [ ] **Botão de WhatsApp:** Link direto para WhatsApp da loja.
- [ ] **Telefone Clicável:** Link tel: para ligar diretamente do celular.
- [ ] **Redes Sociais:** Links para Instagram, Facebook, etc.

## 10. Promoções e Marketing

### Destaque de Ofertas
- [ ] **Banner de Promoções:** Carousel de banners no topo do menu.
- [ ] **Produtos em Destaque:** Seção especial para produtos promocionais.
- [ ] **Cupons Visíveis:** Exibir cupons disponíveis antes do checkout.
- [ ] **Frete Grátis:** Badge destacando quando atingir valor para frete grátis.

### Urgência e Escassez
- [ ] **Contador de Estoque:** "Últimas X unidades disponíveis".
- [ ] **Promoção por Tempo:** Countdown timer para ofertas limitadas.
- [ ] **Pedidos Recentes:** "X pessoas pediram este item hoje" (social proof).

## 11. Integração e Sincronização

### Sincronização em Tempo Real
- [ ] **Disponibilidade de Produtos:** Atualizar automaticamente quando produto ficar indisponível no painel admin.
- [ ] **Preços Dinâmicos:** Refletir mudanças de preço instantaneamente.
- [ ] **Horários de Funcionamento:** Sincronizar horários configurados no painel.
- [ ] **Complementos Desativados:** Remover opcionais desativados em cascata do menu público.
- [ ] **Estoque em Tempo Real:** Desabilitar produtos esgotados automaticamente.

### Consistência de Dados
- [ ] **Ordem de Categorias:** Respeitar ordenação definida no painel admin.
- [ ] **Ordem de Produtos:** Manter mesma ordem configurada pelo lojista.
- [ ] **Imagens Sincronizadas:** Atualizar imagens imediatamente após upload no admin.
- [ ] **Descrições Atualizadas:** Refletir mudanças de descrição sem delay.

## 12. Prioridades de Implementação (Roadmap)

### Alta Prioridade (Impacto Imediato na Conversão)
1. **UX Crítica:** Carrinho Persistente, Edição de Complementos no Carrinho, Modal Responsivo.
2. **Conversão:** Autocompletar Endereço, Validação de Zona de Entrega, Cupom de Desconto.
3. **Sincronização:** Disponibilidade em Tempo Real, Preços Dinâmicos, Complementos Desativados.

### Média Prioridade (Melhoria de Experiência)
4. **Rastreamento:** Status em Tempo Real, Barra de Progresso, Notificações Push.
5. **Personalização:** Conta de Usuário, Favoritos, Pedidos Anteriores.
6. **Performance:** Lazy Loading, PWA, Compressão de Imagens.

### Baixa Prioridade (Diferenciação e Engajamento)
7. **Fidelidade:** Badges, Níveis, Indicação de Amigos.
8. **Marketing:** Banner de Promoções, Contador de Estoque, Social Proof.
9. **Avançado:** Pagamento Online, Rastreamento GPS, Chat com Loja.
