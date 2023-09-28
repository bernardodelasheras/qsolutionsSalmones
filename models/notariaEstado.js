var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var notariaEstado = sequelize.define('notariaEstado', {
    idNotariaEstado: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigoEstado: { type: type.INTEGER, unique: 'codigoEstado_idNotaria_Index' },
    idNotaria: { type: type.INTEGER, unique: 'codigoEstado_idNotaria_Index' },
    estado: type.STRING
});
sequelize.sync();

module.exports = notariaEstado;