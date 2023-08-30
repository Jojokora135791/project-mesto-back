const user = require("../models/user");

const ERROR_CODE = 400;
const ERROR_NOT_FOUND = 404;
const INTERNAL_SERVER_ERROR = 500;
const OK = 200;
const OK_CREATED = 201;

function getUsers(req, res) {
  return user
    .find({})
    .then((users) => {
      res.status(OK).send(users);
    })
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send({ message: "Ошибка" });
    });
}

function getUser(req, res) {
  const { userId } = req.params;
  if (!user) {
    return res.status(ERROR_NOT_FOUND).send({ message: "Ресурс не найден" });
  }
  return user
    .findById(userId)
    .then((user) => res.status(OK).send(user))
    .catch((err) => {
      res.status(INTERNAL_SERVER_ERROR).send({ message: "Ошибка" });
    });
}

function createUser(req, res) {
  return user
    .create({ ...req.body })
    .then((user) => {
      res.status(OK_CREATED).send(user);
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

function updateProfile(req, res) {
  const { name, about } = req.body;
  if (!user) {
    return res.status(ERROR_NOT_FOUND).send({ message: "Ресурс не найден" });
  }
  return user
    .findByIdAndUpdate(
      req.user._id,
      { name: name, about: about },
      {
        new: true,
        runValidators: true,
      }
    )
    .then((user) => res.status(OK).send(user))
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

function updateAvatar(req, res) {
  const { avatar } = req.body;
  if (!user) {
    return res.status(ERROR_NOT_FOUND).send({ message: "Ресурс не найден" });
  }
  return user
    .findByIdAndUpdate(
      req.user._id,
      { avatar: avatar },
      {
        new: true,
        runValidators: true,
      }
    )
    .then((user) => res.status(OK).send(user))
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

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateProfile,
  updateAvatar,
};
