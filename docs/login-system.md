# Sistema de Login

## Visão Geral
O fluxo de autenticação do AmaEats é composto por uma camada de API REST no backend Express/Prisma e utilitários de sessão no frontend React. O login é realizado através do endpoint `POST /auth/login`, que valida credenciais com `bcrypt` e devolve os metadados públicos do utilizador. O frontend guarda esses dados em `localStorage` para manter a sessão entre recarregamentos e utiliza-os para personalizar a navegação e controlar o acesso às diferentes áreas do produto.

## Fluxo de autenticação no frontend
- A API utilitária `User.login(credentials)` normaliza o e-mail e a palavra-passe, valida entradas obrigatórias e chama o endpoint `/auth/login`. Em caso de sucesso, a resposta é convertida para *snake_case* e guardada em `localStorage`, ficando disponível para o resto da aplicação. Erros 400, 401 e 403 devolvem mensagens específicas para o utilizador, enquanto outras falhas de rede propagam a exceção original para permitir diagnósticos. 【F:src/api/entities.js†L112-L161】
- `User.me()` tenta sincronizar a sessão guardada com a API. Quando o backend devolve 401/404 (por exemplo, utilizador removido ou sessão inválida), o registo local é removido para evitar perfis obsoletos. Em outros erros temporários a aplicação mantém a cópia local como *fallback* para melhorar a resiliência offline. 【F:src/api/entities.js†L80-L111】
- `User.login()` chamado sem credenciais (por exemplo, pelo botão "Iniciar Sessão" da *PublicLayout*) redireciona o navegador para `/Login` com um parâmetro `redirect` baseado na rota atual. 【F:src/api/entities.js†L130-L142】
- O *hook* `useCurrentUser` consulta `User.me()` no carregamento, atualiza o estado global e aplica redirecionamentos contextuais (dashboard administrativo, painel do restaurante ou do entregador) conforme o `tipo_usuario`. Também expõe *handlers* de login/logout para os layouts. 【F:src/pages/layouts/useCurrentUser.js†L1-L76】
- A página `Login.jsx` apresenta o formulário de credenciais, usa `User.login({ email, password })` e direciona o utilizador para a rota adequada (ou para `redirect`) quando a autenticação tem sucesso. Mensagens de erro vindas da API são mostradas acima do botão. 【F:src/pages/Login.jsx†L1-L83】

## Endpoint de autenticação no backend
- `POST /auth/login` valida a presença de e-mail e senha, procura o utilizador no PostgreSQL via Prisma, compara a palavra-passe com `bcrypt` e retorna um objeto sanitizado (`publicUserSelect`). Ao autenticar um entregador a API atualiza automaticamente o campo `ultimo_login` na tabela de entregadores e atualiza `updated_date` do utilizador, fornecendo uma trilha de auditoria mínima. 【F:server/src/routes/auth.ts†L1-L58】
- `POST /auth/logout` responde com `204 No Content` e o frontend limpa qualquer informação persistida localmente. Não há estado de sessão mantido pelo servidor neste momento. 【F:server/src/routes/auth.ts†L60-L62】【F:src/api/entities.js†L163-L170】

## Estado e armazenamento de sessão
- O utilizador autenticado é serializado em `localStorage` na chave `amaeats_user`. Dados inválidos ou não parseáveis são removidos imediatamente para evitar corrupção. 【F:src/api/entities.js†L66-L78】
- Durante o *logout*, o frontend invoca `/auth/logout` (ignorando falhas) e apaga o registo local para garantir que a interface volta ao estado público. 【F:src/api/entities.js†L163-L170】
- O backend não gera *tokens* nem cookies de sessão; toda a autenticação subsequente depende do ID guardado no cliente para buscar o perfil em `/users/:id`.

## Limitações atuais
1. Como não existe *token* nem cookie seguro, qualquer script com acesso ao `localStorage` consegue assumir a sessão do utilizador. A autenticação é, portanto, vulnerável a XSS e não deve ser considerada pronta para produção. 【F:src/api/entities.js†L66-L106】
2. As permissões da API dependem de validações no frontend e de chamadas públicas (`/users/:id` não requer autenticação); endpoints sensíveis devem ser protegidos no servidor para evitar fuga de dados.
3. Não há limitação de tentativas, MFA, nem auditoria estruturada além da atualização de `updated_date` e `ultimo_login` para entregadores.

## Recomendações para um padrão profissional
1. **Sessões seguras** — Implementar autenticação baseada em cookies HTTP-only ou *tokens* JWT curtos, enviados com `credentials: 'include'`, e proteger todas as rotas privadas com middleware de autorização.
2. **Gestão de sessão no servidor** — Adicionar endpoint `GET /auth/me` que derive a identidade do cookie/token em vez de confiar em IDs guardados no cliente. Isso evita manipulação de sessões e simplifica a sincronização.
3. **Armazenamento protegido** — Evitar guardar dados sensíveis em `localStorage`; preferir *state* em memória + *refresh tokens* em cookies seguros.
4. **Hardening** — Adicionar limitação de tentativas, logging estruturado, alertas para acessos suspeitos e suporte a MFA/recuperação de senha.
5. **Política de palavras-passe** — Validar complexidade mínima no backend e fornecer feedback no frontend. Considerar suporte a SSO (Google, Apple, etc.) dependendo da estratégia de produto.
6. **Testes e monitorização** — Criar testes automatizados para fluxos de login/logout, monitorizar tempos de resposta do endpoint e falhas via ferramentas APM.
7. **Comunicação segura** — Garantir HTTPS obrigatório, `SameSite=strict` para cookies e cabeçalhos de segurança (`Content-Security-Policy`, `Strict-Transport-Security`) para mitigar XSS/CSRF.

## Testes manuais sugeridos
1. Realizar login com credenciais válidas e confirmar redirecionamento para a área correspondente (admin, restaurante, entregador ou cliente).
2. Validar mensagens de erro ao informar e-mail inválido, ausência de senha e senha incorreta.
3. Forçar a remoção do utilizador no banco e garantir que `User.me()` limpa o estado local em seguida.
4. Confirmar que o timestamp `ultimo_login` de entregadores é atualizado após autenticação (via banco ou endpoint de entregadores).

Estas ações garantem que o sistema atual funciona conforme esperado e indicam o caminho para evoluir a experiência para requisitos empresariais.
