var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var solicitudesLog = sequelize.define('solicitudesLog', {
    id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idSolicitud: type.INTEGER,
    usuario: type.STRING,
    estado: type.INTEGER,
    fecha: type.STRING
});

sequelize.sync();

module.exports = solicitudesLog;