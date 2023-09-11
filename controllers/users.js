const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const NotFoundError = require("../errors/NotFoundError");
const BadRequestError = require("../errors/BadRequestError");
const ConflictingRequestError = require("../errors/ConflictingRequestError");
const AuthorizationError = require("../errors/AuthorizationError");

function createUser(req, res, next) {
  const { name, about, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) =>
      user.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      })
    )
    .then((user) => {
      res.status(201).send({
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Ошибка валидации"));
      }
      if (err.code === 11000) {
        return next(
          new ConflictingRequestError("Пользователь с текущим email уже занят")
        );
      }
      return next(err);
    });
}

function login(req, res, next) {
  const { email, password } = req.body;

  user
    .findUserByCredentials(email, password)
    .then((user) => {
      const payload = { _id: user._id };
      const token = jwt.sign(payload, "some-secret-key", {
        expiresIn: "7d",
      });

      res.cookie("jwt", token, { httpOnly: true });
      res.send({ user: payload });
    })
    .catch((err) => {
      return next(new AuthorizationError("Неверный логин или пароль"));
    });
}

function getUsers(req, res, next) {
  return user
    .find({})
    .then((users) => {
      res.send({ users })
    })
    .catch(next);
}

function getUser(req, res, next) {
  const { userId } = req.params;
  user
    .findById(userId)
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      return next(new NotFoundError("Пользователь с таким ID не найден"));
    });
}

function getCurrentUser(req, res, next) {
  const userId = req.user._id;
  return user
    .findById(userId)
    .then((user) => {
      res.send({ data: user });
    })
    .catch(next);
}

function updateProfile(req, res, next) {
  const { name, about } = req.body;
  const userId = req.user._id;
  user
    .findByIdAndUpdate(
      userId,
      { name: name, about: about },
      {
        new: true,
        runValidators: true,
      }
    )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с таким ID не найден');
      }
      return res.send({ user });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Ошибка валидации"));
      }
      return next(err);
    });
}

function updateAvatar(req, res,next) {
  const { avatar } = req.body;
  const userId = req.user._id;
  return user
    .findByIdAndUpdate(
      userId,
      { avatar: avatar },
      {
        new: true,
        runValidators: true,
      }
    )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с таким ID не найден');
      }
      return res.send({ user });
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Ошибка валидации"));
      }
      return next(err);
    });;
}

module.exports = {
  getCurrentUser,
  getUsers,
  getUser,
  createUser,
  updateProfile,
  updateAvatar,
  login,
};
