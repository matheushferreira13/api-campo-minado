const userService = require("../services/userService");
const { AppError } = require("../modules/http");

async function getById(req, res) {
  const user = await userService.getById(req.params.id);
  return res.status(200).json(user);
}

async function getDashboard(req, res) {
  const userId = req.query.idUser || req.headers["x-user-id"];
  if (!userId) {
    throw new AppError("Informe o id do usuario em ?idUser=1 ou no header x-user-id", 400);
  }

  const stats = await userService.getDashboard(userId);
  return res.status(200).json(stats);
}

async function updateSaldo(req, res) {
  const user = await userService.updateSaldo(req.params.id, req.body.saldo);
  return res.status(200).json(user);
}

async function remove(req, res) {
  const result = await userService.remove(req.params.id);
  return res.status(200).json(result);
}

module.exports = {
  getById,
  getDashboard,
  updateSaldo,
  remove
};