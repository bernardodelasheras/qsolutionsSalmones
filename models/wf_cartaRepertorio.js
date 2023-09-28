var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var wf_cartaRepertorio = sequelize.define('wf_cartaRepertorio', {
    idCarRep: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    CartaOfertaId: { type: type.INTEGER, unique: 'CartaOfertaId_Index' },
    idNotaria: { type: type.INTEGER, unique: 'Repertorio_Index' },
    idRepertorio: { type: type.INTEGER, unique: 'Repertorio_Index' }
});
//sequelize.sync({ alter: true });
sequelize.sync();

module.exports = wf_cartaRepertorio;
