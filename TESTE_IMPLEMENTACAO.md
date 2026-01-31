# ✅ CHECKLIST DE TESTES - SISTEMA DE LEALDADE

## 🧪 TESTE 1: LOGIN E REGISTRO COM PONTOS

```
1. Acesse /{slug}/menu
2. Clique em "Entrar"
3. Digite um telefone novo (ex: 11999999999)
4. Complete o nome
✅ Verificar:
   - Cliente aparece logado
   - Badge de tier "🥉 Bronze" aparece no header
   - Saldo de 0 pontos exibido
   - No modal "Minha Conta" → "Meus Dados":
     * Card com gradiente orange
     * "0 pontos"
     * Barra de progresso "Faltam 100 pontos para Prata"
```

---

## 🧪 TESTE 2: CHECKOUT COM PREVIEW DE PONTOS

```
1. Adicione um produto ao carrinho (ex: Pizza R$ 50,00)
2. Abra o carrinho
3. Clique "Finalizar Pedido"
✅ Verificar:
   - Modal de checkout abre
   - Seção "Cupom de Desconto" (vazia)
   - NO FINAL antes do botão, exibe:
     * "🎁 Você vai ganhar 50 pontos!"
     * "Equivalente a R$ 5,00"
```

---

## 🧪 TESTE 3: FINALIZAR PEDIDO E GANHAR PONTOS

```
1. Finalize um pedido no modal (qualquer entrega/pagamento)
✅ Verificar:
   - Animação de celebração aparece (3.5 seg):
     * "Parabéns! +50 pontos! 🎉"
   - Toast de sucesso aparece após
   - Cliente é redirecionado ao menu
   - Pontos no header atualizaram para 50
   - Modal "Minha Conta" → "Meus Dados" mostra 50 pontos
```

---

## 🧪 TESTE 4: HISTÓRICO DE PEDIDOS

```
1. No modal "Minha Conta", clique na tab "Pedidos"
✅ Verificar:
   - Carrega pedido anterior
   - Card mostra:
     * #1 | "Novo" (badge azul)
     * Data e hora
     * Valor: R$ 50,00
     * 🎁 +50 pontos (em orange/bold)
   - Pagination apareça (se houver mais pedidos)
```

---

## 🧪 TESTE 5: PROMOÇÃO ATIVA (2x PONTOS)

```
1. No admin, vá para Fidelidade
2. Crie uma promoção:
   - Nome: "Teste 2x"
   - Multiplier: 2.0
   - Data: Hoje até amanhã
   - Ativo: SIM
3. Volte ao menu público
✅ Verificar:
   - Banner no topo com gradiente
   - "🔥 Ganhe 2x mais pontos em todas as compras!"
4. Faça um pedido de R$ 30,00
✅ Verificar:
   - Preview mostra: "Você vai ganhar 60 pontos"
   - Após finalizar, recebe 60 pontos (não 30)
```

---

## 🧪 TESTE 6: TIER UPGRADE

```
1. Cliente tem 50 pontos (Bronze)
2. Faça um pedido de R$ 100,00 → Ganha 100 pontos
✅ Verificar:
   - Total de pontos agora: 150 pontos
   - Tier atualizou para "🥈 Prata" no header
   - Próxima compra ganha +5% bônus
3. Faça um pedido de R$ 100,00 → Deve ganhar 105 pontos (100 * 1.05)
✅ Verificar:
   - Realmente recebe 105 pontos
```

---

## 🧪 TESTE 7: PROGRESS BAR PARA PRÓXIMO TIER

```
1. Cliente com 150 pontos (Prata)
2. Abra "Minha Conta" → "Meus Dados"
✅ Verificar:
   - Barra de progresso exibe:
     * "Faltam 350 pontos para Ouro! (25% progresso)"
     * Barra visual com gradiente orange → pink
     * Barra preenchida 25%
```

---

## 🧪 TESTE 8: CUPOM NO CHECKOUT

```
1. Crie um cupom no admin:
   - Código: TESTE20
   - Tipo: Percentage
   - Valor: 20 (20%)
   - Válido até: Amanhã
   - Mínimo: R$ 0
   - Ativo: SIM

2. No menu, adicione um produto: R$ 100,00
3. Abra checkout
✅ Verificar:
   - Seção "Cupom de Desconto" com input
4. Digite TESTE20 e clique "Aplicar"
✅ Verificar:
   - "✓ Cupom aplicado! TESTE20"
   - Desconto: 20%
5. Visualize o total:
   - Subtotal: R$ 100,00
   - Desconto: -R$ 20,00
   - **Total a pagar: R$ 80,00**
6. Finalize o pedido
✅ Verificar:
   - Pedido foi criado com R$ 80,00
   - Pontos foram calculados sobre R$ 80,00 (não R$ 100)
```

---

## 🧪 TESTE 9: RECOMPENSAS (RESGATE DE PRODUTOS)

```
1. Crie uma categoria no admin:
   - Nome: "Recompensas"
   - Tipo: "loyalty_rewards"

2. Crie um produto nessa categoria:
   - Nome: "Pizza Grátis"
   - Preço: R$ 50
   - Ativo: SIM
   - Resgatável: SIM
   - Custo em pontos: 100

3. No menu público, procure a tab "🎁 Recompensas"
✅ Verificar:
   - Pizza Grátis aparece com design especial (border orange)
   - Badge "🎁 RESGATE" no canto
   - Exibe: "100 pontos"
   - Se cliente tem 150 pontos:
     * Botão: "Resgatar"
     * Text: "Seu saldo: 150 pontos"

4. Clique "Resgatar"
✅ Verificar:
   - Sucesso: "Parabéns! Você resgatou Pizza Grátis!"
   - Pontos diminuem: 150 → 50
   - Novo pedido criado #X com:
     * Total: R$ 0,00
     * Mode: Retirada
     * Item com flag "is_loyalty_redemption = true"

5. Vá em "Pedidos" no modal
✅ Verificar:
   - Novo pedido aparece
   - Mostra R$ 0,00 (resgate)
```

---

## 🧪 TESTE 10: CUPONS ADMIN - TEMA CLEAN ORANGE

```
1. Vá em Cupons no admin (rota /cupons)
✅ Verificar Layout:
   - Header com ícone orange e gradiente
   - "Cupons de Desconto" como título
   - Botão "Criar Cupom" com gradiente orange

2. Se houver cupons, verificar cards:
   - Gradiente orange/amber no fundo
   - Badge "Ativo" verde no topo
   - Código em MONOSPACE grande
   - Valor do desconto em BOLD orange (4xl)
   - Ícone de % ou $
   - Detalhes: Mínimo, Validade, Utilizações
   - Barra de progresso de uso
   - Botão "Editar" orange

3. Se não houver cupons:
   - Empty state com ícone
   - "Nenhum cupom criado ainda"
   - Subtexto "Comece criando um cupom..."
```

---

## 🧪 TESTE 11: CLEANUP AUTOMÁTICO (OPCIONAL)

```
1. Crie um pedido
2. No banco de dados, altere criado_at para 16 dias atrás:
   UPDATE orders SET created_at = DATE_SUB(NOW(), INTERVAL 16 DAY)
   WHERE order_number = 1;

3. Execute job manualmente:
   php artisan queue:work --once

4. Verifique:
   - Pedido tem deleted_at != null (soft delete)
   - No histórico do cliente NÃO aparece mais
```

---

## 🧪 TESTE 12: DADOS APÓS LOGOUT/LOGIN

```
1. Cliente logado com 250 pontos, Tier "Prata"
2. Clique "Sair da Conta" no modal
3. Verifique header: Volta a mostrar botão "Entrar"
4. Clique "Entrar" e use mesmo telefone
✅ Verificar:
   - Dados são recuperados
   - 250 pontos aparecem
   - Tier "🥈 Prata" aparece
   - Barra de progresso atualizada
```

---

## ⚠️ POSSÍVEIS PROBLEMAS & SOLUÇÕES

### "Tier não aparece"
```
Solução: Execute migration:
php artisan migrate --path=database/migrations/2026_01_25_set_default_loyalty_tier.php
```

### "Cupom não valida"
```
Verificar:
1. Código em UPPERCASE?
2. Data válida?
3. Min order value satisfeito?
4. Não excedeu max_uses?
```

### "Animação não aparece"
```
Verificar:
1. PointsEarnedAnimation importado em CheckoutModal
2. Console.log de sucesso aparece?
3. Browser está com JavaScript ativado?
```

### "Recompensas não aparecem"
```
Verificar:
1. Categoria tem category_type = 'loyalty_rewards'?
2. Produto tem loyalty_redeemable = true?
3. Produto está ativo (is_available = true)?
4. Está visível no TenantMenuController?
```

### "Pontos não aparecem no cliente"
```
Verificar:
1. loyalty_enabled = true no StoreSetting?
2. points_per_currency > 0?
3. Customer tem loyalty_points e loyalty_tier?
4. AuthController retorna loyalty_tier?
```

---

## 📊 DADOS ESPERADOS

**Após testes completados:**
- ✅ 4+ pedidos no histórico
- ✅ Cliente com tier ouro ou diamante
- ✅ 1+ cupom testado
- ✅ 1+ produto resgatado
- ✅ Animação vista
- ✅ Progresso bar visível

---

**Total de testes:** 12 principais
**Tempo estimado:** 20-30 minutos
**Status:** PRONTO PARA VALIDAÇÃO

Qualquer dúvida, verifique `SISTEMA_LOYALIDADE_IMPLEMENTADO.md`
