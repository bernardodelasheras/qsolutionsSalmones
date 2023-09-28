var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var solicitudes = sequelize.define('solicitudes', {
    idSolicitud: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: type.DATEONLY,
    idUsuarioSolicitante: type.INTEGER,
    idMotivo: type.INTEGER,
    fechaReemplazo: type.DATEONLY,
    idCargoReemplazante: type.INTEGER,
    idBukReemplazante: type.INTEGER,
    idArea: type.INTEGER,
    valor: type.FLOAT,
    idCargoReemplazado: type.INTEGER,
    idBukReemplazado: type.INTEGER,
    explicacion: type.TEXT,
    estado: type.INTEGER,
    usuarioConfirma: type.TEXT,
    integradoEnBuk: type.BOOLEAN
});
sequelize.sync();

// sequelize.sync({ alter: true })
//     .then(dat=>{console.log("Alter usuario ok")})
//     .catch(err=>{console.log("Alter usuario ok")})


module.exports = solicitudes;
