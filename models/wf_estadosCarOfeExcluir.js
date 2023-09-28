var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var wf_estadosCarOfeExcluir = sequelize.define('wf_estadosCarOfeExcluir', {
    idEstado: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    DocEstado: type.INTEGER
});
sequelize.sync();

module.exports = wf_estadosCarOfeExcluir;
