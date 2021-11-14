// This class represents a todo item and its associated
// data: the todo title and a flag that shows whether the
// todo item is done.

class ToDo {
  static DONE_MARKER = 'X';
  static NOT_DONE_MARKER = ' ';

  constructor(title) {
    this.title = title;
    this.done = false;
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

module.exports = { ToDo };