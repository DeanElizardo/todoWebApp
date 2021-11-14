const HOST = '127.0.0.1';
const PORT = 3000;
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const store = require('connect-loki');

const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(morgan("dev")); //change "dev" -> "common" after completing development
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('lists');
})

app.listen(PORT, HOST, () => {
  console.log(`Server listening on port ${PORT}`);
});