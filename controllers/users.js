const UserModel = require('../models/user');
const httpConstants = require('http2').constants;
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;
const jwt = require('jsonwebtoken');
const { JWT_SECRET = 'secret' } = process.env;

const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const InternalServerError = require('../errors/internal-server-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized-error');

const getUsers = (req, res, next) => {
  console.log(res)
  return UserModel.find()
  .then((users) => res.status(httpConstants.HTTP_STATUS_OK).send(users))
  .catch((err) => next(new InternalServerError('На сервере произошла ошибка')))
};

const getUser = (req, res, next) => {
  const { _id } = req.user;
  return UserModel.findOne({ _id })
  .then((user) => {
    console.log(user)
    if (!user) {
      return next(new ForbiddenError('Попытка удалить чужую карточку'));
      //return res.status(httpConstants.HTTP_STATUS_FORBIDDEN).send({ message: 'Попытка удалить чужую карточку'}) //???
    }
    return res.status(httpConstants.HTTP_STATUS_OK).send(user);
  })
  .catch((err) => next(new InternalServerError('На сервере произошла ошибка')))
 };

const getUserById = (req, res, next) => {
  const { userId } = req.params;
  return UserModel.findById( userId )
  .then((user) => {
    if (!user) {
      return next(new NotFoundError('Пользователь по указанному _id не найден'));
      //return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден' });
    }
    return res.status(httpConstants.HTTP_STATUS_OK).send(user);
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      return next(new BadRequestError('Передан невалидный _id'));
      //return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан невалидный _id' });
    }
    return next(new InternalServerError('На сервере произошла ошибка'));
  })
};

const createUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
    //return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Email и password не могут быть пустыми' });
  }

  bcrypt.hash(password, SALT_ROUNDS)
  .then(hash => UserModel.create({ name, about, avatar, email, password: hash }))
  .then(user => {
    const { _id, email, name, about, avatar } = user;
    return res.status(httpConstants.HTTP_STATUS_CREATED).send({ _id, email, name, about, avatar });
  })
  .catch((err) => {
    console.log(err)
    if (err.code === 11000) {
      return next(new ConflictError('При регистрации указан email, который уже существует на сервере'));
      //return res.status(httpConstants.HTTP_STATUS_CONFLICT).send({ message: 'При регистрации указан email, который уже существует на сервере' });
    }
    if (err.name === 'ValidationError') {
      return next(new BadRequestError('Переданы некорректные данные при создании пользователя'));
      //return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
    }
    return next(new InternalServerError('На сервере произошла ошибка'))
    //return res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  });
};

const updateProfile = (req, res, next) => {
  console.log(req)
  const { name, about } = req.body;
  const { _id } = req.user;
  return UserModel.findByIdAndUpdate( _id, { name, about }, { new: true, runValidators: true })
  .then((user) => {
    console.log(user)
    console.log(_id)
    if (!user) {
      return next(new NotFoundError('Пользователь по указанному _id не найден'));
      //return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден' });
    }
    return res.status(httpConstants.HTTP_STATUS_OK).send(user)
      })
      .catch((err) => {
        console.log(err)
        if (err.name === 'ValidationError') {
          return next(new BadRequestError('Переданы некорректные данные при обновлении профиля'));
          //return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля' });
        }
        return next(new InternalServerError('На сервере произошла ошибка'))
        //return res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      })
 };

 const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const { _id } = req.user;
  return UserModel.findByIdAndUpdate( _id, { avatar }, { new: true, runValidators: true })
  .then((user) => {
    if (!user) {
      return next(new NotFoundError('Пользователь по указанному _id не найден'));
      //return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден' });
    }
    return res.status(httpConstants.HTTP_STATUS_OK).send(user)
  })
  .catch((err) => {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError('Переданы некорректные данные при обновлении аватара'));
      //return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара' });
    }
    return next(new InternalServerError('На сервере произошла ошибка'))
    //return res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  })
 };

 const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Email и password не могут быть пустыми'));
    //return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Email и password не могут быть пустыми' });
  }

  UserModel.findOne({ email }).select('+password')
  .then((user) => {
    if (!user) {
      return next(new UnauthorizedError('Передан неверный логин или пароль'));
      //return next(new ForbiddenError('Попытка удалить чужую карточку'));
      //return res.status(httpConstants.HTTP_STATUS_FORBIDDEN).send({ message: 'Попытка удалить чужую карточку логин'})
    }
    bcrypt.compare(password, user.password, function (err, isValidPassword) {
      if (!isValidPassword) {
        return next(new UnauthorizedError('Передан неверный логин или пароль'));
        //return res.status(httpConstants.HTTP_STATUS_UNAUTHORISED).send({ message: 'Передан неверный логин или пароль'})
      }
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      console.log(`${email} ${token}`);
      /*return res.status(httpConstants.HTTP_STATUS_OK).send({ token });*/
      return res.status(httpConstants.HTTP_STATUS_OK).cookie('jwt', token, { maxAge: 3600000, httpOnly: true }).send(user);
    });
  })
  .catch((err) => next(new InternalServerError('На сервере произошла ошибка')))
 };


 module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
  login,
  getUser
 };

