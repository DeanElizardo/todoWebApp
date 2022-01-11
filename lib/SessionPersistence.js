const SeedData = require("./seed-data");
const nextId = require("./next-id");
const { deepCopy } = require("./deep-copy");

class SessionPersistence {
  constructor(session) {
    this._todoLists = session.todoLists || deepCopy(SeedData);
    session.todoLists = this._todoLists;
  }

  addTodoList(listTitle) {
    let newList = {
      id: nextId(),
      title: listTitle,
      todos: []
    };

    this._todoLists.push(newList);
  }

  destroyList(listID) {
    let todoListIdx = this._todoLists.map(list => list.id).indexOf(listID);

    if (todoListIdx !== -1) {
      this._todoLists.splice(todoListIdx, 1);
    }
  }

  setListTitle(listID, newTitle) {
    let todoListIdx = this._todoLists.map(list => list.id).indexOf(listID);

    if (todoListIdx !== -1) {
      this._todoLists[todoListIdx].title = newTitle;
    }
  }

  existsTodoListTitle(title) {
    return this._todoLists.some(list => {
      return list.title.toLowerCase() === title.toLowerCase();
    })
  }

  addToDo(listID, todoTitle) {
    let list = this._todoLists.filter(list => list.id === listID)[0];
    let newTodo = {
      id: nextId(),
      title: todoTitle,
      done: false
    };

    list.todos.push(newTodo);
  }

  isDoneTodoList(todoList) {
    return todoList.todos.length > 0 && todoList.todos.every(todo => todo.done);
  }

  sortList(list) {
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

  sortToDoLists() {
    let self = this;
    let todoLists = deepCopy(this._todoLists);
    let done = todoLists.filter(list => self.isDoneTodoList(list));
    let notDone = todoLists.filter(list => !self.isDoneTodoList(list));

    return this.sortList(notDone).concat(this.sortList(done));
  }

  sortTodos(todos) {
    let done = todos.filter(todo => todo.done);
    let notDone = todos.filter(todo => !todo.done);

    return this.sortList(notDone).concat(this.sortList(done));
  }

  getTargetList(listID) {
    let todoLists = deepCopy(this._todoLists);
    let targetList = todoLists.filter(list => list.id.toString() === listID)[0];

    return targetList;
  }

  getTargetTodo(list, todoID) {
    return list.todos.filter(todo => String(todo.id) === todoID)[0];
  }

  toggleTodoDone(listID, todoID) {
    this._todoLists.filter(list => list.id === listID)[0]
      .todos
      .forEach(todo => {
        if (todo.id === todoID) {
          todo.done = !todo.done;
        }
      })
  }

  destroyTodo(listID, todoID) {
    let list = this._todoLists.filter(list => list.id === listID)[0];

    list.todos = list.todos.filter(todo => todo.id !== todoID);
  }

  markAllDone(listID) {
    let list = this._todoLists.filter(list => list.id === listID)[0];

    list.todos.forEach(todo => todo.done = true);
  }
}

module.exports = { SessionPersistence };