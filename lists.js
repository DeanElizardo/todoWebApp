const HOST = '127.0.0.1';
const PORT = 3000;
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const store = require('connect-loki');

let todoLists = require('./lib/seed-data');
const ToDoList = require('./lib/todolist');
const sortList = list => {
  return list.slice().sort((todoListA, todoListB) => {
    let titleA = todoListA.title.toLowerCase();
    let titleB = todoListB.title.toLowerCase();

    if (titleA < titleB) { //put titleA first
      return -1;
    } else if (titleA > titleB) { //put titleB first
      return 1;
    } else {
      return 0; //retain original order
    }
  });
}
const sortToDoList = list => {
  let done = list.filter(item => item.isDone());
  let notDone = list.filter(item => !item.isDone());

  return sortList(notDone).concat(sortList(done));
}

const checkDuplicateTitles = function (title, lists) {
  return lists.some(list => list.title.toLowerCase() === title.toLowerCase());
}

const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(morgan("dev")); //change "dev" -> "common" after completing development
// app.use(session()); //apply cookie properties here
app.use(express.static('public'));
app.use(express.urlencoded( { extended: false }));

app.get('/', (req, res) => {
  res.redirect('/lists');
});
app.get('/lists', (req, res) => {
  res.render('lists', { 
    todoLists: sortToDoList(todoLists),
  });
});
app.get('/lists/new', (req, res) => {
  res.render('new-list');
});

app.post('/lists',
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Title must not be empty")
      .bail()
      .isLength({ max: 100 })
      .withMessage("Title must not be longer than 100 characters")
      .bail()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    res.locals.errors = [];
    if (!errors.isEmpty()) {
      res.locals.errors = errors.errors.map(error => error.msg);
    }

    next();
  },
  (req, res, next) => {
    if (checkDuplicateTitles(req.body.todoListTitle, todoLists)) {
      res.locals.errors.push("A ToDo list with that title already exists");
    }

    next();
  },
  (req, res) => {
    let title = req.body.todoListTitle;
    if (res.locals.errors.length > 0) {
      res.render('new-list', {
        errorMessages: res.locals.errors,
      });
    } else {
      todoLists.push(new ToDoList(title));
      res.redirect("/");
    }
});

app.listen(PORT, HOST, () => {
  console.log(`Server listening on port ${PORT}`);
});