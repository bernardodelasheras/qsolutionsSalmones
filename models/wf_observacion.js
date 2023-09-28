var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var wf_observacion = sequelize.define('wf_observacion', {
    idObservacion: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    glosa: type.STRING
});
sequelize.sync();

module.exports = wf_observacion;
