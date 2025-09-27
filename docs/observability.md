# Observabilidade

## Logs estruturados de erros

Os erros do backend Express são emitidos agora em JSON estruturado para facilitar a ingestão por ferramentas de observabilidade.
Cada evento inclui apenas campos seguros em produção:

- `level`: sempre `"error"`.
- `timestamp`: horário ISO-8601 da emissão.
- `code`: código semântico da falha (`AppError.code`).
- `message`: mensagem pronta para operadores.
- `status`: HTTP status retornado ao cliente.
- `method` e `path`: informações da rota que originou o erro.
- `requestId`: propagado a partir do cabeçalho `x-request-id`, quando presente.

Quando `NODE_ENV` não é `production`, o logger adiciona o nó `dev` com metadados úteis para debugging local (detalhes do `AppError`
e rastros de pilha). Em produção esses campos são omitidos para evitar vazamento de informações sensíveis.

Integre o coletor de logs apontando para o stdout do serviço e configure o parser como JSON para aproveitar os campos estruturados.
