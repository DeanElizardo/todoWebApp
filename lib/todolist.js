const { nextId } = require('./next-id.js');
const { ToDo } = require('./todo.js');

class ToDoList {
  constructor(title) {
    this.id = nextId();
    this.title = this.setTitle(title);
    this.todos = [];
  }

  setTitle(title) {
    this.title = title;
  }

  size() {
    return this.todos.length;
  }

  addToDo(title) {
    if (title instanceof ToDo) {
      this.todos.push(title);
    } else {
      throw new TypeError('Cannot add object; type must be ToDo');
    }
  }

  first() {
    if (this.size()) {
      return this.todos[0];
    }

    return "Nothing to do";
  }

  last() {
    if (this.todos.length) {
      return this.todos[this.size() - 1];
    }

    return "Nothing to do";
  }

  pop() {
    return this.todos.pop();
  }

  shift() {
    return this.todos.shift();
  }

  itemAt(position) {
    this._validateIndex(--position);
    return this.todos[position];
  }

  removeAt(position) {
    this._validateIndex(--position);
    return this.todos.splice(position, 1)[0];
  }

  markDoneAt(position) {
    this._validateIndex(--position);
    this.todos[position].markDone();
  }

  markNotDoneAt(position) {
    this._validateIndex(--position);
    this.todos[position].markNotDone();
  }

  isDone() {
    return this.size() && this.todos.every(item => item.isDone());
  }

  forEach(callbackFn) {
    for (let idx = 0; idx < this.todos.length; idx++) {
      callbackFn(this.todos[idx]);
    }
  }

  filter(callbackFn) {
    let filteredList = new ToDoList(this.title);
    this.todos.forEach(todo => {
      if (callbackFn(todo)) {
        filteredList.addToDo(todo);
      }
    });

    return filteredList;
  }

  findById(id) {
    return this.filter(todo => todo.id === id).first();
  }

  findIndexOf(todoToFind) {
    let findId = todoToFind.id;
    return this.todos.findIndex(todo => todo.id === findId);
  }

  allTodos() {
    return this.filter(_ => true);
  }

  findByTitle(title) {
    return this.filter(todo => todo.getTitle() === title).first();
  }

  allDone() {
    let list = this.filter(todo => todo.isDone());
    list.title = "Completed Items";

    return list;
  }

  notAllDone() {
    let list = this.filter(todo => !todo.isDone());
    list.title = "Incomplete Items";

    return list;
  }

  markDone(title) {
    let todo = this.findByTitle(title);
    todo.markDone();
  }

  markNotDone(title) {
    let todo = this.findByTitle(title);
    todo.markNotDone();
  }

  markAllDone() {
    this.forEach(todo => todo.markDone());
  }

  markAllNotDone() {
    this.forEach(todo => todo.markNotDone());
  }

  toString() {
    let deco = `*${'='.repeat(this.title.length - 2)}*\n`;

    let listString = `${deco}${this.title}\n${deco}`;

    return this.todos.reduce((str, currItem, idx) => {
      return str.concat(`${idx + 1}. `,String(currItem), '\n');
    }, listString);
  }

  toArray() {
    return this.todos.slice();
  }

  _validateIndex(index) {
    if (!(index in this.todos)) {
      throw new ReferenceError(`Invalid index: ${index}`);
    }
  }
}