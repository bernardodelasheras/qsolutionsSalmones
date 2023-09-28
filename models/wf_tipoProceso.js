var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var wf_tipoProceso = sequelize.define('wf_tipoProceso', {
    idTipoProceso: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: type.STRING
});
sequelize.sync();

module.exports = wf_tipoProceso;
