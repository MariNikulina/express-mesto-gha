const express = require('express');
const mongoose = require('mongoose');
const process = require('process');
const bodyParser = require('body-parser');
const httpConstants = require('http2').constants;
require('dotenv').config({ path: './config/.env' });
const auth = require('./middlewares/auth');
const { createUser, login } = require('./controllers/users');
const errorHandler = require('./middlewares/error-handler');

const { celebrate, Joi } = require('celebrate');
const { errors } = require('celebrate');

const cookieParser = require('cookie-parser');

const {
  PORT = 3000,
  MONGODB_URL = 'mongodb://127.0.0.1:27017/mestodb'
} = process.env;

const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');

mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
}).then(() => {
  console.log('connect to bd');
});

const app = express();

app.use(cookieParser());

app.use(bodyParser.json());

/*добавить в каждый запрос объект user
app.use((req, res, next) => {
  req.user = {
    _id: '64cb5d456749f0a5ba4d2447'
  };

  next();
});*/

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }).unknown(true),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().domain(),
  }),
}), createUser);


//Защита API авторизацией
app.use(auth);

app.use('/', userRouter);
app.use('/', cardRouter);
app.use('*', (req, res) => {
  res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Страница не найдена' });
})

//обработчик ошибок celebrate
app.use(errors());

//централизованная обработка ошибок
app.use(errorHandler);

app.listen(PORT, () => {
    // Если всё работает, консоль покажет, какой порт приложение слушает
    console.log(`App listening on port ${PORT}`);
});
