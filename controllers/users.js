const UserModel = require('../models/user');
const httpConstants = require('http2').constants;

const getUsers = (req, res) => {
  console.log(res)
  return UserModel.find()
  .then((users) => res.status(httpConstants.HTTP_STATUS_OK).send(users))
  .catch((err) => res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка'}))
};

const getUserById = (req, res) => {
  const { userId } = req.params;
  return UserModel.findById( userId )
  .then((user) => {
    if (!user) {
      return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь по указанному _id не найден' });
    }
    return res.status(httpConstants.HTTP_STATUS_OK).send(user);
  })
  .catch((err) => {
    if (err.name === 'CastError') {
      return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан невалидный _id' });
    }
    res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка'});
  })
};

const createUser = (req, res) => {
  return UserModel.create({ ...req.body })
  .then(user => res.status(httpConstants.HTTP_STATUS_CREATED).send(user))
  .catch((err) => {
    console.log(err)
    if (err.name === 'ValidationError') {
      return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя' });
    }
    return res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;
  const { _id } = req.user;
  return UserModel.findByIdAndUpdate( _id, { name, about }, { new: true, runValidators: true })
  .then((user) => {
    /*const { name, about } = user;*/
    if (!user) {
      return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден' });
    }
    return res.status(httpConstants.HTTP_STATUS_OK).send(user)
      })
      .catch((err) => {
        console.log(err)
        if (err.name === 'ValidationError') {
      return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля' });
    }
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      });
 };

 const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const { _id } = req.user;
  return UserModel.findByIdAndUpdate( _id, { avatar }, { new: true, runValidators: true })
  .then((user) => {
    if (!user) {
      return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь с указанным _id не найден' });
    }
    return res.status(httpConstants.HTTP_STATUS_OK).send(user)
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
      return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара' });
    }
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      });
 };

 module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar
 };

