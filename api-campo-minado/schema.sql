CREATE DATABASE campo_minado;

\c campo_minado;


CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,

    nome VARCHAR(100) NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,

    data_nascimento DATE NOT NULL,

    senha VARCHAR(255) NOT NULL,

    saldo NUMERIC(10,2) DEFAULT 0
);


CREATE TABLE jogos (

    id SERIAL PRIMARY KEY,

    usuario_id INTEGER NOT NULL,

    valor_aposta NUMERIC(10,2),

    premio_atual NUMERIC(10,2) DEFAULT 0,

    diamantes_encontrados INTEGER DEFAULT 0,

    status VARCHAR(30) DEFAULT 'EM_ANDAMENTO',

    tabuleiro JSONB,

    posicoes_reveladas JSONB,

    FOREIGN KEY(usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
);