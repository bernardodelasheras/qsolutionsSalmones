var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var bukPersona = sequelize.define('bukPersona', {
    id: {
        type: type.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    idBuk: type.INTEGER,
    full_name: type.STRING,
    rut: type.STRING,
    address: type.STRING,
    gender: type.STRING,
    birthday: type.STRING,
    active_since: type.STRING,
    status: type.STRING,
    weekly_hours: type.STRING,
    AreaId: type.STRING,
    Name: type.STRING,
    union: type.STRING,
    email: type.STRING,
    active_until: type.STRING,
    first_name: type.STRING,
    surname: type.STRING,
    second_surname: type.STRING,
    role_code: type.STRING,
    personal_email: type.STRING,
    dominio: type.STRING,
    cargoMyAreas: type.STRING
});



sequelize.sync();


module.exports = bukPersona;