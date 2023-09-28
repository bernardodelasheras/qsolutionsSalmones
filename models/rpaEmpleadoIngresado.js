var type = require('sequelize');
var DataTypes = require('sequelize');

var sequelize = require('./sequelizeConnection');

var rpaEmpleadoIngresado = sequelize.define('rpaEmpleadoIngresado', {
    idEmpleadoIngresado: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rut: { type: type.STRING, unique: 'rpaEmpleadoIngresado_Index1' } 

});
sequelize.sync();

module.exports = rpaEmpleadoIngresado;