// middlewares/auth.js

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

  const token = req.cookies.jwt;
  if (!token) {
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }
  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next(); // пропускаем запрос дальше
};