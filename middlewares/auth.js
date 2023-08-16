const jwtmodule = require('jsonwebtoken');
const httpConstants = require('http2').constants;
const { JWT_SECRET = 'secret' } = process.env;
const UnauthorizedError = require('../errors/unauthorized-error');

module.exports = (req, res, next) => {
  console.log(`jwt: ${req.cookies.jwt}`)
  const { jwt } = req.cookies;
  console.log(`token: ${jwt}`)

  if (!jwt) {
    return next(new UnauthorizedError('Передан неверный логин или пароль'));
    //return res.status(httpConstants.HTTP_STATUS_UNAUTHORIZED).send({ message: 'Передан неверный логин или пароль'});
  }
  //const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwtmodule.verify(jwt, JWT_SECRET);

  } catch (err) {
    return next(new UnauthorizedError('Необходима авторизация'));
    //return res.status(httpConstants.HTTP_STATUS_UNAUTHORIZED).send({ message: 'Необходима авторизация'});
  }

  req.user = payload;

  next();
}
