const process = require("process");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config({ path: "./config/.env" });
const { errors } = require("celebrate");
const cookieParser = require("cookie-parser");
const auth = require("./middlewares/auth");
const { createUser, login } = require("./controllers/users");
const errorHandler = require("./middlewares/error-handler");

const { PORT = 3000, MONGODB_URL = "mongodb://127.0.0.1:27017/mestodb" } =
  process.env;

const userRouter = require("./routes/users");
const cardRouter = require("./routes/cards");
const {
  validationSchemaSignIn,
  validationSchemaSignup,
} = require("./middlewares/validation");

const NotFoundError = require("./errors/not-found-error");

mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("connect to bd");
  });

const app = express();

app.use(cookieParser());

app.use(bodyParser.json());

app.post("/signin", validationSchemaSignIn, login);
app.post("/signup", validationSchemaSignup, createUser);

// Защита API авторизацией
app.use(auth);

app.use("/", userRouter);
app.use("/", cardRouter);
app.use("*", (req, res, next) => {
  next(new NotFoundError("Страница не найдена"));
});

// обработчик ошибок celebrate
app.use(errors());

// централизованная обработка ошибок
app.use(errorHandler);

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
