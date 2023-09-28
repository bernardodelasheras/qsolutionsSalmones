var type = require('sequelize');
var DataTypes = require('sequelize');

var sequelize = require('./sequelizeConnection');

var rpaEmpleado = sequelize.define('rpaEmpleado', {
    idEmpleado: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    rut: { type: type.STRING, unique: 'rpaEmpleado_Index1' } ,
    comuna: type.STRING,
    fecha: type.STRING,
    correoRepresentante: type.STRING,
    correoEmpleado: type.STRING,
    telefonoEmpleado: type.STRING,
    region: type.STRING,
    comuna: type.STRING,
    calle: type.STRING,
    numero: type.STRING,
    cargo: type.STRING,
    regionPrestacion: type.STRING,
    comunaPrestacion: type.STRING,
    callePrestacion: type.STRING,
    numeroPrestacion: type.STRING,
    SueldoBase: type.STRING,
    HaberesImponibles: DataTypes.STRING('MAX'),
    HaberesNoImponibles: DataTypes.STRING('MAX'),
    periodoPago: type.STRING,
    formaPago: type.STRING,
    anticipo: type.STRING,
    afp: type.STRING,
    salud: type.STRING,
    tipoContrato: type.STRING,
    jornada: type.STRING,
    fechaInicio: type.STRING,
    nacionalidad: type.STRING
});
sequelize.sync();

module.exports = rpaEmpleado;