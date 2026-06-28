# API Campo Minado

API REST desenvolvida em Node.js para uma plataforma de apostas baseada no jogo Campo Minado.

## Tecnologias Utilizadas

- Node.js
- Express.js
- PostgreSQL
- dotenv
- cors
- nodemon

## Integrantes

- Matheus Henrique da Silva Ferreira

## Estrutura

text
src/
  app.js
  config/
    db.js
  controllers/
  modules/
  repositories/
  routes/
  services/


## Instalação

Clone o repositório:

bash
git clone https://github.com/usuario/api-campo-minado.git


Acesse a pasta do projeto:

bash
cd api-campo-minado


Instale as dependências:

bash
npm install


## Configuração

Crie um arquivo `.env` na raiz do projeto:

env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=campo_minado
DB_USER=postgres
DB_PASSWORD=postgres
PORT=3000
NODE_ENV=development


## Executando a aplicação

bash
npm run db:create
npm run dev


A API estará disponível em:

text
http://localhost:3000


## Endpoints

### Cadastro de usuário

- POST `/auth/register`

### Login

- POST `/auth/login`

### Redefinir senha

- PATCH `/auth/reset-password`

### Perfil do usuário

- GET `/users/:id`
- GET `/users/dashboard?idUser=1`
- PUT `/users/:id`
- DELETE `/users/:id`

### Jogo

- POST `/games/start`
- POST `/games/:gameId/reveal`
- POST `/games/:gameId/cashout`
