CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    data_nascimento DATE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    saldo NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (saldo >= 0)
);

CREATE TABLE IF NOT EXISTS jogos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    valor_aposta NUMERIC(10,2) NOT NULL CHECK (valor_aposta > 0),
    premio_atual NUMERIC(10,2) NOT NULL DEFAULT 0,
    premio_final NUMERIC(10,2),
    diamantes_encontrados INTEGER NOT NULL DEFAULT 0 CHECK (diamantes_encontrados >= 0),
    status VARCHAR(30) NOT NULL DEFAULT 'EM_ANDAMENTO',
    tabuleiro JSONB NOT NULL,
    posicoes_reveladas JSONB NOT NULL DEFAULT '[]'::jsonb,
    criado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_usuario_jogo FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_jogos_usuario_status ON jogos(usuario_id, status);