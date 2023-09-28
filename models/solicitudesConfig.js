var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var solicitudesConfig = sequelize.define('solicitudesConfig', {
    id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    emailOperaciones: type.STRING,
    emailRRHH: type.STRING
});
sequelize.sync();

module.exports = solicitudesConfig;
