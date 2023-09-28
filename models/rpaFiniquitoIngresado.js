var type = require('sequelize');
var DataTypes = require('sequelize');

var sequelize = require('./sequelizeConnection');

var rpaFiniquitoIngresado = sequelize.define('rpaFiniquitoIngresado', {
    idFiniquitoIngresado: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idFiniquito: type.INTEGER,
    rut: { type: type.STRING, unique: 'rpaFiniquitoIngresadoIndex1' },
    fechaFiniquito: {type: type.STRING, unique: 'rpaFiniquitoIngresadoIndex1'}, 
    causal: type.STRING,
    texto: DataTypes.STRING('MAX')
});

//sequelize.sync({ alter: true })

sequelize.sync();

module.exports = rpaFiniquitoIngresado;