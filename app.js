// экспортируем модули
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

// Экспорт роута пользователя
const users = require("./routes/users");
const cards = require("./routes/cards");

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

// запускаем приложение
const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  req.user = {
    _id: "64ef476c9a02f7cd629ffd52",
  };

  next();
});

app.use(users);
app.use(cards);

app.listen(PORT, () => {
  console.log(`App is running out in ${PORT}`);
});
