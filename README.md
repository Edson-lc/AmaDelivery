# AmaDelivery

AmaDelivery é uma aplicação full-stack composta por um frontend em React/Vite e um backend em Node.js/Express.
Este documento resume como iniciar cada parte do projeto e como configurar as variáveis de ambiente necessárias
para executar o backend com segurança.

## Pré-requisitos

- Node.js 18+
- npm 9+
- Banco de dados compatível com as configurações do Prisma (PostgreSQL por padrão)

## Configuração do Backend

1. Copie `server/.env.example` para `server/.env` e preencha as variáveis obrigatórias.
2. Instale as dependências do backend:

   ```bash
   cd server
   npm install
   ```

3. Execute as migrações/seed do Prisma conforme necessário.
4. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

### Variáveis de ambiente do backend

| Variável                      | Obrigatória | Descrição                                                                                      |
| ----------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                | Sim         | URL de conexão utilizada pelo Prisma.                                                          |
| `JWT_SECRET`                  | Sim         | Segredo utilizado para assinar tokens JWT. Deve ser forte e único em produção.                |
| `JWT_EXPIRES_IN`              | Não         | Tempo de expiração do token JWT (padrão `1h`).                                                 |
| `PORT`                        | Não         | Porta HTTP utilizada pelo servidor (padrão `4000`).                                            |
| `ALLOWED_ORIGINS`             | Não         | Lista separada por vírgulas com origens permitidas no CORS (padrão `http://localhost:5173`).   |
| `AUTH_RATE_LIMIT_WINDOW_MS`   | Não         | Janela de tempo, em milissegundos, para o rate limit do login (padrão `900000`, 15 minutos).   |
| `AUTH_RATE_LIMIT_MAX`         | Não         | Quantidade máxima de tentativas de login por janela de tempo (padrão `10`).                    |
| `LOG_LEVEL`                   | Não         | Nível mínimo de log (`debug`, `info`, `warn` ou `error`).                                      |

## Configuração do Frontend

1. Instale as dependências do frontend na raiz do projeto:

   ```bash
   npm install
   ```

2. Rode a aplicação Vite:

   ```bash
   npm run dev
   ```

Por padrão o frontend estará disponível em `http://localhost:5173`.

## Scripts úteis

- `npm run dev` (raiz): inicia o frontend em modo desenvolvimento.
- `npm run build` (raiz): gera o build de produção do frontend.
- `npm run dev` (dentro de `server`): inicia o backend com recarregamento automático.
- `npm run lint` (dentro de `server`): executa o ESLint.

## Segurança

- Configure sempre um valor seguro para `JWT_SECRET` antes de iniciar o backend.
- Ajuste `ALLOWED_ORIGINS` para refletir os domínios confiáveis em produção.
- O backend possui rate limiting para autenticação; monitore os logs para ajustar os limites conforme necessário.

## Observabilidade

Os logs do backend são estruturados em JSON e respeitam o nível configurado via `LOG_LEVEL`, facilitando a
integração com ferramentas de monitoramento.
