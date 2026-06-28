const pool = require("../config/db");

function getExecutor(client) {
  return client || pool;
}

async function createUser(user, client) {
  const db = getExecutor(client);
  const result = await db.query(
    `
      INSERT INTO usuarios (nome, email, data_nascimento, senha, saldo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, nome, email, data_nascimento, saldo
    `,
    [user.nome, user.email, user.dataNascimento, user.senha, user.saldo || 0]
  );

  return result.rows[0];
}

async function findByEmail(email, client) {
  const db = getExecutor(client);
  const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [email]);
  return result.rows[0] || null;
}

async function findById(id, client) {
  const db = getExecutor(client);
  const result = await db.query(
    "SELECT id, nome, email, data_nascimento, saldo FROM usuarios WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

async function findByIdForAuth(id, client) {
  const db = getExecutor(client);
  const result = await db.query("SELECT * FROM usuarios WHERE id = $1", [id]);
  return result.rows[0] || null;
}

async function findByIdForUpdate(id, client) {
  const db = getExecutor(client);
  const result = await db.query("SELECT * FROM usuarios WHERE id = $1 FOR UPDATE", [id]);
  return result.rows[0] || null;
}

async function updatePassword(id, newPasswordHash, client) {
  const db = getExecutor(client);
  const result = await db.query(
    "UPDATE usuarios SET senha = $1 WHERE id = $2 RETURNING id",
    [newPasswordHash, id]
  );
  return result.rows[0] || null;
}

async function setSaldo(id, saldo, client) {
  const db = getExecutor(client);
  const result = await db.query(
    "UPDATE usuarios SET saldo = $1 WHERE id = $2 RETURNING id, nome, email, data_nascimento, saldo",
    [saldo, id]
  );
  return result.rows[0] || null;
}

async function incrementSaldo(id, amount, client) {
  const db = getExecutor(client);
  const result = await db.query(
    `
      UPDATE usuarios
      SET saldo = saldo + $1
      WHERE id = $2
      RETURNING id, nome, email, data_nascimento, saldo
    `,
    [amount, id]
  );
  return result.rows[0] || null;
}

async function deleteById(id, client) {
  const db = getExecutor(client);
  const result = await db.query("DELETE FROM usuarios WHERE id = $1 RETURNING id", [id]);
  return result.rows[0] || null;
}

async function getDashboardStats(id, client) {
  const db = getExecutor(client);
  const result = await db.query(
    `
      SELECT
        COUNT(j.id)::int AS total_jogos,
        COUNT(*) FILTER (WHERE j.status = 'SACADO')::int AS vitorias,
        COUNT(*) FILTER (WHERE j.status = 'PERDIDO')::int AS derrotas,
        COALESCE(SUM(CASE WHEN j.status = 'SACADO' THEN j.premio_final ELSE 0 END), 0) AS valor_ganho,
        COALESCE(SUM(CASE WHEN j.status = 'PERDIDO' THEN j.valor_aposta ELSE 0 END), 0) AS valor_perdido
      FROM usuarios u
      LEFT JOIN jogos j ON j.usuario_id = u.id
      WHERE u.id = $1
      GROUP BY u.id
    `,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  createUser,
  findByEmail,
  findById,
  findByIdForAuth,
  findByIdForUpdate,
  updatePassword,
  setSaldo,
  incrementSaldo,
  deleteById,
  getDashboardStats
};