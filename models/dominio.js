var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var dominio = sequelize.define('dominio', {
    idDominio: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: { type: type.STRING, unique: 'dominioIndex1' }
});

sequelize.sync();

module.exports = dominio;