const jwtmodule = require("jsonwebtoken");

const { JWT_SECRET = "secret" } = process.env;
const UnauthorizedError = require("../errors/unauthorized-error");

module.exports = (req, res, next) => {
  const { jwt } = req.cookies;

  if (!jwt) {
    return next(new UnauthorizedError("Передан неверный логин или пароль"));
  }

  let payload;

  try {
    payload = jwtmodule.verify(jwt, JWT_SECRET);
  } catch (err) {
    return next(new UnauthorizedError("Необходима авторизация"));
  }

  req.user = payload;

  next();
  return true; // добавила для эслинта
};
