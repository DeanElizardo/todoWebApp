// const { Client } = require('pg');
const { dbQuery } = require('./db-query');
const DATABASE = 'todo-lists';

class PgPersistence {
  constructor(session) {}

  _partitionLists(lists) {
    let done = lists.filter(list => this.isListDone(list));
    let notDone = lists.filter(list => !this.isListDone(list));

    return [ done, notDone ];
  }

  isListDone(list) {
    if (list.todos.length > 0) {
      return list.todos.every(todo => todo.done === true);
    } else {
      return false;
    }
  }

  sortByTitle(lists) {
    lists.sort((listA, listB) => {
      let titleA = listA.title.toLowerCase();
      let titleB = listB.title.toLowerCase();
      if (titleA < titleB) {
        return -1;
      } else if (titleA > titleB) {
        return 1;
      } else {
        return 0;
      }
    })
  }

  sortLists(lists) {
    let [ doneList, notDoneList ] = this._partitionLists(lists);

    this.sortByTitle(doneList);
    this.sortByTitle(notDoneList);

    return notDoneList.concat(doneList);
  }

  async getAllTodoLists() {
    const GET_LISTS = {
      text: "SELECT * FROM todolists",
      values: []
    };
    const GET_TODOS = {
      text: "SELECT * FROM todos WHERE list_id = $1",
    };

    let dbResponse = await dbQuery(DATABASE, GET_LISTS);

    let lists = dbResponse.rows;

    for (let idx in lists) {
      let list = lists[idx];
      GET_TODOS.values = [list.id];
      let todos = await dbQuery(DATABASE, GET_TODOS);
      list.todos = todos.rows;
    }

    return lists;
  }

  _partitionTodos(todos) {
    let done = todos.filter(todo => todo.done);
    let notDone = todos.filter(todo => !todo.done);

    return [ done, notDone ];
  }

  sortTodos(todos) {
    let [ doneTodos, notDoneTodos ] = this._partitionTodos(todos);

    this.sortByTitle(doneTodos);
    this.sortByTitle(notDoneTodos);

    return notDoneTodos.concat(doneTodos);
  }


  async getTodoList(listID) {
    const GET_LIST = {
      text: "SELECT * FROM todolists WHERE id = $1",
      values: [listID]
    };
    const GET_TODOS = {
      text: "SELECT * FROM todos WHERE list_id = $1",
      values: [listID]
    };

    let response1 = await dbQuery(DATABASE, GET_LIST);
    let list = response1.rows;
    let response2 = await dbQuery(DATABASE, GET_TODOS);
    
    list.todos = response2.rows;
    
    return list;
  }

  async addTodoList(listTitle) {
    // let newList = {
    //   id: nextId(),
    //   title: listTitle,
    //   todos: []
    // };

    // this._todoLists.push(newList);
  }

  async destroyList(listID) {
    // let todoListIdx = this._todoLists.map(list => list.id).indexOf(listID);

    // if (todoListIdx !== -1) {
    //   this._todoLists.splice(todoListIdx, 1);
    // }
  }

  async setListTitle(listID, newTitle) {
    // let todoListIdx = this._todoLists.map(list => list.id).indexOf(listID);

    // if (todoListIdx !== -1) {
    //   this._todoLists[todoListIdx].title = newTitle;
    // }
  }

  async existsTodoListTitle(title) {
    // return this._todoLists.some(list => {
    //   return list.title.toLowerCase() === title.toLowerCase();
    // })
  }

  async addToDo(listID, todoTitle) {
    // let list = this._todoLists.filter(list => list.id === listID)[0];
    // let newTodo = {
    //   id: nextId(),
    //   title: todoTitle,
    //   done: false
    // };

    // list.todos.push(newTodo);
  }

  async isDoneTodoList(todoList) {
    // return todoList.todos.length > 0 && todoList.todos.every(todo => todo.done);
  }

  async getTargetList(listID) {
    // let todoLists = deepCopy(this._todoLists);
    // let targetList = todoLists.filter(list => list.id.toString() === listID)[0];

    // return targetList;
  }

  async getTargetTodo(list, todoID) {
    // return list.todos.filter(todo => String(todo.id) === todoID)[0];
  }

  async toggleTodoDone(listID, todoID) {
    // this._todoLists.filter(list => list.id === listID)[0]
    //   .todos
    //   .forEach(todo => {
    //     if (todo.id === todoID) {
    //       todo.done = !todo.done;
    //     }
    //   });
  }

  async destroyTodo(listID, todoID) {
    // let list = this._todoLists.filter(list => list.id === listID)[0];

    // list.todos = list.todos.filter(todo => todo.id !== todoID);
  }

  async markAllDone(listID) {
    // let list = this._todoLists.filter(list => list.id === listID)[0];

    // list.todos.forEach(todo => todo.done = true);
  }
}

module.exports = { PgPersistence };