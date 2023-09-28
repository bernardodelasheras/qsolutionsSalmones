var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var token = sequelize.define('token', {
    idToken: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario: type.STRING,
    token: type.STRING,
    api: type.STRING
});
sequelize.sync();

module.exports = token;