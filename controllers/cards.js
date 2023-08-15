const CardModel = require('../models/card');
const httpConstants = require('http2').constants;

const ForbiddenError = require('../errors/forbidden-error');
const NotFoundError = require('../errors/not-found-error');
const BadRequestError = require('../errors/bad-request-error');
const InternalServerError = require('../errors/internal-server-error');
const ConflictError = require('../errors/conflict-error');
const UnauthorizedError = require('../errors/unauthorized-error');

const getCards = (req, res, next) => {
  return CardModel.find()
  .then((card) => res.status(httpConstants.HTTP_STATUS_OK).send(card))
  .catch((err) => next(new InternalServerError('На сервере произошла ошибка')))
};

const createCard = (req, res, next) => {
  const { _id } = req.user;
  const { name, link } = req.body;
  return CardModel.create({ name, link, owner: _id })
  .then(card => res.status(httpConstants.HTTP_STATUS_CREATED).send(card))
  .catch((err) => {
    if (err.name === 'ValidationError') {
      return next(new BadRequestError('Переданы некорректные данные при создании карточки'));
      //return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки' });
    }
    return next(new InternalServerError('На сервере произошла ошибка'));
    //return res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
  });
};

const deleteCardById = (req, res, next) => {
  const { cardId } = req.params;
  const { _id } = req.user;
  console.log(req.params)
  /*if ( _id !== owner ) {
    return res.status(httpConstants.HTTP_STATUS_FORBIDDEN).send({ message: 'Попытка удалить чужую карточку кард'});
  }*/
    return CardModel.findByIdAndRemove( cardId )
      .then((card) => {
        console.log(`card.owner1: ${card.owner}`)
          console.log(`_id1: ${_id}`)
        if (!card) {
          return next(new NotFoundError('Карточка с указанным _id не найдена'));
          //return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка с указанным _id не найдена' });
        }
        else if ( !card.owner.equals(_id) ) {
          console.log(`card.owner: ${card.owner}`)
          console.log(`_id: ${_id}`)
          console.log(toString(_id) === toString(card.owner))
          console.log('64d9b4f56ae29a33ddb31e0b' === '64d9b4f56ae29a33ddb31e0b')
          return next(new ForbiddenError('Попытка удалить чужую карточку'));
          //return res.status(httpConstants.HTTP_STATUS_FORBIDDEN).send({ message: 'Попытка удалить чужую карточку'});
        }
        return res.status(httpConstants.HTTP_STATUS_OK).send(card)
      })
      .catch((err) => {
        if (err.name === 'CastError') {
          return next(new BadRequestError('Передан невалидный _id'));
          //return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан невалидный _id' });
        }
        return next(new InternalServerError('На сервере произошла ошибка'));
        //return res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' })
      });
};

const putLikeCardById = (req, res, next) => {
  return CardModel.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
  .then((card) => {
    if (!card) {
      return next(new NotFoundError('Передан несуществующий _id карточки'));
      //return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
    }
    return res.status(httpConstants.HTTP_STATUS_OK).send(card);
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          return next(new BadRequestError('Переданы некорректные данные для постановки лайка'));
          //return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные для постановки лайка' });
        }
        if (err.name === 'CastError') {
          return next(new BadRequestError('Передан невалидный _id'));
          //return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан невалидный _id' });
        }
        return next(new InternalServerError('На сервере произошла ошибка'));
        //res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      });
};

const deleteLikeCardById = (req, res, next) => {
  return CardModel.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
  .then((card) => {
    if (!card) {
      return next(new NotFoundError('Передан несуществующий _id карточки'));
      //return res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Передан несуществующий _id карточки' });
    }
    return res.status(httpConstants.HTTP_STATUS_OK).send(card);
      })
      .catch((err) => {
        if (err.name === 'ValidationError') {
          return next(new BadRequestError('Переданы некорректные данные для снятии лайка'));
          //return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные для снятии лайка' });
        }
        if (err.name === 'CastError') {
          return next(new BadRequestError('Передан невалидный _id'));
          //return res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Передан невалидный _id' });
        }
        return next(new InternalServerError('На сервере произошла ошибка'));
        //res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'На сервере произошла ошибка' });
      });
};

module.exports = {
  getCards,
  createCard,
  deleteCardById,
  putLikeCardById,
  deleteLikeCardById
};