const HOST = '127.0.0.1';
const PORT = 3000;
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const store = require('connect-loki');

let todoLists = require('./lib/seed-data');
const sortToDoList = list => {
  return list.slice().sort((todoListA, todoListB) => {
    let isDoneA = todoListA.isDone();
    let isDoneB = todoListB.isDone();

    if (!isDoneA && isDoneB) {
      return -1;
    } else if (isDoneA && !isDoneB) {
      return 1;
    } else {
      let titleA = todoListA.title;
      let titleB = todoListB.title;

      if (titleA < titleB) { //put titleA first
        return -1;
      } else if (titleA > titleB) { //put titleB first
        return 1;
      } else {
        return 0; //retain original order
      }
    }
  });
}

const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(morgan("dev")); //change "dev" -> "common" after completing development
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.render('lists', { 
    todoLists: sortToDoList(todoLists),
  });
});

app.listen(PORT, HOST, () => {
  console.log(`Server listening on port ${PORT}`);
});