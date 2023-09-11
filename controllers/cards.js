const card = require("../models/card");
const NotFoundError = require("../errors/NotFoundError");
const BadRequestError = require("../errors/BadRequestError");
const NoRightsError = require("../errors/NoRightsError");

function getCards(req, res, next) {
  return card
    .find({})
    .then((cards) => {
      res.send(cards);
    })
    .catch(next);
}

function createCard(req, res, next) {
  const { name, link } = req.body;
  const userId = req.user._id;
  card
    .create({ name, link, owner: userId })
    .then((card) => {
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Ошибка валидации"));
      }
      return next(err);
    });
}

function deleteCard(req, res, next) {
  const { cardId } = req.params;
  card
    .findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError("Карточка не найдена");
      }
      if (!card.owner.equals(req.user._id)) {
        throw new NoRightsError(
          "Невозможно удалить карту с другим ID пользователя"
        );
      }

      card
        .deleteOne()
        .then(() => {
          return res.send({ message: "Карточка удалена" });
        })
        .catch(next);
    })
    .catch(next);
}

function likeCard(req, res) {

  return card
    .findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true }
    )
    .then((card) => {
      if (!card) {
        throw new NotFoundError("Карточка не найдена");
      }
      res.send(card)
    })
    .catch(next);
}

function dislikeCard(req, res) {

  return card
    .findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true }
    )
    .then((card) => {
      if (!card) {
        throw new NotFoundError("Карточка не найдена");
      }
      res.send(card)
    })
    .catch(next);
}

module.exports = {
  getCards,
  deleteCard,
  createCard,
  likeCard,
  dislikeCard,
};
