const card = require("../models/card");

const ERROR_CODE = 400;
const ERROR_NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;
const OK = 200;
const OK_CREATED = 201;
const OK_NO_CONTENT = 204;

function getCards(req, res) {
  return card
    .find({})
    .then((cards) => {
      res.status(OK).send(cards);
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send({ message: "Ошибка" });
    });
}

function createCard(req, res) {
  const { name, link } = req.body;

  return card
    .create({ name, link, owner: req.user._id })
    .then((card) => {
      res.status(OK_CREATED).send(card);
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        res
          .status(ERROR_CODE)
          .send({ message: "Введены некорректные данные." });
      } else {
        res.status(INTERNAL_SERVER_ERROR).send({ message: "Ошибка" });
      }
    });
}

function deleteCard(req, res) {
  const { cardId } = req.params;
  if (!card) {
    return res.status(ERROR_NOT_FOUND).send({ message: "Ресурс не найден" });
  }
  return card
    .findByIdAndRemove(cardId)
    .then((card) => {
      res.status(OK_NO_CONTENT).send(card);
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send({ message: "Ошибка" });
    });
}

function likeCard(req, res) {
  if (!card) {
    return res.status(ERROR_NOT_FOUND).send({ message: "Ресурс не найден" });
  }
  return card
    .findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    )
    .then((card) => res.status(OK_CREATED).send(card))
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send({ message: "Ошибка" });
    });
}

function dislikeCard(req, res) {
  if (!card) {
    return res.status(ERROR_NOT_FOUND).send({ message: "Ресурс не найден" });
  }
  return card
    .findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true }
    )
    .then((card) => res.status(OK_NO_CONTENT).send(card))
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send({ message: "Ошибка" });
    });
}

module.exports = {
  getCards,
  deleteCard,
  createCard,
  likeCard,
  dislikeCard,
};
