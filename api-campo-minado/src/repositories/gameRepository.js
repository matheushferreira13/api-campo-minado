const pool = require("../config/db");

function getExecutor(client) {
  return client || pool;
}

async function createGame(game, client) {
  const db = getExecutor(client);
  const result = await db.query(
    `
      INSERT INTO jogos (
        usuario_id,
        valor_aposta,
        premio_atual,
        premio_final,
        diamantes_encontrados,
        status,
        tabuleiro,
        posicoes_reveladas
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [
      game.usuarioId,
      game.valorAposta,
      game.premioAtual,
      game.premioFinal,
      game.diamantesEncontrados,
      game.status,
      JSON.stringify(game.tabuleiro),
      JSON.stringify(game.posicoesReveladas)
    ]
  );

  return result.rows[0];
}

async function findById(id, client) {
  const db = getExecutor(client);
  const result = await db.query("SELECT * FROM jogos WHERE id = $1", [id]);
  return result.rows[0] || null;
}

async function findByIdForUpdate(id, client) {
  const db = getExecutor(client);
  const result = await db.query("SELECT * FROM jogos WHERE id = $1 FOR UPDATE", [id]);
  return result.rows[0] || null;
}

async function findActiveGameByUserId(userId, client) {
  const db = getExecutor(client);
  const result = await db.query(
    "SELECT * FROM jogos WHERE usuario_id = $1 AND status = 'EM_ANDAMENTO' ORDER BY id DESC LIMIT 1",
    [userId]
  );
  return result.rows[0] || null;
}

async function updateGameState(game, client) {
  const db = getExecutor(client);
  const result = await db.query(
    `
      UPDATE jogos
      SET
        premio_atual = $1,
        premio_final = $2,
        diamantes_encontrados = $3,
        status = $4,
        posicoes_reveladas = $5
      WHERE id = $6
      RETURNING *
    `,
    [
      game.premioAtual,
      game.premioFinal,
      game.diamantesEncontrados,
      game.status,
      JSON.stringify(game.posicoesReveladas),
      game.id
    ]
  );

  return result.rows[0] || null;
}

module.exports = {
  createGame,
  findById,
  findByIdForUpdate,
  findActiveGameByUserId,
  updateGameState
};