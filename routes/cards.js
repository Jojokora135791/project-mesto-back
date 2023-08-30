const { getCards, createCard, deleteCard, likeCard, dislikeCard } = require('../controllers/cards')

const router = require('express').Router();

router.get("/cards", getCards);

router.post('/cards', createCard);

router.delete('/cards/:cardId', deleteCard);

router.put('/cards/:cardId/likes', likeCard);

router.delete('/cards/:cardId/likes', dislikeCard)

module.exports = router;