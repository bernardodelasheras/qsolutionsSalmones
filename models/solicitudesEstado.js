var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var solicitudesEstado = sequelize.define('solicitudesEstado', {
    id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: type.INTEGER,
    descripcion: type.STRING
});
sequelize.sync();

module.exports = solicitudesEstado;
