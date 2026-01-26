# Sons do Sistema

Este diretório contém os arquivos de áudio utilizados em notificações e eventos do sistema.

## Arquivos Necessários

O sistema carrega automaticamente os seguintes arquivos:

| Arquivo | Evento | Status |
|---------|--------|--------|
| `new-order.mp3` | Novo pedido chega no Kanban/Cozinha | ✓ Obrigatório |
| `notification.mp3` | Notificação genérica | ✓ Obrigatório |
| `success.mp3` | Ação executada com sucesso | ✓ Obrigatório |
| `error.mp3` | Erro na operação | ✓ Obrigatório |
| `alert.mp3` | Alerta geral | ✓ Obrigatório |
| `order-updated.mp3` | Status do pedido atualizado | ✓ Obrigatório |
| `pedido-pronto.mp3` | Pedido pronto para retirada | ✓ Obrigatório |

## Formatos Suportados

- `.mp3` (recomendado - melhor compatibilidade)
- `.wav`
- `.ogg`

## Como Customizar

Para usar seus próprios áudios:

1. **Substitua os arquivos** mantendo os nomes exatos listados acima
2. **Garanta compatibilidade** usando formato MP3 (todos os navegadores suportam)
3. **Tamanho recomendado** para melhor performance: <200KB por arquivo
4. **Teste o som** acessando a aplicação e disparando os eventos correspondentes

## Referência de Uso

Os sons são reproduzidos automaticamente através do hook `useAudio` nos componentes:
- Kitchen: novo pedido, pedido pronto
- Orders: atualização de status
- PDV: sucesso de operação
- System: notificações gerais e erros

---

**Nota:** Se nenhum som for reproduzido, verifique:
- Arquivo existe com nome correto
- Navegador permite reprodução de áudio (verificar permissões)
- Console do navegador para erros 404
