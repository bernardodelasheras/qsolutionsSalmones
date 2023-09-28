const { promiseImpl } = require("ejs");
var express = require("express");
var router = express.Router({ mergeParams: true });
const cron = require('node-cron');
var nodemailer = require('nodemailer');
var middleware = require("../middleware");
var sequelizeFin700 = require('../models/sequelizeConnectionFin700');
var sequelize = require('../models/sequelizeConnection');
var sequelizeOlap = require('../models/sequelizeConnectionOlap');
var task = require('../models/task');
const compressing = require('compressing');
require('dotenv').config({ path: 'variables.env' });
var timeZone = process.env.TIMEZONE;
var mailServer = process.env.MAIL_SERVER;
var mailUsu = process.env.MAIL_USUARIO;
var mailPwd = process.env.MAIL_CONTRASENA;
var mailPort = process.env.MAIL_SMTPPORT;

router.get("/index", middleware.isLoggedIn, function (req, res) {
    
    leeOlap2()
    .then (data=> {
        res.render("olapEmpresa/index", { data: data });
    })
    .catch (err=> 
        console.log(err)
    )
});

router.get("/test/:user/:password", async function (req, res) {
    var usu = req.params.user
    var pwd = req.params.password

    var data = await leeOlap3(usu,pwd).catch (err=> console.log(err))
    res.status(200).json({data})
});



var leeOlap = function () {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select *"
        sql += "  from glbt_empresas "
        sequelizeFin700.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeOlap2 = function () {
    return new Promise(function (resolve, reject) {

        var filas = []
        var mssqlbanpro = require('mssql')

        var config = {
            user: 'consulta_banpro',
            password: 'AlfaBanca2018',
            server: process.env.SQLFIN700,
            database: 'banpro',
            requestTimeout: 1800000,
            options: { packetSize: 8192, enableArithAbort: true, encrypt: false },
        }
    
        mssqlbanpro.connect(config, err => {
            if (err) {
                console.log(err)
            } else {
                var sql = ""
                sql += "SELECT GlbT_Empresas.EmpId,"
                sql += "       GlbT_Entidad.EntRazonSocial"
                sql += "  FROM GlbT_Empresas join"
                sql += "       GlbT_Entidad on GlbT_Entidad.EntId = GlbT_Empresas.pEntId"
                const request = new mssqlbanpro.Request()
                request.stream = true // You can set streaming differently for each request
                request.query(sql)
    
                request.on('recordset', columns => {
                    var headers = "";
                    Object.getOwnPropertyNames(columns).forEach(function (n) {
                        headers += '"' + n + '";';
                    });
                })
    
                request.on('row', row => {
                    filas.push(row);
                })

                request.on('done', result => {
                    resolve(filas)
                    mssqlbanpro.close();
                })
    
            }            
        })

    });
};

var leeOlap3 = function (usu, pwd ) {
    return new Promise(function (resolve, reject) {

        var filas = []
        var mssqlbanpro = require('mssql')

        var config = {
            user: 'consulta_banpro',
            password: 'AlfaBanca2018',
            server: process.env.SQLFIN700,
            database: 'banpro',
            requestTimeout: 1800000,
            options: { packetSize: 8192, enableArithAbort: true, encrypt: false },
        }
    
        mssqlbanpro.connect(config, err => {
            if (err) {
                console.log(err)
            } else {
                var sql = ""
                sql += "SELECT GlbT_Empresas.EmpId,"
                sql += "       GlbT_Entidad.EntRazonSocial,"
                sql += "       '" + usu + "' usuario,"
                sql += "       '" + pwd + "' contrasena"
                sql += "  FROM GlbT_Empresas join"
                sql += "       GlbT_Entidad on GlbT_Entidad.EntId = GlbT_Empresas.pEntId"
                const request = new mssqlbanpro.Request()
                request.stream = true // You can set streaming differently for each request
                request.query(sql)
    
                request.on('recordset', columns => {
                    var headers = "";
                    Object.getOwnPropertyNames(columns).forEach(function (n) {
                        headers += '"' + n + '";';
                    });
                })
    
                request.on('row', row => {
                    filas.push(row);
                })

                request.on('done', result => {
                    resolve(filas)
                    mssqlbanpro.close();
                })
    
            }            
        })

    });
};

module.exports = router
