var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var bukArea = sequelize.define('bukArea', {
    id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idBuk: type.INTEGER,
    nombre: type.STRING,
    centroCostos: type.STRING,
    nombreDivision: type.STRING
});
sequelize.sync();

module.exports = bukArea;