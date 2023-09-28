var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var wf_fase = sequelize.define('wf_fase', {
    idFase: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: type.STRING
});
sequelize.sync();

module.exports = wf_fase;
