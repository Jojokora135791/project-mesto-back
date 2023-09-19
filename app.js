// экспортируем модули
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");
const { celebrate, Joi } = require("celebrate");

// Экспорт роута пользователя
const { createUser, login } = require("./controllers/users");
const auth = require("./middlewares/auth");
const { requestLogger,errorLogger } = require("./middlewares/logger");

// берем адрес порта из окружения
const { PORT = 3000 } = process.env;

// подключаемся к серверу mongo
mongoose
  .connect("mongodb://localhost:27017/mydb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    family: 4,
  })
  .then(() => console.log("connected"));

const app = express();
app.use(requestLogger);
app.use(cookies());
app.use(bodyParser.json());
app.use(requestLogger);

app.post(
  "/signup",
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required().min(2).max(30),
      about: Joi.string().required().min(2).max(30),
      email: Joi.string().required().email(),
      avatar: Joi.string()
        .required()
        .regex(
          /^(https?:\/\/)?([a-z0-9-]+\.)*[a-z0-9-]+\.[a-z]{2,}\/?([^\s]*)$/
        ),
      password: Joi.string().required(),
    }),
  }),
  createUser
);
app.post(
  "/signin",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login
);

app.use(auth, require("./routes/users"));
app.use(auth, require("./routes/cards"));

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message =
    statusCode === 500 ? "На сервере произошла ошибка" : err.message;
  res.status(statusCode).send({ message });
});

app.listen(PORT, () => {
  console.log(`App is running out in ${PORT}`);
});
