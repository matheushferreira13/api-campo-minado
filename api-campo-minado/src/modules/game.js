const BOARD_SIZE = 5;
const BOMB_COUNT = 5;

function roundMoney(value) {
  return Number(Number(value).toFixed(2));
}

function parseMoney(value, { allowZero = true } = {}) {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return null;
  }

  const min = allowZero ? 0 : Number.EPSILON;
  if (numeric < min) {
    return null;
  }

  const cents = numeric * 100;
  if (Math.abs(cents - Math.round(cents)) > 1e-6) {
    return null;
  }

  return roundMoney(numeric);
}

function calculatePrize(valorAposta, quantidadeDiamantes) {
  const prize = valorAposta * (1 + quantidadeDiamantes * 0.33);
  return roundMoney(prize);
}

function createBoard() {
  const board = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => "DIAMANTE")
  );

  let bombsPlaced = 0;
  while (bombsPlaced < BOMB_COUNT) {
    const row = Math.floor(Math.random() * BOARD_SIZE);
    const col = Math.floor(Math.random() * BOARD_SIZE);

    if (board[row][col] === "BOMBA") {
      continue;
    }

    board[row][col] = "BOMBA";
    bombsPlaced += 1;
  }

  return board;
}

function isInsideBoard(linha, coluna) {
  return (
    Number.isInteger(linha) &&
    Number.isInteger(coluna) &&
    linha >= 1 &&
    linha <= BOARD_SIZE &&
    coluna >= 1 &&
    coluna <= BOARD_SIZE
  );
}

function getPositionKey(linha, coluna) {
  return `${linha}-${coluna}`;
}

module.exports = {
  BOARD_SIZE,
  BOMB_COUNT,
  roundMoney,
  parseMoney,
  calculatePrize,
  createBoard,
  isInsideBoard,
  getPositionKey
};