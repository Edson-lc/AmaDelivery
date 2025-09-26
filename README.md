# AmaDelivery

Aplicação full-stack para gestão de entregas, composta por um front-end em React/Vite e uma API Express com Prisma.

## Autor

- Edson Cardoso

## Requisitos

- Node.js 20 ou superior e npm
- PostgreSQL 14+ (local ou em container Docker)

## Passo a passo para rodar o projeto

1. **Clonar o repositório e instalar dependências do front-end**
   ```bash
   git clone <url-do-repositorio>
   cd AmaDelivery
   npm install
   ```

2. **Instalar dependências do servidor**
   ```bash
   cd server
   npm install
   ```

3. **Configurar variáveis de ambiente do servidor**
   ```bash
   cp .env.example .env
   # edite o arquivo .env com as credenciais do banco de dados
   ```

4. **Subir o PostgreSQL (exemplo com Docker)**
   ```bash
   docker run --name amadelivery-postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=amaeats \
     -p 5432:5432 -d postgres:16
   ```

5. **Gerar o cliente Prisma, aplicar o schema e popular dados iniciais (opcional)**
   ```bash
   npm run prisma:generate
   npm run prisma:push
   npm run seed   # opcional, para dados de exemplo
   ```

6. **Rodar a API em modo desenvolvimento**
   ```bash
   npm run dev
   ```

7. **Rodar o front-end em outro terminal**
   ```bash
   cd ..
   npm run dev
   ```

## Scripts úteis

- `npm run build` — gera build de produção do front-end.
- `npm run preview` — executa o front-end gerado localmente.
- `cd server && npm run build` — compila a API para produção.
- `cd server && npm start` — inicia a API compilada.

## Licença

Uso interno. Ajuste conforme a necessidade do seu projeto.
