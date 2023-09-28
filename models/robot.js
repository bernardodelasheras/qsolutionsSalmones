var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var robot = sequelize.define('robot', {
    idRobot: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: { type: type.INTEGER, unique: 'robotIndex1'},
    descripcion: type.STRING
});
sequelize.sync();

module.exports = robot;