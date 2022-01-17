// const { Client } = require('pg');
const { dbQuery } = require('./db-query');
const bcrypt = require('bcrypt');
const { user } = require('pg/lib/defaults');
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

  async getAllTodoLists(username) {
    const GET_LISTS = {
      text: "SELECT * FROM todolists WHERE username = $1",
      values: [username]
    };
    const GET_TODOS = {
      text: "SELECT * FROM todos WHERE username = $1 AND list_id = $2",
      values: [username]
    };

    let dbResponse = await dbQuery(DATABASE, GET_LISTS);

    let lists = dbResponse.rows;

    for (let idx in lists) {
      let list = lists[idx];
      GET_TODOS.values[1] = list.id;
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


  async getTodoList(listID, username) {
    const GET_LIST = {
      text: "SELECT * FROM todolists WHERE id = $1 AND username = $2",
      values: [listID, username]
    };
    const GET_TODOS = {
      text: "SELECT * FROM todos WHERE list_id = $1 AND username = $2",
      values: [listID, username]
    };

    let response1 = await dbQuery(DATABASE, GET_LIST);
    let list = response1.rows[0];
    let response2 = await dbQuery(DATABASE, GET_TODOS);
    
    list.todos = response2.rows;
    
    return list;
  }

  async duplicateTitleExists(prospectiveTitle, username) {
    const GET_ALL_LIST_TITLES = {
      text: "SELECT title FROM todolists WHERE username = $1",
      values: [username]
    }

    let response = await dbQuery(DATABASE, GET_ALL_LIST_TITLES);
    let titles = response.rows.map(row => row.title.toLowerCase());

    return titles.includes(prospectiveTitle.toLowerCase());
  }

  async addTodoList(listTitle, username) {
    const ADD_LIST = {
      text: "INSERT INTO todolists (title, username) VALUES ($1, $2)",
      values: [listTitle, username]
    }

    let response = await dbQuery(DATABASE, ADD_LIST);

  }

  async destroyList(listID, username) {
    const DELETE_LIST = {
      text: "DELETE FROM todolists WHERE id = $1 AND username = $2",
      values: [listID, username]
    }

    let response = await dbQuery(DATABASE, DELETE_LIST);

  }

  async setListTitle(listID, newTitle, username) {
    const UPDATE_LIST_TITLE = {
      text: "UPDATE todolists SET title = $2 WHERE id = $1 AND username = $3",
      values: [listID, newTitle, username]
    }

    let response = await dbQuery(DATABASE, UPDATE_LIST_TITLE);

    return response.rowCount > 0;
  }

  async addToDo(listID, todoTitle, username) {
    const ADD_TODO = {
      text: "INSERT INTO todos (list_id, title, username) VALUES ($1, $2, $3)",
      values: [listID, todoTitle, username]
    }

    let response = await dbQuery(DATABASE, ADD_TODO);

    return response.rowCount > 0;
  }

  async toggleTodoDone(listID, todoID, username) {
    const TOGGLE_DONE = {
      text: "UPDATE todos SET done = NOT done WHERE list_id = $1 AND id = $2 AND username = $3",
      values: [listID, todoID, username]
    }

    let result = await dbQuery(DATABASE, TOGGLE_DONE);
    return result.rowCount > 0;
  }

  async destroyTodo(listID, todoID, username) {
    const DELETE_TODO = {
      text: "DELETE FROM todos WHERE list_id = $1 AND id = $2 AND username = $3",
      values: [listID, todoID, username]
    }

    let response = await dbQuery(DATABASE, DELETE_TODO);

    return response.rowCount > 0;
  }

  async markAllDone(listID, username) {
    const MARK_ALL_TODOS_IN_LIST_DONE = {
      text: "UPDATE todos SET done = true WHERE todos.list_id = $1 AND username = $2",
      values: [listID, username]
    }

    let response = await dbQuery(DATABASE, MARK_ALL_TODOS_IN_LIST_DONE);

    return response.rowCount > 0;
  }

  async validateCredentials(username, password) {
    const GET_UNAME_AND_PASSW = {
      text: "SELECT * FROM users WHERE username = $1",
      values: [username]
    }

    let response = await dbQuery(DATABASE, GET_UNAME_AND_PASSW);
    
    return bcrypt.compare(password, response.rows[0].password);
  }

  // async _encryptAllPasswords() {
  //   const GET_ALL_PAIRS = {
  //     text: "SELECT * FROM users",
  //     values: []
  //   };
  //   const PUSH_HASHED_PAIR = {
  //     text: "UPDATE users SET password = $2 WHERE username = $1",
  //     values: [null, null]
  //   }

  //   let response1 = await dbQuery(DATABASE, GET_ALL_PAIRS);
  //   let usernames = response1.rows.map(row => row.username);
  //   let passwords = response1.rows.map(row => row.password);

  //   for (let idx in usernames) {
  //     bcrypt.hash(passwords[idx], 10, (_, hash) => {
  //       PUSH_HASHED_PAIR.values[0] = usernames[idx];
  //       PUSH_HASHED_PAIR.values[1] = hash;
      
  //       dbQuery(DATABASE, PUSH_HASHED_PAIR);
  //     });
  //   }
  // }
}

module.exports = { PgPersistence };