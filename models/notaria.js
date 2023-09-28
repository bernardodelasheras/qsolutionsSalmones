var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var notaria = sequelize.define('notaria', {
    idNotaria: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: type.STRING,
    url: type.STRING,
    meses: type.INTEGER,
    username: type.STRING,
    password: type.STRING,
    emaillog: type.STRING,
    idRobot: type.INTEGER
});
sequelize.sync();

module.exports = notaria;