# API Campo Minado

API REST em Node.js para uma plataforma de apostas baseada em Campo Minado.

## Tecnologias

- Node.js
- Express.js
- PostgreSQL
- cors
- dotenv
- nodemon

## Integrantes

* Matheus Henrique da Silva Ferreira


## Estrutura

src/
	app.js
	config/
		db.js
	controllers/
	modules/
	repositories/
	routes/
	services/

## Instalacao

Clone o repositório:
git clone https://github.com/usuario/api-campo-minado.git

bash
npm install


## Executando

npm run dev

## Endpoints

### Auth

- POST /auth/register
- POST /auth/login
- PATCH /auth/reset-password

### Users

- GET /users/:id
- GET /users/dashboard?idUser=1 (ou header x-user-id)
- PUT /users/:id
- DELETE /users/:id

### Games

- POST /games/start
- POST /games/:gameId/reveal
- POST /games/:gameId/cashout

## Regras implementadas

- Senha com minimo de 8 caracteres, 1 maiuscula, 1 numero e 1 especial.
- Validacao de e-mail duplicado no cadastro.
- Nao permite saldo negativo e limita para duas casas decimais.
- Relacao 1:N entre usuario e jogos com foreign key e `ON DELETE CASCADE`.
- Nao permite iniciar nova partida com partida em andamento.
- Nao permite revelar posicao repetida.
- Debita saldo ao iniciar jogo e credita ao fazer cashout.


Ordem recomendada para testar o fluxo completo:

1. Health Check
2. POST /auth/register
3. POST /auth/login
4. PUT /users/:id (definir saldo)
5. POST /games/start
6. POST /games/:gameId/reveal
7. POST /games/:gameId/cashout
8. GET /users/dashboard
9. DELETE /users/:id

Observacoes:

- Os requests de cadastro e inicio de jogo salvam automaticamente `userId` e `gameId` no environment.
- Se `register` retornar e-mail duplicado, altere `userEmail` no environment e rode novamente.
