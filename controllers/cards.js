const CardModel = require('../models/card');
const httpConstants = require('http2').constants;

const getCards = (req, res) => {
  return CardModel.find()
  .then((card) => res.status(httpConstants.HTTP_STATUS_OK).send(card))
  .catch((err) => res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию'}))
};

const createCard = (req, res) => {
  const { _id } = req.user;
  const { name, link } = req.body;
  return CardModel.create({ name, link, owner: _id })
  .then(card => res.status(httpConstants.HTTP_STATUS_CREATED).send(card))
  .catch((err) => {
    if (err.name === 'ValidationError') {
      return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки' });
    }
    return res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' });
  });
};

const deleteCardById = (req, res) => {
  const { cardId } = req.params;
    return CardModel.findByIdAndRemove( cardId )
      .then((card) => {
        if (!card) {
          return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
        }
        return res.status(httpConstants.HTTP_STATUS_OK).send(card)
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан невалидный _id' });
        }
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' })
      });
};

const putLikeCardById = (req, res) => {
  return CardModel.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
  .then((card) => {
    if (!card) {
      return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
    }
    return res.status(httpConstants.HTTP_STATUS_OK).send(card);
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка' });
        }
        if (err.name === 'CastError') {
          return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан невалидный _id' });
        }
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' });
      });
};

const deleteLikeCardById = (req, res) => {
  return CardModel.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
  .then((card) => {
    if (!card) {
      return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
    }
    return res.status(httpConstants.HTTP_STATUS_OK).send(card);
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные для снятии лайка' });
        }
        if (err.name === 'CastError') {
          return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан невалидный _id' });
        }
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Ошибка по умолчанию' });
      });
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  putLikeCardById,
  deleteLikeCardById
};