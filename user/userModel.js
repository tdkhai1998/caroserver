let db = require("../db");
const bcrypt = require("bcrypt");

module.exports = {
  findOne: username => db.singleByUsername(username),
  add: (table, entity) => db.add(table, entity),
  createEntity: (username, password) => ({
    username,
    password: bcrypt.hashSync(password, 10)
  })
};
