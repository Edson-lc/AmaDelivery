# AmaDelivery API Reference

Esta referência cataloga todos os endpoints do backend Express expostos sob o prefixo `/api`. Todas as respostas são JSON serializados pelo helper [`serialize`](../server/src/utils/serialization.ts) e requerem autenticação com token Bearer, exceto onde indicado.

## Convenções Globais

### Autenticação baseada em token
- **Header obrigatório**: `Authorization: Bearer <token>` em todas as chamadas autenticadas.
- **Ciclo de sessão**:
  1. Envie `POST /api/auth/login` com credenciais válidas para receber um `token` JWT de curta duração e o objeto `user` público.
  2. Armazene o token com segurança no cliente e anexe o header `Authorization` nas requisições subsequentes.
  3. Utilize `GET /api/auth/me` para sincronizar o perfil atual sem depender de IDs armazenados no cliente.
  4. Opcionalmente, chame `POST /api/auth/logout` para encerrar a sessão do lado do cliente.

### Paginação
- **Query params**: `limit` (máx. 100) e `skip` (deslocamento inicial) estão disponíveis em todos os endpoints de listagem.
- **Headers de resposta**:
  - `X-Total-Count`: total de registros que correspondem ao filtro.
  - `X-Limit`: limite aplicado à consulta.
  - `X-Skip`: deslocamento aplicado.
- **Valor padrão**: se `limit` não for informado, todos os registros são retornados; recomenda-se informar explicitamente um limite (máx. 100) para evitar cargas elevadas.

### Erros estruturados
Todas as falhas retornam o formato:
```json
{
  "error": {
    "code": "STRING_EM_SNAKE_CASE",
    "message": "Descrição em português para o consumidor",
    "details": {
      "opcional": "dados adicionais"
    }
  }
}
```
Exemplos de códigos: `VALIDATION_ERROR`, `INVALID_CREDENTIALS`, `RESTAURANT_NOT_FOUND`, `UNAUTHENTICATED`.

### Schemas compartilhados
Os objetos retornados seguem os esquemas abaixo (chaves em `snake_case`). Tipos numéricos utilizam JSON number, datas são strings ISO 8601.

| Objeto | Campos principais |
| --- | --- |
| **User** | `id` (string UUID), `email`, `full_name`, `role`, `tipo_usuario`, `nome`, `sobrenome`, `telefone`, `nif`, `data_nascimento`, `foto_url`, `status`, `restaurant_id`, `consentimento_dados`, `enderecos_salvos` (JSON), `metodos_pagamento` (JSON), `created_date`, `updated_date` |
| **Restaurant** | `id`, `nome`, `descricao`, `categoria`, `endereco`, `telefone`, `email`, `tempo_preparo`, `taxa_entrega`, `valor_minimo`, `status`, `avaliacao`, `imagem_url`, `horario_funcionamento`, `created_date`, `updated_date`, `menu_items` (array de **MenuItem** quando solicitado) |
| **MenuItem** | `id`, `restaurant_id`, `nome`, `descricao`, `categoria`, `preco`, `disponivel`, `imagem_url`, `tempo_preparo_estimado`, `created_date`, `updated_date` |
| **Order** | `id`, `restaurant_id`, `customer_id`, `entregador_id`, `numero_pedido`, `cliente_nome`, `cliente_telefone`, `cliente_email`, `endereco_entrega`, `itens` (JSON), `subtotal`, `taxa_entrega`, `taxa_servico`, `desconto`, `cupom_usado`, `total`, `status`, `forma_pagamento`, `pagamento_status`, `pagamento_id`, `tempo_estimado_preparo`, `tempo_estimado_entrega`, `observacoes_cliente`, `observacoes_restaurante`, `historico_status` (array), `data_confirmacao`, `data_entrega`, `avaliacao`, `created_date`, `updated_date`, `restaurant`, `customer`, `entregador`, `delivery` |
| **Delivery** | `id`, `order_id`, `entregador_id`, `status`, `endereco_coleta`, `endereco_entrega`, `valor_frete`, `distancia_km`, `tempo_estimado`, `observacoes`, `created_date`, `updated_date` |
| **Cart** | `id`, `session_id`, `restaurant_id`, `customer_id`, `itens` (JSON), `subtotal`, `taxa_entrega`, `taxa_servico`, `total`, `created_date`, `updated_date` |
| **Customer** | `id`, `nome`, `telefone`, `email`, `documento`, `enderecos` (JSON), `preferencias` (JSON), `created_date`, `updated_date` |
| **Entregador** | `id`, `user_id`, `email`, `nome_completo`, `telefone`, `endereco` (JSON), `nif`, `data_nascimento`, `foto_url`, `status`, `aprovado`, `veiculo_tipo`, `veiculo_placa`, `disponivel`, `avaliacao`, `total_entregas`, `latitude`, `longitude`, `iban`, `nome_banco`, `ultimo_login`, `created_date`, `updated_date` |
| **AlteracaoPerfil** | `id`, `entregador_id`, `dados_antigos` (JSON), `dados_novos` (JSON), `status`, `comentarios`, `avaliado_por`, `created_date`, `updated_date` |

## Monitoramento

### `GET /health`
Retorna o estado do servidor. **Não requer autenticação**.

**Resposta 200**
```json
{
  "status": "ok",
  "uptime": 123.45,
  "env": {
    "port": 4000
  }
}
```

## Autenticação

### `POST /api/auth/login`
Autentica por e-mail e senha.

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `email` | string | ✓ | E-mail cadastrado (case insensitive). |
| `password` | string | ✓ | Senha em texto puro. |

**Resposta 200**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "email": "...", "full_name": "..." }
}
```

**Erros comuns**
- `400 VALIDATION_ERROR` – e-mail ou senha ausentes.
- `401 INVALID_CREDENTIALS` – credenciais incorretas.

### `POST /api/auth/logout`
Encerrar sessão no cliente. **Resposta**: `204 No Content`.

### `GET /api/auth/me`
Retorna o usuário autenticado a partir do token.

**Resposta 200** — objeto **User**.

**Erro** — `401 INVALID_TOKEN` se o token estiver ausente ou inválido.

## Usuários (`/api/users`)
Implementação em [`server/src/routes/users.ts`](../server/src/routes/users.ts).

### `POST /api/users`
Cria usuário. Aceita os campos descritos no esquema **User**; `password` (string) é opcional e gera `password_hash` com bcrypt; `restaurant_id` pode conectar a um restaurante existente.

**Erros**
- `400 VALIDATION_ERROR` — `email` ou `full_name` ausentes.
- `409 EMAIL_ALREADY_REGISTERED` — e-mail duplicado.

### `GET /api/users`
Lista usuários com filtros opcionais.

| Param | Tipo | Descrição |
| --- | --- | --- |
| `email` | string | Filtro parcial (case insensitive). |
| `role` | string | Filtra por função. |
| `tipoUsuario` | string | Filtra por tipo de usuário. |
| `id` | string | Busca direta por ID. |
| `limit`, `skip` | number | Paginação padrão. |

**Resposta 200** — array de **User** ordenado por `created_date desc` com headers de paginação.

### `GET /api/users/me`
Retorna o usuário associado ao token atual (mesmo payload de `GET /api/auth/me`).

### `GET /api/users/:id`
Busca usuário específico. `404 USER_NOT_FOUND` quando inexistente.

### `PUT /api/users/:id`
Atualiza usuário. Aceita campos do esquema **User**; `password` é re-hashada se enviada; `endereco` (objeto ou string) é convertido para `enderecos_salvos`.

## Restaurantes (`/api/restaurants`)

### `GET /api/restaurants`
Lista restaurantes.

| Param | Tipo | Descrição |
| --- | --- | --- |
| `category` | string | Filtra `categoria` (case insensitive). |
| `status` | string | Filtra por status operacional. |
| `search` | string | Busca em `nome` e `descricao`. |
| `includeMenuItems` | boolean | Quando `true`, inclui `menu_items`. |
| `limit`, `skip` | number | Paginação. |

**Resposta 200** — array de **Restaurant** ordenado por `created_date desc`.

### `GET /api/restaurants/:id`
Retorna restaurante com `menu_items`. `404 RESTAURANT_NOT_FOUND` se ausente.

### `POST /api/restaurants`
Cria restaurante.

Campos obrigatórios: `nome`, `endereco`, `telefone`.

**Erros**
- `400 VALIDATION_ERROR` — campos obrigatórios faltando.

### `PUT /api/restaurants/:id` & `DELETE /api/restaurants/:id`
Atualiza ou remove restaurantes existentes. `DELETE` responde `204` em sucesso.

## Itens de Menu (`/api/menu-items`)

### `GET /api/menu-items`
Filtros: `restaurantId`, `category`, `available`, `search`, além de `limit` e `skip`.

### `GET /api/menu-items/:id`
Retorna item com restaurante associado. `404 MENU_ITEM_NOT_FOUND` para inexistentes.

### `POST /api/menu-items`
Cria item de menu.

Campos obrigatórios: `restaurantId`, `nome`, `preco`.

### `PUT /api/menu-items/:id` & `DELETE /api/menu-items/:id`
Atualiza ou remove itens.

## Pedidos (`/api/orders`)

### `GET /api/orders`
Filtra pedidos pelos parâmetros abaixo (todos opcionais):

| Param | Tipo | Descrição |
| --- | --- | --- |
| `status` | string | Filtra status atual. |
| `restaurantId` | string | ID do restaurante. |
| `customerId` | string | ID do cliente. |
| `entregadorId` | string | ID do entregador. |
| `dateFrom`, `dateTo` | string (ISO) | Intervalo de criação. |
| `limit`, `skip` | number | Paginação. |

**Resposta 200** — array de **Order** com relacionamentos `restaurant`, `customer`, `entregador` e `delivery` incluídos.

### `GET /api/orders/:id`
Retorna pedido completo. `404 ORDER_NOT_FOUND` caso inexistente.

### `POST /api/orders`
Cria pedido.

Campos obrigatórios: `restaurantId`, `clienteNome`, `clienteTelefone`, `enderecoEntrega`, `itens` (JSON), `subtotal`, `total`.

**Erros**
- `400 VALIDATION_ERROR` — payload incompleto.

### `PUT /api/orders/:id`
Atualiza um pedido. Recebe qualquer subconjunto do esquema **Order**.

### `PATCH /api/orders/:id/status`
Atualiza status do pedido.

| Campo | Tipo | Obrigatório |
| --- | --- | --- |
| `status` | string | ✓ |
| `note` | string | ✗ |

**Erros**
- `400 VALIDATION_ERROR` — status ausente.
- `404 ORDER_NOT_FOUND` — pedido inexistente.

## Carrinhos (`/api/carts`)

### `GET /api/carts`
Filtros: `sessionId`, `restaurantId`, `id`, além de `limit` e `skip`.

### `GET /api/carts/:id`
Retorna carrinho. `404 CART_NOT_FOUND` caso não exista.

### `POST /api/carts`
Cria carrinho.

Campos obrigatórios: `sessionId`, `restaurantId`. Demais campos seguem esquema **Cart**.

### `PUT /api/carts/:id` & `DELETE /api/carts/:id`
Atualiza ou remove carrinho (delete responde `204`).

## Clientes (`/api/customers`)

### `GET /api/customers`
Filtros: `telefone`, `email`, `nome`, `id`, mais `limit`/`skip`.

### `GET /api/customers/:id`
Retorna cliente específico. `404 CUSTOMER_NOT_FOUND` quando ausente.

### `POST /api/customers`
Cria cliente.

Campos obrigatórios: `nome`, `telefone`.

### `PUT /api/customers/:id`
Atualiza cliente existente.

## Entregadores (`/api/entregadores`)

### `GET /api/entregadores`
Filtros: `userId`, `email`, `aprovado`, `disponivel`, `status`, `id`, com suporte a `limit`/`skip`.

### `GET /api/entregadores/:id`
Retorna entregador. `404 DELIVERY_AGENT_NOT_FOUND` se não encontrado.

### `POST /api/entregadores`
Cria entregador. Campos obrigatórios: `email`, `nomeCompleto`, `telefone`. Demais campos são opcionais conforme esquema **Entregador**.

### `PUT /api/entregadores/:id`
Atualiza entregador existente.

### `DELETE /api/entregadores/:id`
Remove entregador. **Resposta**: `204 No Content`.

## Entregas (`/api/deliveries`)

### `GET /api/deliveries`
Filtros: `entregadorId`, `orderId`, `status`, com paginação padrão.

### `GET /api/deliveries/:id`
Retorna entrega. `404 DELIVERY_NOT_FOUND` se ausente.

### `POST /api/deliveries`
Cria entrega.

Campos obrigatórios: `orderId`, `enderecoColeta`, `enderecoEntrega`, `valorFrete`.

### `PUT /api/deliveries/:id`
Atualiza entrega existente.

## Alterações de Perfil (`/api/alteracoes-perfil`)

### `GET /api/alteracoes-perfil`
Filtros: `entregadorId`, `status`, com paginação.

### `POST /api/alteracoes-perfil`
Cria uma solicitação de alteração.

Campos obrigatórios: `entregadorId`, `dadosAntigos`, `dadosNovos` (JSON).

### `PUT /api/alteracoes-perfil/:id`
Atualiza a solicitação (por exemplo, para aprovar ou rejeitar).

## Logs de Logout
`POST /api/auth/logout` e `POST /api/users/logout` não existem — utilize o endpoint de logout principal e descarte o token localmente.

---

**Boas práticas sugeridas**
- Rotacionar `JWT_SECRET` em produção e configurar `JWT_EXPIRES_IN` via variáveis de ambiente.
- Implementar refresh tokens e escopos específicos por função (`role`).
- Padronizar códigos de erro em um enum compartilhado entre cliente e servidor.
