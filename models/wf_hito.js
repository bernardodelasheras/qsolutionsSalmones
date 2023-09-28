const { QueryInterface } = require('sequelize');
var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var wf_hito = sequelize.define('wf_hito', {
    idHito: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    secuencia: { type: type.INTEGER, unique: 'wf_hito_Index1' } ,
    diasDuracion: type.INTEGER,
    diasvencidan1: type.INTEGER,
    diasvencidan2: type.INTEGER,
    nombre: type.STRING,
    idFase: type.INTEGER,
    idTipoProceso: { type: type.INTEGER, unique: 'wf_hito_Index1' }
});
//sequelize.sync({ alter: true }); //Para agregar columnas al final
sequelize.sync({});
module.exports = wf_hito;
