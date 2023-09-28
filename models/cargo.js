var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var cargo = sequelize.define('cargo', {
    idCargo: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: { type: type.STRING, unique: 'cargoIndex1' },
    cargoMyAreas: type.STRING
});

sequelize.sync();

module.exports = cargo;