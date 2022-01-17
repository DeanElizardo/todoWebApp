const config = require('config');
const { Client } = require('pg');

const isProduction = (config.NODE_ENV === 'production');
const CONNECTION = {
  connectionString: config.DATABASE_URL,
  //ssl: isProduction,
  ssl: { rejectUnauthorized: false }
}

const logQuery = (dbName, query) => {
  let timestamp = (new Date())
                    .toString()
                    .substring(4, 24);

  let logString = [timestamp, dbName, query.text, ...query.values].join(' ][ ');
  console.log("DBQ LOG:  - - [", logString, ']');
}

async function dbQuery(query) {
  let client = new Client(CONNECTION);

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