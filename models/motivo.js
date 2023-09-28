var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var motivo = sequelize.define('motivo', {
    idMotivo: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigo: { type: type.INTEGER, unique: 'codigoMotivoIndex' },
    glosa: type.STRING
});
sequelize.sync();

module.exports = motivo;
