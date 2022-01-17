//======================================================================MODULES
const express = require('express');
const flash = require('express-flash');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
const session = require('express-session');
const store = require('connect-loki');
const { PgPersistence } = require('./lib/PgPersistence');
const { catchError } = require('./lib/catch-error');
const config = require('./lib/config');

//================================================================CONFIGURATION
const HOST = config.HOST;
const PORT = config.PORT;

//====================================================================APP LOGIC
const app = express();
const LokiStore = store(session);

app.set('view engine', 'pug');
app.set('views', './views');

//============================================================GLOBAL MIDDLEWARE
app.use(morgan("common"));
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
  secret: config.SECRET,
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
  res.locals.username = req.session.username;
  res.locals.signedIn = req.session.signedIn;
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});
//=======================================================================ROUTES
//----------------------------------------------------user authentication------
app.get('/', (req, res) => {
  res.redirect('/users/signin');
});

app.get('/users/signin', (req, res) => {
  // res.locals.store._encryptAllPasswords();
  req.flash('info', 'Please sign in.');
  res.render('signin', {
    flash: req.session.flash
  });
});

app.post('/users/signin',
async (req, res) => {
  let username = req.body.username;
  let password = req.body.password;
  let store = res.locals.store;
  let signedIn = false;

  if (username.length > 0 && password.length > 0) {
    signedIn = await store.validateCredentials(username, password);
  }

  if (!signedIn) {
    req.flash('error', 'Invalid credentials');
    res.render('signin', {
      flash: req.session.flash,
      username: req.body.username
    });
  } else {
    req.session.username = username;
    req.session.signedIn = signedIn;
    req.flash("Success", "Welcome!");
    res.redirect('/lists');      
  }
});

app.use((req, res, next) => {
  if (req.session.signedIn) {
    next();
  } else {
    res.redirect('/users/signin');
  }
});

app.post('/users/signout', (req, res) => {
  req.session.username = null;
  req.session.signedIn = false;
  res.locals.username = null;
  res.locals.signedIn = false;

  res.redirect('/users/signin');
 }
);

//--------------------------------------------------------list management------
app.get('/lists',
  catchError(async (req, res) => {
    let store = res.locals.store;
    let uname = req.session.username;
    let todoLists = await store.getAllTodoLists(uname);
  
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
    let uname = req.session.username;
    let { id } = req.params;
    let todoList = await store.getTodoList(id, uname);
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

app.get('/lists/:listID/edit', 
  catchError(async (req, res) => {
    let store = res.locals.store;
    let uname = req.session.username;
    let { listID } = req.params;
    let todoList = await store.getTodoList(listID, uname);
    res.render('edit-list', {
      todoList,
    });
  })
);

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
    }

    next();
  },
  catchError(async (req, res, next) => {
    let title = req.body.todoListTitle;
    let uname = req.session.username;
    if (await res.locals.store.duplicateTitleExists(title, uname)) {
      req.flash("error", "List titles must be unique");
    }

    next();
  }),
  catchError(async (req, res) => {
    let store = res.locals.store; 
    let title = req.body.todoListTitle;
    let uname = req.session.username;

    if (req.session.flash) {
      res.render('new-list', {
        flash: req.session.flash,
        todoListTitle: title,
      });
    } else {
      await store.addTodoList(title, uname);
      req.flash("Success", "New list added");
      res.redirect("/lists");
    }
  })
 );

app.post('/lists/:listID/todos',
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
  catchError(async (req, res) => {
    let store = res.locals.store;
    let uname = req.session.username;
    let title = req.body.todoTitle;
    let { listID } = req.params;

    if (req.session.flash) {
      res.render('manage-list', {
        todoList: targetList,
        flash: req.session.flash,
      });
    } else {
      await store.addToDo(listID, title, uname);
      res.redirect(`/lists/${listID}`)
    }
  })
);

app.post('/lists/:listID/todos/:todoID/toggle',
  catchError(async (req, res) => {
    let store = res.locals.store;
    let uname = req.session.username;
    let { listID, todoID } = req.params;
  
    await store.toggleTodoDone(listID, todoID, uname);

    res.redirect(`/lists/${listID}`);
  })
)

app.post('/lists/:listID/complete_all',
  catchError(async (req, res) => {
    let store = res.locals.store;
    let uname = req.session.username;
    let { listID } = req.params;
  
    store.markAllDone(listID, uname);
  
    res.redirect(`/lists/${listID}`);
  })
);

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
    }

    next();
  },
  catchError(async (req, res, next) => {
    let title = req.body.todoListTitle;
    let uname = req.session.username;
    let store = res.locals.store;
    if (await store.duplicateTitleExists(title, uname)) {
      req.flash("error", "List titles must be unique");
    }

    next();
  }),
  catchError(async (req, res) => {
    let store = res.locals.store;
    let uname = req.session.username;
    let { listID } = req.params;
    let { todoListTitle } = req.body;
    
    if (req.session.flash) {
      let todoList = await store.getTodoList(listID, uname);

      res.render('edit-list', {
        flash: req.session.flash,
        todoList
      });
    } else {
      store.setListTitle(listID, todoListTitle, uname);
      req.flash("Success", "List edited");
      res.redirect("/lists");
    }
  })
);

app.post('/lists/:listID/destroy', (req, res) => {
  let store = res.locals.store;
  let uname = req.session.username;
  let { listID } = req.params;

  store.destroyList(listID, uname);

  res.redirect('/lists');
});

app.post('/lists/:listID/todos/:todoID/destroy', 
  catchError(async (req, res) => {
    let store = res.locals.store;
    let uname = req.session.username;
    let { listID, todoID } = req.params;

    await store.destroyTodo(listID, todoID, uname);
  
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