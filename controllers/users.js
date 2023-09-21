const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictingRequestError = require('../errors/ConflictingRequestError');
const AuthorizationError = require('../errors/AuthorizationError');

function createUser(req, res, next) {
  const { name, about, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ name, about, avatar, email, password: hash }))
    .then((user) => {
      res.status(201).send({
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError(`${Object.values(err.errors).map((error) => error.message).join(', ')}`));
      }
      if (err.code === 11000) {
        return next(
          new ConflictingRequestError('Пользователь с текущим email уже занят'),
        );
      }
      return next(err);
    });
}

function login(req, res, next) {
  const { email, password } = req.body;

  User
    .findUserByCredentials(email, password)
    .then((user) => {
      const payload = { _id: user._id };
      const token = jwt.sign(payload, 'some-secret-key', {
        expiresIn: '7d',
      });

      res.cookie('jwt', token, { httpOnly: true });
      res.send({ user: payload });
    })
    .catch((err) => next(new AuthorizationError('Неверный логин или пароль')));
}

function getUsers(req, res, next) {
  return User
    .find({})
    .then((users) => {
      res.send({ users });
    })
    .catch(next);
}

function getUser(req, res, next) {
  const { userId } = req.params;

  User.findById(userId)
  .then((user) => {
    if (!user) {
      throw new NotFoundError('Пользователь с таким ID не найден');
    }
    return res.send(user);
  })
  .catch(next);
}

function getCurrentUser(req, res, next) {
  const userId = req.user._id;
  return User
    .findById(userId)
    .orFail(new NotFoundError('Пользоваетеля с таким id нет'))
    .then((user) => {
      res.send({ data: user });
    })
    .catch(next);
}

function updateProfile(req, res, next) {
  const { name, about } = req.body;
  const userId = req.user._id;
  User
    .findByIdAndUpdate(
      userId,
      { name, about },
      {
        new: true,
        runValidators: true,
      },
    )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с таким ID не найден');
      }
      return res.send({ user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Ошибка валидации'));
      }
      return next(err);
    });
}

function updateAvatar(req, res, next) {
  const { avatar } = req.body;
  const userId = req.user._id;
  return User
    .findByIdAndUpdate(
      userId,
      { avatar },
      {
        new: true,
        runValidators: true,
      },
    )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь с таким ID не найден');
      }
      return res.send({ user });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new BadRequestError('Ошибка валидации'));
      }
      return next(err);
    });
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
