var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var wf_proyecto = sequelize.define('wf_proyecto', {
    idProyecto: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    pTprId: { type: type.INTEGER, unique: 'proyectoIndex' },
    proyecto: type.STRING,
    idTipoProceso: type.INTEGER,
    emailResponsable: type.STRING,
    emailSupervisor1: type.STRING,
    emailSupervisor2: type.STRING
});
sequelize.sync();

module.exports = wf_proyecto;
