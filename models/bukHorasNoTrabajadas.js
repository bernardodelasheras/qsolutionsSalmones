var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var bukHorasNoTrabajadas = sequelize.define('bukHorasNoTrabajadas', {
    idBuk: type.INTEGER,
    month: type.INTEGER,
    year: type.INTEGER,
    hours: type.FLOAT,
    employee_id: type.INTEGER,
    type_id: type.INTEGER,
    periodo: type.INTEGER
});
sequelize.sync();

module.exports = bukHorasNoTrabajadas;