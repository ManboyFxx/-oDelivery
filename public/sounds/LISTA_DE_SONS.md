# Estrutura de Sons do Sistema

Todos os efeitos sonoros necessários estão presentes nesta pasta (`public/sounds/`).
O sistema carrega automaticamente arquivos em formatos **.mp3** (recomendado) ou **.wav**.

✅ **Status:** Todos os 7 arquivos de som obrigatórios estão configurados e funcionando.

## 🔴 Alertas Críticos (Prioridade Alta)

| Nome do Arquivo | Função | Descrição |
| :--- | :--- | :--- |
| **`new-order.mp3`** | **Novo Pedido** | Toca alto e repetidamente quando chega um pedido novo na Cozinha/Admin. |
| **`pedido-pronto.mp3`** | **Pedido Pronto** | Toca na cozinha quando um pedido é marcado como "Pronto". |
| **`alert.mp3`** | **Alerta Geral** | Toca para avisos importantes ou problemas de conexão. |

## 🟢 Notificações (Status e Sucesso)

| Nome do Arquivo | Função | Descrição |
| :--- | :--- | :--- |
| **`success.mp3`** | **Sucesso** | Ação concluída (ex: Configuração salva, Pedido aceito). |
| **`error.mp3`** | **Erro** | Algo deu errado (ex: Falha ao salvar). |
| **`notification.mp3`** | **Notificação** | Som genérico de aviso (ex: Mensagem recebida). |

## 🔵 Cliente (Área Pública)

| Nome do Arquivo | Função | Descrição |
| :--- | :--- | :--- |
| **`order-updated.mp3`** | **Pedido Atualizado** | Toca no celular do cliente quando o status do pedido muda (ex: "Saiu para Entrega"). |
