//================================================================CONFIGURATION
const HOST = '127.0.0.1';
const PORT = 3000;

//======================================================================MODULES
const express = require('express');
const flash = require('express-flash');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const session = require('express-session');
const store = require('connect-loki');
const { PgPersistence } = require('./lib/PgPersistence');
const { catchError } = require('./lib/catch-error');

//====================================================================APP LOGIC
const app = express();
const LokiStore = store(session);

app.set('view engine', 'pug');
app.set('views', './views');

//============================================================GLOBAL MIDDLEWARE
app.use(morgan("dev")); //!Switch to "common" when done with project
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
//Create a new datastore
app.use((req, res, next) => {
  res.locals.store = new PgPersistence(req.session);
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

app.get('/lists',
  catchError(async (req, res) => {
    let store = res.locals.store;
    let todoLists = await store.getAllTodoLists();
  
    todoLists = store.sortLists(todoLists)
  
    let todosInfo = todoLists.map(list => ({
      countAllTodos: list.todos.length,
      countDoneTodos: list.todos.filter(todo => todo.done).length,
      isDone: store.isListDone(list)
    }));
  
    res.render('lists', {
      todoLists,
      todosInfo,
    });
  })
);

app.get('/lists/new', (req, res) => {
  res.render('new-list', { todoListTitle: "" });
});

app.get('/lists/:id', 
  catchError(async (req, res) => {
    let store = res.locals.store;
    let { id } = req.params;
    let todoList = await store.getTodoList(id);
    let todos = store.sortTodos(todoList.todos);
    let todoInfo = {
      isDone: store.isListDone(todoList),
      size: todos.length
    }
    
    res.render('manage-list', {
      todoList,
      todos,
      todoInfo
    });
  })
);

app.get('/lists/:listID/edit', (req, res) => {
  let store = res.locals.store;
  let { listID } = req.params;
  let todoList = store.getTargetList(listID);
  res.render('edit-list', {
    todoList,
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
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.errors.forEach(error => req.flash("error", error.msg));
    } else if (res.locals.store.existsTodoListTitle(req.body.todoListTitle)) {
      req.flash("error", "Title must be unique");
    }

    next();
  },
  // catchError(async (req, res, next) => {
  //   if (await res.locals.store.duplicateTitleExists()) {
  //     req.flash("error", "List titles must be unique");
  //   }

  //   next();
  // }),
  (req, res) => {
    let store = res.locals.store; 
    let title = req.body.todoListTitle;
    if (req.session.flash) {
      res.render('new-list', {
        flash: req.session.flash,
        todoListTitle: title,
      });
    } else {
      store.addTodoList(title);
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
    let store = res.locals.store;
    let { id } = req.params;
    id = parseInt(id, 10);
    if (req.session.flash) {
      res.render('manage-list', {
        todoList: targetList,
        flash: req.session.flash,
      });
    } else {
      store.addToDo(id, req.body.todoTitle);
      let todoList = store.getTargetList(req.params.id);
      let todos = store.sortTodos(todoList.todos);
      let todoInfo = {
        isDone: store.isDoneTodoList(todoList),
        size: todos.length
      }
      res.render('manage-list', {
        todoList,
        todos,
        todoInfo
      });
    }
  }
);

app.post('/lists/:listID/todos/:todoID/toggle',
  catchError(async (req, res) => {
    let store = res.locals.store;
    let { listID, todoID } = req.params;
  
    await store.toggleTodoDone(listID, todoID);

    res.redirect(`/lists/${listID}`);
  })
)

app.post('/lists/:listID/complete_all', (req, res) => {
  let store = res.locals.store;
  let { listID } = req.params;

  listID = Number.parseInt(listID, 10);

  store.markAllDone(listID);

  res.redirect(`/lists/${listID}`);
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
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.errors.forEach(error => req.flash("error", error.msg));
    } else if (res.locals.store.existsTodoListTitle(req.body.todoListTitle)) {
      req.flash("error", "Title must be unique");
    }

    next();
  },
  (req, res) => {
    let store = res.locals.store;
    let { listID } = req.params;
    let todoList = store.getTargetList(listID);
    
    if (req.session.flash) {
      res.render('edit-list', {
        flash: req.session.flash,
        todoList
      });
    } else {
      store.setListTitle(+listID, req.body.todoListTitle);
      req.flash("Success", "List edited");
      res.redirect("/lists");
    }
  }
);

app.post('/lists/:listID/destroy', (req, res) => {
  let store = res.locals.store;
  let { listID } = req.params;

  store.destroyList(listID);

  res.redirect('/lists');
});

app.post('/lists/:listID/todos/:todoID/destroy', 
  catchError(async (req, res) => {
    let store = res.locals.store;
    let { listID, todoID } = req.params;

    await store.destroyTodo(listID, todoID);
  
    res.redirect(`/lists/${listID}`);
  })
);

//Handle unrecognized paths
app.use((req, res, next) => {
  res.status(404);
  res.send("404 page not found");
  res.end();
});

//Handle internal errors
app.use((err, req, res, next) => {
  res.status(500);
  res.send("Internal server error");
  console.log(err);
  res.end();
})

//===================================================================RUN SERVER
app.listen(PORT, HOST, () => {
  console.log(`Server listening on port ${PORT}`);
});