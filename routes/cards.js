const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const {
  getCards,
  createCard,
  deleteCardById,
  putLikeCardById,
  deleteLikeCardById,
} = require("../controllers/cards");

const { REGEX } = require("../utils/constants");

// возвращает все карточки
router.get("/cards", getCards);

// создаёт карточку
router.post(
  "/cards",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      link: Joi.string().required().pattern(REGEX),
    }),
  }),
  createCard,
);

// удаляет карточку по идентификатору
router.delete(
  "/cards/:cardId",
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().alphanum().length(24).hex(),
    }),
  }),
  deleteCardById,
);

// поставить лайк карточке
router.put(
  "/cards/:cardId/likes",
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().alphanum().length(24).hex(),
    }),
  }),
  putLikeCardById,
);

// убрать лайк с карточки
router.delete(
  "/cards/:cardId/likes",
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().alphanum().length(24).hex(),
    }),
  }),
  deleteLikeCardById,
);

module.exports = router;
