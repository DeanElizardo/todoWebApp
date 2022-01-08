//================================================================CONFIGURATION
const HOST = '127.0.0.1';
const PORT = 3000;

//======================================================================MODULES
const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const store = require('connect-loki');

const ToDoList = require('./lib/todolist');
const ToDo = require('./lib/todo');
//let todoLists = require('./lib/seed-data'); //testing seed data

//=============================================================HELPER FUNCTIONS
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

function getTargetList(todoLists, listID) {
  return todoLists.find(list => list.id.toString() === listID);
}

//====================================================================APP LOGIC
const app = express();
const LokiStore = store(session);

app.set('view engine', 'pug');
app.set('views', './views');

//============================================================GLOBAL MIDDLEWARE
app.use(morgan("dev"));
app.use(session({
  cookie: {
    httpOnly: true,
    maxAge: 31 * 24 * 60 * 60 * 1000,
    path: "/",
    secure: false
  },
  name: "Launch-school-todos-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "Here's an insecure secret",
  store: new LokiStore({}),
}));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use((req, res, next) => {
  let todoLists = [];
  if ("todoLists" in req.session) {
    req.session.todoLists.forEach(todoList => {
      todoLists.push(ToDoList.makeTodoList(todoList));
    });
  }

  req.session.todoLists = todoLists;

  next();
});
app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});
//=======================================================================ROUTES
//==========================================================================GET
app.get('/', (req, res) => {
  res.redirect('/lists');
});

app.get('/lists', (req, res) => {
  res.render('lists', {
    todoLists: sortToDoList(req.session.todoLists),
  });
});

app.get('/lists/new', (req, res) => {
  res.render('new-list', { todoListTitle: "" });
});

app.get('/lists/:id', (req, res) => {
  let targetList = getTargetList(req.session.todoLists, req.params.id);
  res.render('manage-list', {
    todoList: targetList,
    todos: targetList.todos,
  });
});

app.get('/lists/:listID/edit', (req, res) => {
  let targetList = getTargetList(req.session.todoLists, req.params.listID);
  res.render('edit-list', {
    todoList: targetList,
  });
});

//=========================================================================POST
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
      .custom((title, { req }) => {
        let duplicate = req.session.todoLists
                .find(todo => todo.title.toLowerCase() === title.toLowerCase());

        return duplicate === undefined;
      })
      .withMessage("Title must be unique")
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.errors.forEach(error => req.flash("error", error.msg));
    }

    next();
  },
  (req, res) => {
    let title = req.body.todoListTitle;
    if (req.session.flash) {
      res.render('new-list', {
        flash: req.session.flash,
        todoListTitle: title,
      });
    } else {
      req.session.todoLists.push(new ToDoList(title));
      req.flash("Success", "New list added");
      res.redirect("/lists");
    }
  });

app.post('/lists/:id/todos',
  [
    body('todoTitle')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage("New item must be between 1 and 100 characters")
      .bail()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.errors.forEach(error => req.flash("error", error.msg));
    }

    next();
  },
  (req, res) => {
    let targetList = getTargetList(req.session.todoLists, req.params.id);
    if (req.session.flash) {
      res.render('manage-list', {
        todoList: targetList,
        flash: req.session.flash,
      });
    } else {
      targetList.addToDo(req.body.todoTitle);
      res.render('manage-list', {
        todoList: targetList,
        todos: targetList.todos,
      });
    }
  }
);

app.post('/lists/:listID/todos/:todoID/toggle', (req, res) => {
  let targetList = getTargetList(req.session.todoLists, req.params.listID);
  let targetTodo = targetList.findById(Number(req.params.todoID));

  if (targetTodo.isDone()) {
    targetTodo.markNotDone();
  } else {
    targetTodo.markDone();
  }

  res.redirect(`/lists/${req.params.listID}`);
});

app.post('/lists/:listID/complete_all', (req, res) => {
  let targetList = getTargetList(req.session.todoLists, req.params.listID);

  targetList.markAllDone();

  res.redirect(`/lists/${req.params.listID}`);
});

app.post('/lists/:listID/edit',
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Title must not be empty")
      .bail()
      .isLength({ max: 100 })
      .withMessage("Title must not be longer than 100 characters")
      .custom((title, { req }) => {
        let duplicate = req.session.todoLists
                .find(todo => todo.title.toLowerCase() === title.toLowerCase());
                
        return duplicate === undefined;
      })
      .withMessage("Title must be unique")
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.errors.forEach(error => req.flash("error", error.msg));
    }

    next();
  },
  (req, res) => {
    let targetList = getTargetList(req.session.todoLists, req.params.listID);
    
    if (req.session.flash) {
      res.render('edit-list', {
        flash: req.session.flash,
        todoList: targetList
      });
    } else {
      let targetList = getTargetList(req.session.todoLists, req.params.listID);
      targetList.setTitle(req.body.todoListTitle);
      req.flash("Success", "List edited");
      res.redirect("/lists");
    }
  }
);

app.post('/lists/:listID/destroy', (req, res) => {
  let targetList = getTargetList(req.session.todoLists, req.params.listID);
  let removalIdx = req.session.todoLists.indexOf(targetList);
  
  req.session.todoLists.splice(removalIdx, 1);

  res.redirect('/lists');
});

app.post('/lists/:listID/todos/:todoID/destroy', (req, res) => {
  let targetList = getTargetList(req.session.todoLists, req.params.listID);
  let targetTodo = targetList.findById(Number(req.params.todoID));
  let todoIndex = targetList.findIndexOf(targetTodo);

  targetList.removeAt(todoIndex);

  res.redirect(`/lists/${req.params.listID}`);
});

//===================================================================RUN SERVER
app.listen(PORT, HOST, () => {
  console.log(`Server listening on port ${PORT}`);
});