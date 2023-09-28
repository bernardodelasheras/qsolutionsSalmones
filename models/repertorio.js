var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var repertorio = sequelize.define('repertorio', {
    idRepertorio: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    codigoNotaria: { type: type.INTEGER, unique: 'repertorioIndex1' },
    nroOt: { type: type.INTEGER, unique: 'repertorioIndex1' },
    idNotaria: type.INTEGER,
    fechaOt: type.STRING,
    notaria: type.STRING,
    registroNotaria: type.STRING,
    nroRepertorio: type.STRING,
    fechaRepertorio: type.STRING,
    comparecientes: type.STRING,
    ultEstado: type.STRING,
    fechaEstado: type.STRING,
    materia: type.STRING,
    funcionario: type.STRING
});
sequelize.sync();

module.exports = repertorio;