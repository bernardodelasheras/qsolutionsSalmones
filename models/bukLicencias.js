var type = require('sequelize');
var sequelize = require('./sequelizeConnection');

var bukLicencias = sequelize.define('bukLicencias', {
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
    type: type.STRING,
    licence_type_id: type.INTEGER,
    licence_type: type.STRING,
    motivo: type.STRING,
    contribution_days: type.FLOAT,
    format: type.STRING,
    licence_number: type.STRING,
    medic_rut: type.STRING,
    medic_name: type.STRING,
    periodo: type.INTEGER
});
sequelize.sync();

module.exports = bukLicencias;