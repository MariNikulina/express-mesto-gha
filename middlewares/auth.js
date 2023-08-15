const jwt = require('jsonwebtoken');
const httpConstants = require('http2').constants;
const { JWT_SECRET = 'secret' } = process.env;
const UnauthorizedError = require('../errors/unauthorized-error');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  console.log(`текст: ${authorization}`);

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Передан неверный логин или пароль'));
    //return res.status(httpConstants.HTTP_STATUS_UNAUTHORIZED).send({ message: 'Передан неверный логин или пароль'});
  }
  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, JWT_SECRET);

  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация'));
    //return res.status(httpConstants.HTTP_STATUS_UNAUTHORIZED).send({ message: 'Необходима авторизация'});
  }

  req.user = payload;

  next();
}
