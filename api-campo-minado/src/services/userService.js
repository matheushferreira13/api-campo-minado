const userRepository = require("../repositories/userRepository");
const { AppError } = require("../modules/http");
const { parseMoney, roundMoney } = require("../modules/game");

function parseUserId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

function formatDate(dateValue) {
  return new Date(dateValue).toISOString().slice(0, 10);
}

function toUserProfileResponse(user) {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    dataNascimento: formatDate(user.data_nascimento),
    saldo: roundMoney(user.saldo)
  };
}

async function getById(idParam) {
  const id = parseUserId(idParam);
  if (!id) {
    throw new AppError("ID de usuario invalido", 400);
  }

  const user = await userRepository.findById(id);
  if (!user) {
    throw new AppError("Usuario nao encontrado", 404);
  }

  return toUserProfileResponse(user);
}

async function getDashboard(userIdParam) {
  const id = parseUserId(userIdParam);
  if (!id) {
    throw new AppError("Informe o id do usuario em idUser (query) ou x-user-id (header)", 400);
  }

  const user = await userRepository.findById(id);
  if (!user) {
    throw new AppError("Usuario nao encontrado", 404);
  }

  const stats = await userRepository.getDashboardStats(id);
  if (!stats) {
    return {
      totalJogos: 0,
      vitorias: 0,
      derrotas: 0,
      valorGanho: 0,
      valorPerdido: 0
    };
  }

  return {
    totalJogos: Number(stats.total_jogos),
    vitorias: Number(stats.vitorias),
    derrotas: Number(stats.derrotas),
    valorGanho: roundMoney(stats.valor_ganho),
    valorPerdido: roundMoney(stats.valor_perdido)
  };
}

async function updateSaldo(idParam, saldoValue) {
  const id = parseUserId(idParam);
  if (!id) {
    throw new AppError("ID de usuario invalido", 400);
  }

  const parsedSaldo = parseMoney(saldoValue, { allowZero: true });
  if (parsedSaldo === null) {
    throw new AppError("Saldo invalido. Informe um valor positivo com ate duas casas decimais", 400);
  }

  const user = await userRepository.findById(id);
  if (!user) {
    throw new AppError("Usuario nao encontrado", 404);
  }

  const updatedUser = await userRepository.setSaldo(id, parsedSaldo);
  return toUserProfileResponse(updatedUser);
}

async function remove(idParam) {
  const id = parseUserId(idParam);
  if (!id) {
    throw new AppError("ID de usuario invalido", 400);
  }

  const user = await userRepository.findById(id);
  if (!user) {
    throw new AppError("Usuario nao encontrado", 404);
  }

  await userRepository.deleteById(id);
  return { mensagem: "Usuario removido com sucesso" };
}

module.exports = {
  getById,
  getDashboard,
  updateSaldo,
  remove
};