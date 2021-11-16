const ToDoList = require('./todolist.js');
const ToDo = require('./todo.js');

let todolist1 = new ToDoList("Work Todos");
todolist1.addToDo("Get coffee");
todolist1.addToDo("Chat with coworkers");
todolist1.addToDo("Duck out of meeting");
todolist1.markDone("Get coffee");
todolist1.markDone("Chat with coworkers");
todolist1.markDone("Duck out of meeting");

let todolist2 = new ToDoList("Home Todos");
todolist2.addToDo("Play with dog");
todolist2.addToDo("Study more Launch School");
todolist2.addToDo("Make dinner");
todolist2.addToDo("Polish SWE resume");
todolist2.markDone("Make dinner");

let todolist3 = new ToDoList("Sundries");

let todoLists = [
  todolist1,
  todolist2,
  todolist3
];

module.exports = todoLists;