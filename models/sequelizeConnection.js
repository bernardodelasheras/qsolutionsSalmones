var Sequelize = require('sequelize');
require('dotenv').config({ path: 'variables.env' });

var host = process.env.SQLLOCAL;
var pwd = process.env.SQLFIN700LOCALPWD

const sequelize = new Sequelize('qsolutionsSalmones', 'sa', pwd, {
    host: host,
    dialect: 'mssql',
    dialectOptions: {
        encrypt: true,
        options: {
            validateBulkLoadParameters: true,
            requestTimeout: 3600000
        }
    },
    logging: false,
    port: 1433
});

module.exports=sequelize;