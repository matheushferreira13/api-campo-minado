const userRepository = require("../repositories/userRepository");
const { AppError } = require("../modules/http");
const {
  validatePasswordRules,
  hashPassword,
  verifyPassword
} = require("../modules/password");

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function formatDate(dateValue) {
  return new Date(dateValue).toISOString().slice(0, 10);
}

function toUserResponse(user) {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    dataNascimento: formatDate(user.data_nascimento),
    saldo: Number(user.saldo)
  };
}

async function register(payload) {
  const { nome, email, dataNascimento, senha, confirmacaoSenha } = payload;

  if (!nome || !email || !dataNascimento || !senha || !confirmacaoSenha) {
    throw new AppError("Todos os campos obrigatorios devem ser informados", 400);
  }

  if (senha !== confirmacaoSenha) {
    throw new AppError("Senha e confirmacao de senha nao conferem", 400);
  }

  if (!validatePasswordRules(senha)) {
    throw new AppError(
      "A senha deve ter ao menos 8 caracteres, uma letra maiuscula, um numero e um caractere especial",
      400
    );
  }

  const normalizedEmail = normalizeEmail(email);
  const duplicatedUser = await userRepository.findByEmail(normalizedEmail);
  if (duplicatedUser) {
    throw new AppError("E-mail ja cadastrado", 409);
  }

  const passwordHash = await hashPassword(senha);
  const createdUser = await userRepository.createUser({
    nome: String(nome).trim(),
    email: normalizedEmail,
    dataNascimento,
    senha: passwordHash,
    saldo: 0
  });

  return toUserResponse(createdUser);
}

async function login(payload) {
  const { email, senha } = payload;

  if (!email || !senha) {
    throw new AppError("Email e senha sao obrigatorios", 400);
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await userRepository.findByEmail(normalizedEmail);
  if (!user) {
    throw new AppError("Credenciais invalidas", 401);
  }

  const passwordMatch = await verifyPassword(senha, user.senha);
  if (!passwordMatch) {
    throw new AppError("Credenciais invalidas", 401);
  }

  return {
    nome: user.nome,
    email: user.email,
    dataNascimento: formatDate(user.data_nascimento)
  };
}

async function resetPassword(payload) {
  const { id, novaSenha } = payload;

  const userId = Number(id);
  if (!Number.isInteger(userId) || userId <= 0 || !novaSenha) {
    throw new AppError("Campos id e novaSenha sao obrigatorios", 400);
  }

  if (!validatePasswordRules(novaSenha)) {
    throw new AppError(
      "A senha deve ter ao menos 8 caracteres, uma letra maiuscula, um numero e um caractere especial",
      400
    );
  }

  const user = await userRepository.findByIdForAuth(userId);
  if (!user) {
    throw new AppError("Usuario nao encontrado", 404);
  }

  const sameAsCurrent = await verifyPassword(novaSenha, user.senha);
  if (sameAsCurrent) {
    throw new AppError("A nova senha nao pode ser igual a senha atual", 400);
  }

  const newPasswordHash = await hashPassword(novaSenha);
  await userRepository.updatePassword(userId, newPasswordHash);

  return { mensagem: "Senha atualizada com sucesso" };
}

module.exports = {
  register,
  login,
  resetPassword
};