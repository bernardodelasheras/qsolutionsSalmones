var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var bukVacaciones = sequelize.define('bukVacaciones', {
    idBuk: type.INTEGER,
    start_date: type.STRING,
    end_date: type.STRING,
    days_count: type.FLOAT,
    day_percent: type.INTEGER,
    workday_stage: type.STRING,
    application_date: type.STRING,
    application_end_date: type.STRING,
    justification: type.STRING,
    employee_id: type.INTEGER,
    status: type.STRING,
    absence_type_id: type.INTEGER,
    periodo: type.INTEGER
});
sequelize.sync();

module.exports = bukVacaciones;