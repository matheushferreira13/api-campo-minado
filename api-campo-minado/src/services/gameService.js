const pool = require("../config/db");
const userRepository = require("../repositories/userRepository");
const gameRepository = require("../repositories/gameRepository");
const { AppError } = require("../modules/http");
const {
  parseMoney,
  createBoard,
  isInsideBoard,
  getPositionKey,
  calculatePrize,
  roundMoney
} = require("../modules/game");

function parsePositiveInt(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }
  return parsed;
}

function parseGameForDomain(game) {
  return {
    ...game,
    valor_aposta: Number(game.valor_aposta),
    premio_atual: Number(game.premio_atual),
    premio_final: game.premio_final === null ? null : Number(game.premio_final),
    diamantes_encontrados: Number(game.diamantes_encontrados),
    tabuleiro: game.tabuleiro || [],
    posicoes_reveladas: game.posicoes_reveladas || []
  };
}

async function start(payload) {
  const userId = parsePositiveInt(payload.idUser);
  if (!userId) {
    throw new AppError("idUser invalido", 400);
  }

  const betValue = parseMoney(payload.valorAposta, { allowZero: false });
  if (betValue === null) {
    throw new AppError("valorAposta invalido. Use valor positivo com ate duas casas decimais", 400);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const user = await userRepository.findByIdForUpdate(userId, client);
    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }

    if (Number(user.saldo) < betValue) {
      throw new AppError("Saldo insuficiente para iniciar a aposta", 400);
    }

    const activeGame = await gameRepository.findActiveGameByUserId(userId, client);
    if (activeGame) {
      throw new AppError("O usuario ja possui partida em andamento", 400);
    }

    const newSaldo = roundMoney(Number(user.saldo) - betValue);
    await userRepository.setSaldo(userId, newSaldo, client);

    const board = createBoard();
    const createdGame = await gameRepository.createGame(
      {
        usuarioId: userId,
        valorAposta: betValue,
        premioAtual: betValue,
        premioFinal: null,
        diamantesEncontrados: 0,
        status: "EM_ANDAMENTO",
        tabuleiro: board,
        posicoesReveladas: []
      },
      client
    );

    await client.query("COMMIT");
    return { gameId: createdGame.id };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function reveal(gameIdParam, payload) {
  const gameId = parsePositiveInt(gameIdParam);
  if (!gameId) {
    throw new AppError("gameId invalido", 400);
  }

  const linha = Number(payload.linha);
  const coluna = Number(payload.coluna);

  if (!isInsideBoard(linha, coluna)) {
    throw new AppError("Posicao invalida. Informe linha e coluna entre 1 e 5", 400);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const gameRow = await gameRepository.findByIdForUpdate(gameId, client);
    if (!gameRow) {
      throw new AppError("Partida nao encontrada", 404);
    }

    const game = parseGameForDomain(gameRow);
    if (game.status !== "EM_ANDAMENTO") {
      throw new AppError("A partida ja foi finalizada", 400);
    }

    const selectedPosition = getPositionKey(linha, coluna);
    if (game.posicoes_reveladas.includes(selectedPosition)) {
      throw new AppError("Posicao ja escolhida. Selecione outra posicao", 400);
    }

    const updatedPositions = [...game.posicoes_reveladas, selectedPosition];
    const cell = game.tabuleiro[linha - 1][coluna - 1];

    if (cell === "BOMBA") {
      await gameRepository.updateGameState(
        {
          id: game.id,
          premioAtual: 0,
          premioFinal: 0,
          diamantesEncontrados: game.diamantes_encontrados,
          status: "PERDIDO",
          posicoesReveladas: updatedPositions
        },
        client
      );

      await client.query("COMMIT");
      return {
        resultado: "BOMBA",
        status: "PERDIDO"
      };
    }

    const totalDiamonds = game.diamantes_encontrados + 1;
    const currentPrize = calculatePrize(game.valor_aposta, totalDiamonds);

    await gameRepository.updateGameState(
      {
        id: game.id,
        premioAtual: currentPrize,
        premioFinal: null,
        diamantesEncontrados: totalDiamonds,
        status: "EM_ANDAMENTO",
        posicoesReveladas: updatedPositions
      },
      client
    );

    await client.query("COMMIT");
    return {
      resultado: "DIAMANTE",
      diamantesEncontrados: totalDiamonds,
      premioAtual: currentPrize
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function cashout(gameIdParam) {
  const gameId = parsePositiveInt(gameIdParam);
  if (!gameId) {
    throw new AppError("gameId invalido", 400);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const gameRow = await gameRepository.findByIdForUpdate(gameId, client);
    if (!gameRow) {
      throw new AppError("Partida nao encontrada", 404);
    }

    const game = parseGameForDomain(gameRow);
    if (game.status !== "EM_ANDAMENTO") {
      throw new AppError("A partida ja foi finalizada", 400);
    }

    const user = await userRepository.findByIdForUpdate(game.usuario_id, client);
    if (!user) {
      throw new AppError("Usuario nao encontrado", 404);
    }

    const payout = roundMoney(game.premio_atual);
    await userRepository.incrementSaldo(game.usuario_id, payout, client);

    await gameRepository.updateGameState(
      {
        id: game.id,
        premioAtual: game.premio_atual,
        premioFinal: payout,
        diamantesEncontrados: game.diamantes_encontrados,
        status: "SACADO",
        posicoesReveladas: game.posicoes_reveladas
      },
      client
    );

    await client.query("COMMIT");
    return {
      status: "SACADO",
      premioFinal: payout
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  start,
  reveal,
  cashout
};