# Sistema de Login

## Visão Geral
O fluxo de autenticação do AmaDelivery combina um backend Express/Prisma com JWTs curtos e utilitários de sessão no frontend React. O login acontece via `POST /api/auth/login`, que valida credenciais com `bcrypt`, gera um token assinado com `JWT_SECRET` e devolve os metadados públicos do usuário. O frontend armazena `{ token, user }` em `localStorage` através de `src/api/session.js`, injeta o cabeçalho `Authorization: Bearer` em todas as requisições autenticadas e sincroniza o perfil com `GET /api/auth/me`.

## Fluxo de autenticação no frontend
- `User.login(credentials)` valida as entradas, chama `/auth/login` e grava `{ token, user }` em `localStorage` (chave `amaeats_auth_v1`). Em caso de resposta inválida ou erro 400/401/403, mensagens amigáveis são exibidas. Outros erros de rede são propagados. 【F:src/api/entities.js†L140-L184】
- `User.me()` lê o token guardado; se não existir, retorna `null`. Com token válido, chama `/auth/me`, normaliza a resposta e atualiza o estado persistido. Falhas 401 limpam o armazenamento; outros erros mantêm uma cópia em cache como _fallback_. 【F:src/api/entities.js†L100-L139】
- `apiRequest()` injeta automaticamente o cabeçalho `Authorization` quando há token e converte mensagens de erro estruturadas (`error.code`, `error.message`) em exceções JavaScript. 【F:src/api/httpClient.js†L1-L43】【F:src/api/httpClient.js†L45-L74】
- `User.logout()` chama `/auth/logout` (ignorando falhas), remove o token e o usuário persistidos e devolve `true`. 【F:src/api/entities.js†L186-L197】
- O *hook* `useCurrentUser` continua a orquestrar redirecionamentos pós-login e expõe handlers de entrada/saída de acordo com o `tipo_usuario`, agora sempre respaldado por um token ativo. 【F:src/pages/layouts/useCurrentUser.js†L1-L76】

## Endpoints de autenticação no backend
- `POST /api/auth/login` exige `email` e `password`, compara com `bcrypt`, atualiza `updatedDate` do usuário e `ultimo_login` do entregador (quando aplicável) e retorna `{ token, user }`. 【F:server/src/routes/auth.ts†L1-L74】
- `GET /api/auth/me` utiliza o middleware `authenticate`, que extrai e valida o token, carrega o usuário via Prisma (`publicUserSelect`) e injeta o payload em `res.locals`. A rota responde com o usuário público serializado. 【F:server/src/middleware/authenticate.ts†L1-L46】【F:server/src/routes/auth.ts†L76-L84】
- `POST /api/auth/logout` mantém a mesma semântica (`204`), cabendo ao cliente descartar o token. 【F:server/src/routes/auth.ts†L72-L74】

## Middleware e proteção de rotas
- `authenticate` verifica o cabeçalho `Authorization`, valida o JWT com `JWT_SECRET` e anexa `req.authUser`. Falhas retornam erros estruturados (`MISSING_TOKEN`, `INVALID_AUTH_HEADER`, `INVALID_TOKEN`, `USER_NOT_FOUND`). 【F:server/src/middleware/authenticate.ts†L1-L45】
- Todas as rotas sob `/api` (exceto `/auth`) passam pelo middleware, garantindo que operações com usuários, pedidos, entregadores etc. exijam token válido. 【F:server/src/routes/index.ts†L1-L33】
- `loginRateLimiter` restringe o endpoint `POST /api/auth/login` a **5 tentativas por IP a cada 15 minutos**. Disparos excedidos retornam `429` com payload estruturado e cabeçalho `Retry-After`, além de gerar logs `console.warn` com o IP, caminho e janela aplicada para facilitar o monitoramento de ataques de força bruta. 【F:server/src/middleware/rate-limit.ts†L1-L33】【F:server/src/routes/auth.ts†L1-L76】

## Estado e armazenamento de sessão
- `src/api/session.js` centraliza leitura/escrita de `{ token, user }`, incluindo *fallback* para ambientes não browser e limpeza automática de payloads corrompidos. 【F:src/api/session.js†L1-L36】
- Dados sensíveis residem apenas no token em memória/localStorage; nenhuma informação de sessão é mantida no banco além de `ultimo_login` e `updated_date`.

## Melhorias implementadas para padrão profissional
1. **Token JWT curto** — substitui dependência de IDs no cliente, permitindo invalidação por expiração. Variáveis de ambiente `JWT_SECRET` e `JWT_EXPIRES_IN` controlam assinatura e validade. 【F:server/src/env.ts†L1-L23】【F:server/src/utils/auth.ts†L1-L39】
2. **Proteção de rotas** — middleware dedicado garante que apenas usuários autenticados acessem recursos sensíveis.
3. **Paginação + headers expostos** — todas as listagens aceitam `limit`/`skip` e devolvem `X-Total-Count`, `X-Limit`, `X-Skip`, expondo as informações via CORS. 【F:server/src/app.ts†L1-L33】【F:server/src/utils/pagination.ts†L1-L51】
4. **Erros estruturados** — respostas de erro seguem o formato `{ error: { code, message, details? } }`, oferecendo contexto consistente ao frontend. 【F:server/src/utils/errors.ts†L1-L35】【F:server/src/app.ts†L9-L33】

## Recomendações futuras
1. **Refresh tokens e rotação** — introduzir `refresh_token` em cookie `HttpOnly` e limitar o JWT de acesso a minutos.
2. **Escopos e RBAC** — usar `role` no payload para diferenciar permissões (restaurante, entregador, administrador) em middleware específicos.
3. **Observabilidade** — registrar tentativas de login falhas, bloqueios e métricas de latência no APM.
4. **Segurança avançada** — suporte a MFA, política de senhas, revogação antecipada de tokens e listas de confiança de dispositivos.
5. **Testes automatizados** — cobrir fluxos de login/logout e rotas protegidas com testes end-to-end e integração.

## Testes manuais sugeridos
1. Autenticar com credenciais válidas e confirmar presença do cabeçalho `Authorization` nas chamadas subsequentes (via devtools).
2. Forçar expiração do token (alterando `JWT_EXPIRES_IN` para valor curto) e verificar se o frontend redireciona para login após `401`.
3. Remover o usuário no banco e confirmar que `User.me()` limpa automaticamente a sessão persistida.
4. Validar mensagens de erro estruturadas (401, 404, 409) exibidas ao usuário final.

Esses passos garantem que o sistema atual opere com o padrão de autenticação esperado e apontam caminhos claros para futuras evoluções corporativas.
