var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var wf_hitoNotaria = sequelize.define('wf_hitoNotaria', {
    idHitoNotaria: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idNotaria: { type: type.INTEGER, unique: 'EstadoNotaria_Index' },
    idNotariaEstado: { type: type.STRING, unique: 'EstadoNotaria_Index' },
    idHito: { type: type.INTEGER, unique: 'idHito_Index' },
});
sequelize.sync();

module.exports = wf_hitoNotaria;
