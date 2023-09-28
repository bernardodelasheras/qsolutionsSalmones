var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var wf_estado = sequelize.define('wf_estado', {
    idEstado: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    glosa: type.STRING,
    codigo: { type: type.INTEGER, unique: 'codigoEstadoIndex' }
});
sequelize.sync();

module.exports = wf_estado;
