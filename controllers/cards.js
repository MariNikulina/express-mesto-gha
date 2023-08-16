const httpConstants = require("http2").constants;

const CardModel = require("../models/card");

const NotFoundError = require("../errors/not-found-error");
const BadRequestError = require("../errors/bad-request-error");
const ForbiddenError = require("../errors/forbidden-error");

const getCards = (req, res, next) =>
  CardModel.find()
    .then((card) => res.status(httpConstants.HTTP_STATUS_OK).send(card))
    .catch(next);

const createCard = (req, res, next) => {
  const { _id } = req.user;
  const { name, link } = req.body;
  return CardModel.create({ name, link, owner: _id })
    .then((card) => res.status(httpConstants.HTTP_STATUS_CREATED).send(card))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(
          new BadRequestError(
            "Переданы некорректные данные при создании карточки",
          ),
        );
      }
      return next(err);
    });
};

const deleteCardById = (req, res, next) => {
  const { cardId } = req.params;
  const { _id } = req.user;
  return CardModel.findById(cardId)
    .then((card) => {
      if (!card) {
        return next(new NotFoundError("Карточка с указанным _id не найдена"));
      }
      if (!card.owner.equals(_id)) {
        return next(new ForbiddenError("Попытка удалить чужую карточку"));
      }
      return CardModel.findByIdAndRemove(cardId).then((cardForRemove) =>
        res.status(httpConstants.HTTP_STATUS_OK).send(cardForRemove),
      );
    })
    .catch((err) => {
      if (err.name === "CastError") {
        return next(new BadRequestError("Передан невалидный _id"));
      }
      return next(err);
    });
};

const putLikeCardById = (req, res, next) =>
  CardModel.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(new NotFoundError("Передан несуществующий _id карточки"));
      }
      return res.status(httpConstants.HTTP_STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(
          new BadRequestError(
            "Переданы некорректные данные для постановки лайка",
          ),
        );
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Передан невалидный _id"));
      }
      return next(err);
    });

const deleteLikeCardById = (req, res, next) =>
  CardModel.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(new NotFoundError("Передан несуществующий _id карточки"));
      }
      return res.status(httpConstants.HTTP_STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(
          new BadRequestError("Переданы некорректные данные для снятии лайка"),
        );
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Передан невалидный _id"));
      }
      return next(err);
    });

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  putLikeCardById,
  deleteLikeCardById,
};
