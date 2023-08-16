const router = require('express').Router();

const { getUsers, getUserById, updateProfile, updateAvatar, getUser } = require('../controllers/users');

const { celebrate, Joi } = require('celebrate');

//возвращает всех пользователей
router.get('/users', getUsers);

//возвращает информацию о текущем пользователе
router.get('/users/me', getUser);

//возвращает пользователя по _id
router.get('/users/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24),
  }),
 }), getUserById);

//обновляет профиль
router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateProfile);

 //обновляет аватар
 router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(/https?:\/\/[\w\-\._~:\/?#\[\]@!$&'\(\)*\+,;\=]+#?/),
  }),
}), updateAvatar);

 module.exports = router;
