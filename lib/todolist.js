const nextId = require('./next-id.js');
const ToDo = require('./todo.js');

class ToDoList {
  constructor(title, identify = true) {
    if (identify === true) {
      this.id = nextId();
    }
    this.title = title;
    this.todos = [];
  }

  setTitle(title) {
    this.title = title;
  }

  size() {
    return this.todos.length;
  }

  addToDo(item) {
    if (item instanceof ToDo) {
      this.todos.push(item);
    } else {
      this.todos.push(new ToDo(item));
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

  sort() {
    this.todos.sort((a, b) => a.title - b.title);
  }

  pop() {
    return this.todos.pop();
  }

  shift() {
    return this.todos.shift();
  }

  itemAt(position) {
    return this.todos[position];
  }

  removeAt(position) {
    let context = this;
    let revisedList = this.todos.filter(todo => {
      if (context.findIndexOf(todo) !== position) {
        return todo;
      }
    });

    this.todos = revisedList;
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
    let filteredList = new ToDoList("Filtered List", false);
    this.todos.forEach(todo => {
      if (callbackFn(todo)) {
        filteredList.addToDo(todo);
      }
    });

    return filteredList;
  }

  findById(id) {
    let list = this.filter(todo => todo.id === id);

    return list.first();
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

    return list;
  }

  notAllDone() {
    let list = this.filter(todo => !todo.isDone());
    list.title = "Incomplete Items";

    return list;
  }

  markDone(title) {
    this.findByTitle(title).markDone();
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

  // _validateIndex(index) {
  //   if (!(index in this.todos)) {
  //     throw new ReferenceError(`Invalid index: ${index}`);
  //   }
  // }
}

module.exports = ToDoList;