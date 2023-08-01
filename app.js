const express = require('express');
const mongoose = require('mongoose');
// Слушаем 3000 порт
const process = require('process');
const { PORT = 3000 } = process.env;

mongoose.connect('mongodb://localhost:27017/mestodb', {
    useNewUrlParser: true,
});

const app = express();

app.listen(PORT, () => {
    // Если всё работает, консоль покажет, какой порт приложение слушает
    console.log(`App listening on port ${PORT}`);
});
