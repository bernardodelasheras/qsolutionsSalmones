var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var wf_movimiento = sequelize.define('wf_movimiento', {
    idMovimiento: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    CartaOfertaId: type.INTEGER,
    idProyecto: type.INTEGER,
    inmuebleId: type.INTEGER,
    idHito: type.INTEGER,
    fechaVencimiento: type.DATEONLY,
    fechaReal: type.DATEONLY,
    idObservacion: type.INTEGER,
    idUsuarioMov: type.INTEGER,
    idEstado: type.INTEGER,
    emailResponsable: type.STRING,
    observacion: type.STRING,
    fechaVencimientoOriginal: type.DATEONLY
});

// sequelize.sync({ alter: true })
// .then (data=>{console.log(data)})
// .catch (err=>{console.log(err)}); //Para agregar columnas al final

sequelize.sync();

module.exports = wf_movimiento;
