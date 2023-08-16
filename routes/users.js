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
router.patch('/users/me', updateProfile);

 //обновляет аватар
 router.patch('/users/me/avatar', updateAvatar);

 module.exports = router;
