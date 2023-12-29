var Sequelize = require('sequelize');
require('dotenv').config({ path: 'variables.env' });

var host = process.env.SQLFIN700;

const sequelize = new Sequelize('fin700', 'Consulta_RioNapo', 'Con2014RioNapo', {
    host: host,
    dialect: 'mssql',
    dialectOptions: {
        trustServerCertificate: true,
        database: 'Fin700',
        options: { requestTimeout: 900000, validateBulkLoadParameters: true}
    },
    logging: false,
    port: 1433
});

module.exports=sequelize;