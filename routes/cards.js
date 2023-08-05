const router = require('express').Router();
const { getCards, createCard, deleteCardById, putLikeCardById, deleteLikeCardById } = require('../controllers/cards');

//возвращает все карточки
router.get('/cards', getCards);

//создаёт карточку
router.post('/cards', createCard);

 //удаляет карточку по идентификатору
 router.delete('/cards/:cardId', deleteCardById);

 //поставить лайк карточке
 router.put('/cards/:cardId/likes', putLikeCardById);

 //убрать лайк с карточки
 router.delete('/cards/:cardId/likes', deleteLikeCardById);

 module.exports = router;