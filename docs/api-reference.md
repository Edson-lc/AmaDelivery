# AmaDelivery API Reference

Este documento descreve todos os endpoints HTTP expostos pelo backend Express do AmaDelivery. Todos os recursos estão disponíveis sob o prefixo `/api`, conforme definido em [`server/src/app.ts`](../server/src/app.ts), e retornam respostas JSON serializadas pelo helper `serialize`.

## Convenções gerais

- **Formato de data**: campos de data são strings ISO 8601 produzidas pelo Prisma.
- **Paginação**: os endpoints atuais não expõem paginação; todos retornam listas completas.
- **Erros**: quando a validação falha ou o recurso não é encontrado, a API responde com um objeto `{ "message": string }` e o status HTTP apropriado.
- **Autenticação**: não há autenticação baseada em token. O endpoint de login retorna os dados públicos do usuário. Caberá ao cliente gerenciar sessão/cookies.

## Monitoramento

### `GET /health`

Retorna o estado do servidor e informações básicas de uptime.

**Resposta 200**
```json
{
  "status": "ok",
  "uptime": 123.45,
  "env": {
    "port": 3333
  }
}
```

## Autenticação

### `POST /api/auth/login`

Realiza a autenticação de um usuário via e-mail e senha.

- **Body JSON obrigatório**
  - `email` (string) — e-mail cadastrado.
  - `password` (string) — senha em texto puro.

**Respostas**
- `200` — retorna o usuário público selecionado por [`publicUserSelect`](../server/src/utils/user.ts).
- `400` — quando e-mail ou senha não são enviados.
- `401` — quando as credenciais não conferem.

### `POST /api/auth/logout`

Endpoint de conveniência que invalida a sessão do lado do cliente. Não recebe body e responde `204 No Content`.

## Usuários

Todos os handlers estão em [`server/src/routes/users.ts`](../server/src/routes/users.ts).

### `POST /api/users`

Cria um usuário com os dados informados.

- **Body JSON obrigatório**
  - `email` (string) — obrigatório e único.
  - `fullName` (string) — nome completo.
- **Body opcional**
  - `password` (string) — se informado, é armazenado como `passwordHash` com bcrypt.
  - `role`, `tipoUsuario`, `nome`, `sobrenome`, `telefone`, `nif`, `dataNascimento`, `fotoUrl`, `status`.
  - `restaurantId` — conecta o usuário a um restaurante existente.
  - `consentimentoDados`, `enderecosSalvos`, `metodosPagamento`, demais campos mapeados no arquivo da rota.

**Respostas**
- `201` — usuário criado; corpo com projeção pública.
- `400` — campos obrigatórios ausentes.
- `409` — e-mail já cadastrado.

### `GET /api/users`

Lista usuários filtrando por query string opcional.

- **Query params**
  - `email` — busca parcial (case insensitive).
  - `role`, `tipoUsuario`, `id` — filtros exatos.

**Resposta 200** — array de usuários públicos ordenados por `createdDate desc`.

### `GET /api/users/me`

Busca um usuário específico a partir do `userId` informado na query.

- **Query param obrigatório**: `userId`.

**Respostas**
- `200` — usuário público.
- `401` — sem `userId` na query.
- `404` — usuário inexistente.

### `GET /api/users/:id`

Retorna o usuário pelo identificador do path. Responde `404` se não existir.

### `PUT /api/users/:id`

Atualiza um usuário existente.

- **Body JSON** — aceita os mesmos campos de criação; `password` é opcional e, se presente, é re-hashada. Campo auxiliar `endereco` é convertido para `enderecosSalvos`.

**Resposta 200** — usuário atualizado com projeção pública.

## Restaurantes

Implementados em [`server/src/routes/restaurants.ts`](../server/src/routes/restaurants.ts).

### `GET /api/restaurants`

Lista restaurantes com filtros opcionais.

- `category` — filtra por `categoria` (lowercase).
- `status` — filtra por status.
- `search` — aplica `contains` em `nome` ou `descricao` (case insensitive).
- `includeMenuItems=true` — inclui itens de menu associados.

**Resposta 200** — array de restaurantes ordenados por `createdDate desc`.

### `GET /api/restaurants/:id`

Retorna um restaurante com seus itens de menu. Responde `404` se não encontrado.

### `POST /api/restaurants`

Cria um restaurante.

- **Body obrigatório**: `nome`, `endereco`, `telefone`.
- **Body opcional**: `descricao`, `categoria`, `email`, `tempoPreparo`, `taxaEntrega`, `valorMinimo`, `status`, `avaliacao`, `imagemUrl`, `horarioFuncionamento`.

**Respostas**
- `201` — restaurante criado.
- `400` — campos obrigatórios ausentes.

### `PUT /api/restaurants/:id`

Atualiza dados do restaurante. Body livre com campos aceitos pelo Prisma.

### `DELETE /api/restaurants/:id`

Remove definitivamente o restaurante. Responde `204`.

## Itens de menu

Rota definida em [`server/src/routes/menu-items.ts`](../server/src/routes/menu-items.ts).

### `GET /api/menu-items`

Query params opcionais:
- `restaurantId`
- `category`
- `available` (`true`/`false`)
- `search` — texto aplicado a nome e descrição (case insensitive).

**Resposta 200** — lista ordenada por nome.

### `GET /api/menu-items/:id`

Retorna item individual incluindo restaurante. `404` se ausente.

### `POST /api/menu-items`

Cria um item de menu.
- Campos obrigatórios: `restaurantId`, `nome`, `preco`.
- Campos opcionais: `descricao`, `categoria`, `imagemUrl`, `disponivel`, etc.

**Respostas**
- `201` — item criado.
- `400` — dados obrigatórios ausentes.

### `PUT /api/menu-items/:id`

Atualiza um item existente.

### `DELETE /api/menu-items/:id`

Remove o item. Responde `204`.

## Pedidos

Implementados em [`server/src/routes/orders.ts`](../server/src/routes/orders.ts).

### `GET /api/orders`

Filtros opcionais via query:
- `status`
- `restaurantId`
- `customerId`
- `entregadorId`
- `dateFrom` / `dateTo` — intervalos aplicados a `createdDate`.

Retorna pedidos com `restaurant`, `customer`, `entregador` e `delivery` incluídos.

### `GET /api/orders/:id`

Retorna um pedido específico com as mesmas inclusões. `404` se não existir.

### `POST /api/orders`

Cria um pedido.

- **Campos obrigatórios**: `restaurantId`, `clienteNome`, `clienteTelefone`, `enderecoEntrega`, `itens`, `subtotal`, `total`.
- **Campos opcionais**: `customerId`, `entregadorId`, `numeroPedido`, `clienteEmail`, `taxaEntrega`, `taxaServico`, `desconto`, `cupomUsado`, `status`, `formaPagamento`, `pagamentoStatus`, `pagamentoId`, `tempoEstimadoPreparo`, `tempoEstimadoEntrega`, `observacoesCliente`, `observacoesRestaurante`, `historicoStatus`, `dataConfirmacao`, `dataEntrega`, `avaliacao`.
- Se `numeroPedido` não for enviado, um identificador `AMA-<timestamp>-<random>` é gerado.
- Caso `historicoStatus` esteja ausente, é criado automaticamente um histórico inicial com o status atual.

**Respostas**
- `201` — pedido criado.
- `400` — campos obrigatórios ausentes.

### `PUT /api/orders/:id`

Atualiza campos arbitrários do pedido.

### `PATCH /api/orders/:id/status`

Atualiza apenas o status mantendo o histórico.

- **Body obrigatório**: `status`.
- **Body opcional**: `note` — anotação incluída no histórico.
- A rota busca o pedido, acrescenta um registro a `historicoStatus` com `timestamp` atual e retorna o pedido atualizado.

**Respostas**
- `200` — pedido atualizado.
- `400` — status ausente.
- `404` — pedido inexistente.

## Entregas

Rota em [`server/src/routes/deliveries.ts`](../server/src/routes/deliveries.ts).

### `GET /api/deliveries`

Query params opcionais: `entregadorId`, `orderId`, `status`. Retorna lista ordenada por `createdDate desc`.

### `GET /api/deliveries/:id`

Retorna uma entrega específica. `404` se não encontrada.

### `POST /api/deliveries`

Cria uma entrega.

- **Campos obrigatórios**: `orderId`, `enderecoColeta`, `enderecoEntrega`, `valorFrete`.
- **Campos opcionais**: `entregadorId`, `status`, `tempoEstimadoEntrega`, etc.

**Respostas**
- `201` — entrega criada.
- `400` — dados obrigatórios ausentes.

### `PUT /api/deliveries/:id`

Atualiza uma entrega existente.

## Entregadores

Definido em [`server/src/routes/entregadores.ts`](../server/src/routes/entregadores.ts).

### `GET /api/entregadores`

Filtros opcionais: `userId`, `email`, `status`, `id`, `aprovado`, `disponivel`.

### `GET /api/entregadores/:id`

Busca um entregador pelo ID. `404` se não existir.

### `POST /api/entregadores`

Cria um entregador. O body é normalizado antes da persistência.

- **Campos obrigatórios**: `email`, `nomeCompleto`, `telefone`.
- Campos opcionais incluem `userId`, `dataNascimento`, `endereco`, `nif`, `fotoUrl`, `status`, `aprovado`, `veiculoTipo`, `veiculoPlaca`, `disponivel`, `avaliacao`, `totalEntregas`, `latitude`, `longitude`, `iban`, `nomeBanco`, `ultimoLogin`.
- Campos de data aceitam string (`YYYY-MM-DD` ou ISO) e são convertidos para `Date`.

**Respostas**
- `201` — entregador criado.
- `400` — validação falhou.

### `PUT /api/entregadores/:id`

Atualiza um entregador aplicando a mesma normalização.

### `DELETE /api/entregadores/:id`

Remove o registro definitivamente (204).

## Clientes

Rotas em [`server/src/routes/customers.ts`](../server/src/routes/customers.ts).

### `GET /api/customers`

Query params opcionais: `telefone`, `email`, `nome` (busca parcial), `id`.

### `GET /api/customers/:id`

Retorna cliente pelo ID. `404` se não encontrado.

### `POST /api/customers`

Cria cliente.

- **Campos obrigatórios**: `nome`, `telefone`.
- **Campos opcionais**: `email`, `endereco`, `notas`, etc.

**Respostas**
- `201` — cliente criado.
- `400` — validação falhou.

### `PUT /api/customers/:id`

Atualiza cliente existente.

## Carrinhos

Implementados em [`server/src/routes/carts.ts`](../server/src/routes/carts.ts).

### `GET /api/carts`

Query params opcionais: `sessionId`, `restaurantId`, `id`. Retorna carrinhos ordenados por `updatedDate desc`.

### `GET /api/carts/:id`

Busca carrinho individual. `404` quando não existe.

### `POST /api/carts`

Cria carrinho.

- **Campos obrigatórios**: `sessionId`, `restaurantId`.
- **Campos opcionais**: `itens`, `subtotal`, `total`, `status`, etc.

**Respostas**
- `201` — carrinho criado.
- `400` — campos obrigatórios ausentes.

### `PUT /api/carts/:id`

Atualiza um carrinho existente.

### `DELETE /api/carts/:id`

Remove um carrinho. Resposta `204`.

## Alterações de perfil de entregador

Rotas em [`server/src/routes/alteracoes-perfil.ts`](../server/src/routes/alteracoes-perfil.ts).

### `GET /api/alteracoes-perfil`

Query params opcionais: `entregadorId`, `status`. Retorna solicitações ordenadas por `createdDate desc`.

### `POST /api/alteracoes-perfil`

Cria uma solicitação de alteração de perfil.

- **Campos obrigatórios**: `entregadorId`, `dadosAntigos`, `dadosNovos`.
- **Campos opcionais**: `status`, `observacoes`.

**Respostas**
- `201` — solicitação criada.
- `400` — validação falhou.

### `PUT /api/alteracoes-perfil/:id`

Atualiza uma solicitação existente com novos dados ou status.

---

> **Próximos passos sugeridos:** documentar formatos detalhados de cada payload (schemas), adicionar paginação, autenticação baseada em tokens e exemplos de erro estruturados para elevar o padrão profissional da API.

