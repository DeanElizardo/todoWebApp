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
    let list = response1.rows[0];
    let response2 = await dbQuery(DATABASE, GET_TODOS);
    
    list.todos = response2.rows;
    
    return list;
  }

  async duplicateTitleExists(prospectiveTitle) {
    const GET_ALL_LIST_TITLES = {
      text: "SELECT title FROM todolists",
      values: []
    }

    let response = await dbQuery(DATABASE, GET_ALL_LIST_TITLES);
    let titles = response.rows.map(row => row.title.toLowerCase());

    return titles.includes(prospectiveTitle.toLowerCase());
  }

  async addTodoList(listTitle) {
    const ADD_LIST = {
      text: "INSERT INTO todolists (title) VALUES ($1)",
      values: [listTitle]
    }

    let response = await dbQuery(DATABASE, ADD_LIST);

  }

  async destroyList(listID) {
    const DELETE_LIST = {
      text: "DELETE FROM todolists WHERE id = $1",
      values: [listID]
    }

    let response = await dbQuery(DATABASE, DELETE_LIST);

  }

  async setListTitle(listID, newTitle) {
    const UPDATE_LIST_TITLE = {
      text: "UPDATE todolists SET title = $2 WHERE id = $1",
      values: [listID, newTitle]
    }

    let response = await dbQuery(DATABASE, UPDATE_LIST_TITLE);

    return response.rowCount > 0;
  }

  async addToDo(listID, todoTitle) {
    const ADD_TODO = {
      text: "INSERT INTO todos (list_id, title) VALUES ($1, $2)",
      values: [listID, todoTitle]
    }

    let response = await dbQuery(DATABASE, ADD_TODO);

    return response.rowCount > 0;
  }

  async toggleTodoDone(listID, todoID) {
    const TOGGLE_DONE = {
      text: "UPDATE todos SET done = NOT done WHERE list_id = $1 AND id = $2",
      values: [listID, todoID]
    }

    let result = await dbQuery(DATABASE, TOGGLE_DONE);
    return result.rowCount > 0;
  }

  async destroyTodo(listID, todoID) {
    const DELETE_TODO = {
      text: "DELETE FROM todos WHERE list_id = $1 AND id = $2",
      values: [listID, todoID]
    }

    let response = await dbQuery(DATABASE, DELETE_TODO);

    return response.rowCount > 0;
  }

  async markAllDone(listID) {
    const MARK_ALL_TODOS_IN_LIST_DONE = {
      text: "UPDATE todos SET done = true WHERE todos.list_id = $1",
      values: [listID]
    }

    let response = await dbQuery(DATABASE, MARK_ALL_TODOS_IN_LIST_DONE);

    return response.rowCount > 0;
  }
}

module.exports = { PgPersistence };