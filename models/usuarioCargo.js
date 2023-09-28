var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var usuarioCargo = sequelize.define('usuarioCargo', {
    idUsuarioCargo: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idUsuario: type.INTEGER,
    idCargo: type.INTEGER
});

sequelize.sync();

module.exports = usuarioCargo;