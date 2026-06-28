const gameService = require("../services/gameService");

async function start(req, res) {
  const result = await gameService.start(req.body);
  return res.status(201).json(result);
}

async function reveal(req, res) {
  const result = await gameService.reveal(req.params.gameId, req.body);
  return res.status(200).json(result);
}

async function cashout(req, res) {
  const result = await gameService.cashout(req.params.gameId);
  return res.status(200).json(result);
}

module.exports = {
  start,
  reveal,
  cashout
};