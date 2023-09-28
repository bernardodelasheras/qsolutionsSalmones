var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var valores = sequelize.define('valores', {
    idValores: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idCargo: { type: type.INTEGER, unique: 'valoresIndex' },
    Sindicalizado: type.FLOAT,
    noSindicalizado: type.FLOAT
});
sequelize.sync();

module.exports = valores;
