const authService = require("../services/authService");

async function register(req, res) {
  const user = await authService.register(req.body);
  return res.status(201).json(user);
}

async function login(req, res) {
  const user = await authService.login(req.body);
  return res.status(200).json(user);
}

async function resetPassword(req, res) {
  const result = await authService.resetPassword(req.body);
  return res.status(200).json(result);
}

module.exports = {
  register,
  login,
  resetPassword
};