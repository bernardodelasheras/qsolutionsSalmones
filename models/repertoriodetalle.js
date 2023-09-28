var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var repertoriodetalle = sequelize.define('repertoriodetalle', {
    idRepertorioDet: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idNotaria: type.INTEGER,
    codigoNotaria: type.INTEGER,
    idRepertorio: type.INTEGER,
    nroOt: type.INTEGER,
    fechaOt: type.STRING,
    observacion: type.STRING,
    funcionario: type.STRING,
    fechaDet: type.STRING,
    estado: type.STRING,
    observacionDet: type.STRING,
});
sequelize.sync();

module.exports = repertoriodetalle;