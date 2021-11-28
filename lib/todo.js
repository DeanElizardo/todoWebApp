const nextId = require("./next-id.js");

class ToDo {
  static DONE_MARKER = 'X';
  static NOT_DONE_MARKER = ' ';
  static makeTodo(rawTodo) {
    return Object.assign(new ToDo(), rawTodo);
  }

  constructor(title, identify = true) {
    if (identify === true) {
      this.id = nextId();
    }
    this.title = title;
    this.done = false;
  }

  setTitle(title) {
    this.title = title;
  }

  toString() {
    let marker = this.done ? ToDo.DONE_MARKER : ToDo.NOT_DONE_MARKER;
    return `[${marker}] ${this.title}`;
  }

  markDone() {
    this.done = true;
  }

  markNotDone() {
    this.done = false;
  }

  isDone() {
    return this.done;
  }

  getTitle() {
    return this.title;
  }
}

module.exports = ToDo;