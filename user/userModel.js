let db = require('../db');
const bcrypt = require('bcrypt');

module.exports = {
  all: () => db.load('select * from user'),
  findOne: username => db.singleByUsername(username),
  findId: id => db.load(`select * from user where id=${id}`),
  add: (table, entity) => db.add(table, entity),
  update: entity => db.update('user', 'id', entity),
  createEntity: (username, password) => ({
    username,
    id: null,
    hoten: '',
    ngaysinh: new Date(),
    gioitinh: true,
    role: null,
    password: bcrypt.hashSync(password, 10)
  }),
  createEmptyEntity: () => ({
    username: '',
    hoten: '',
    id: null,
    ngaysinh: null,
    gioitinh: true,
    role: null
  })
};
