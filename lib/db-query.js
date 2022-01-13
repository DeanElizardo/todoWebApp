const { Client } = require('pg');

const logQuery = (dbName, query) => {
  let timestamp = (new Date())
                    .toString()
                    .substring(4, 24);

  let logString = [timestamp, dbName, query.text, ...query.values].join(' ][ ');
  console.log("DATABASE LOG: [", logString);
}

async function dbQuery(dbName, query) {
  let client = new Client({database: dbName});

  try {
    await client.connect();
    logQuery(dbName, query);
    let response = await client.query(query);
    await client.end();

    return response;
  } catch (err) {
    console.log("ERROR IN 'dbQuery'\n", err);
  }
}

module.exports = { dbQuery };