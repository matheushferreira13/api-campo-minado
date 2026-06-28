class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

function errorMiddleware(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ mensagem: err.message });
  }

  console.error(err);
  return res.status(500).json({ mensagem: "Erro interno do servidor" });
}

module.exports = {
  AppError,
  asyncHandler,
  errorMiddleware
};