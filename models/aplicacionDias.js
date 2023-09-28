var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var aplicacionDias = sequelize.define('aplicacionDias', {
    idAplicacionDias: {type: type.INTEGER, primaryKey: true, autoIncrement: true},
    desde: type.INTEGER,
    hasta: type.INTEGER,
    ruta: { type: type.STRING, unique: 'aplicacionDiasIndex1' },
});
sequelize.sync();

module.exports = aplicacionDias;