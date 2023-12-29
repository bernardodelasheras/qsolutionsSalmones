var Sequelize = require('sequelize');
require('dotenv').config({ path: 'variables.env' });

var host = process.env.SQLLOCAL;
var usu = process.env.SQLFIN700LOCALUSR
var pwd = process.env.SQLFIN700LOCALPWD
var baseDatos = process.env.DATABASELOCAL

const sequelize = new Sequelize(baseDatos, usu, pwd, {
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