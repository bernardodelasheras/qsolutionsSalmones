var type = require('sequelize');
var DataTypes = require('sequelize');

var sequelize = require('./sequelizeConnection');

var rpaFiniquito = sequelize.define('rpaFiniquito', {
    idFiniquito: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rut: { type: type.STRING, unique: 'rpaFiniquitoIndex1' },
    fechaFiniquito: {type: type.STRING, unique: 'rpaFiniquitoIndex1'}, 
    causal: type.STRING,
    texto: DataTypes.STRING('MAX'),
    url: type.STRING
});

//sequelize.sync({ alter: true })

sequelize.sync();

module.exports = rpaFiniquito;