var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var control = sequelize.define('control', {
    idControl: {type: type.INTEGER, primaryKey: true, autoIncrement: true},
    ip: type.STRING,
    ultimaConexion: type.BIGINT
});
sequelize.sync();

module.exports = control;