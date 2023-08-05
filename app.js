const express = require('express');
const mongoose = require('mongoose');
// Слушаем 3000 порт
const process = require('process');
const { PORT = 3000 } = process.env;
const bodyParser = require('body-parser');
const httpConstants = require('http2').constants;

const userRouter = require('./routes/users');
const cardRouter = require('./routes/cards');

mongoose.connect('mongodb://127.0.0.1:27017/mestodb', {
    useNewUrlParser: true,
}).then(() => {
  console.log('connect to bd');
});

const app = express();

app.use(bodyParser.json());

//добавить в каждый запрос объект user
app.use((req, res, next) => {
  req.user = {
    _id: '64cb5d456749f0a5ba4d2447'
  };

  next();
});

app.use('/', userRouter);
app.use('/', cardRouter);
app.use('*', (req, res) => {
  res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Страница не найдена' });
})

app.listen(PORT, () => {
    // Если всё работает, консоль покажет, какой порт приложение слушает
    console.log(`App listening on port ${PORT}`);
});
