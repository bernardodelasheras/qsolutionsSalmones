var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var rpaEmpresa = sequelize.define('rpaEmpresa', {
    idEmpresa: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: type.STRING,
    urlbuk: type.STRING,
    usernamebuk: type.STRING,
    passwordbuk: type.STRING,
    meses: type.INTEGER,
    urldt: type.STRING,
    usernamedt: type.STRING,
    passworddt: type.STRING,
    emaillog: type.STRING
});
sequelize.sync();

module.exports = rpaEmpresa;