const { promiseImpl } = require("ejs");
var express = require("express");
const cron = require('node-cron');
var moment = require("moment");
var nodemailer = require('nodemailer');
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
var sequelize = require('../models/sequelizeConnection');
var rpaFiniquito = require("../models/rpaFiniquito");
var rpaFiniquitoIngresado = require("../models/rpaFiniquitoIngresado");
var task = require('../models/task');

require('dotenv').config({ path: 'variables.env' });
var rutEmpresa = process.env.RUTEMPRESA;
var timeZone = process.env.TIMEZONE;
var mailServer = process.env.MAIL_SERVER;
var mailUsu = process.env.MAIL_USUARIO;
var mailPwd = process.env.MAIL_CONTRASENA;
var mailPort = process.env.MAIL_SMTPPORT;

var URLEMPRESA = "https://qa-areaschile.buk.cl"

var logText = "";
var idNotariaActual = 0;
var nombreNotariaActual = "";
var supervisoresRobot = "";

var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

const screen = {
    width: 1360, height: 700
};

var firefox = require('selenium-webdriver/firefox');

var DomParser = require('dom-parser');
const { resolve } = require("path");
const { table } = require("console");
var parser = new DomParser();

router.get("/index", middleware.isLoggedIn, function (req, res) {
    dias = [
        { dia: 0, glosa: 'Todos los días' },
        { dia: 2, glosa: 'Lunes' },
        { dia: 3, glosa: 'Martes' },
        { dia: 4, glosa: 'Miércoles' },
        { dia: 5, glosa: 'Jueves' },
        { dia: 6, glosa: 'Viernes' },
        { dia: 7, glosa: 'Sábado' },
        { dia: 1, glosa: 'Domingo' }
    ]
    var data = { dias: dias };
    res.render("agendaRPAdtFiniquitos/index", { data: data });
});

router.post("/index", function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);

    var diaCron = "";
    if (req.body.data.dia == 0) {
        diaCron = "0-6";
    } else {
        diaCron = (Number(req.body.data.dia) - 1).toString();
    }

    var taskdata = {
        dia: diaCron,
        hora: req.body.data.hora,
        minuto: req.body.data.minuto,
        sessionID: req.sessionID
    }

    var cronTime = req.body.data.minuto + ' ' + req.body.data.hora + ' * * ' + diaCron
    var job = cron.schedule(cronTime, function () {
        console.log('Inicio Ejecución Programada RPA ' + req.body.data.hora + ':' + req.body.data.minuto + '/' + diaCron);
        procesaConsulta(req, res, taskdata);
    }, {
        scheduled: true,
        timezone: timeZone
    });
    var item = {
        aplicacion: 'RPAdtFiniquitos', username: req.session.username,
        hora: req.body.data.hora, minuto: req.body.data.minuto,
        taskdata: JSON.stringify(taskdata), res: ''
    }
    task.create(item)
        .then(datanew => {
            global.tjobs.push({ id: datanew.idTask, job: job });
            console.log('tarea guardada');
        })
        .catch(err => {
            console.log(err);
        });

    res.redirect("/agendaRPAdtFiniquitos/index");
});

router.post("/indexAhora", function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);

    var diaCron = "";
    if (req.body.data.dia == 0) {
        diaCron = "0-6";
    } else {
        diaCron = (Number(req.body.data.dia) - 1).toString();
    }

    var taskdata = {
        dia: diaCron,
        hora: req.body.data.hora,
        minuto: req.body.data.minuto,
        sessionID: req.sessionID
    }

    var cronTime = req.body.data.minuto + ' ' + req.body.data.hora + ' * * ' + diaCron

    procesaConsulta(req, res, taskdata);
});

function procesaConsulta(req, res, taskdata) {
    var sql = "";
    sql += "SELECT idEmpresa ,nombre ,urlbuk ,usernamebuk "
    sql += "      ,passwordbuk ,meses ,urldt ,usernamedt ,passworddt"
    sql += "      ,emaillog ,createdAt ,updatedAt"
    sql += "  FROM rpaEmpresas where meses > -1"
    sequelize.query(sql)
        .then(data => {
            procesaDataEmpresa(data[0], 0)
        })
        .catch(err => { console.log(err) });
}

var procesaDataEmpresa = async function (data, indice) {
    return new Promise(async function (resolve, reject) {
        var e = data[indice]
        var now = new Date();
        console.log("Inicia Robot para Empresa " + e.nombre);
        logText = "Inicia Robot para Empresa " + e.nombre + " " + now + "\n";
        pagina = 1;
        ultimaPagina = 0;
        await procesaEmpresa(e.idEmpresa, e.nombre, e.urlbuk,
            e.meses, e.emaillog,
            e.usernamebuk, e.passwordbuk,
            e.urldt, e.usernamedt, e.passworddt)
            .then(r => {
                indice++
                if (indice == data.length) {
                    console.log("Fin de todas las Empresas");
                    resolve("ok")
                }
                else {
                    procesaDataEmpresa(data, indice)
                }
            })
            .catch(err => {
                reject(err)
            })
    })
}

var driver;
var publico = false;

var procesaEmpresa = async function (idEmpresa, nombre, urlbuk, meses, emaillog, usernamebuk,
    passwordbuk, urldt, usernamedt, passworddt) {
    return new Promise(async function (resolve, reject) {
        // driver = new webdriver.Builder()
        //     .forBrowser('firefox')
        //     //.setFirefoxOptions(new firefox.Options().headless().windowSize(screen))
        //     .setFirefoxOptions(new firefox.Options().windowSize(screen))
        //     //.setFirefoxOptions(new firefox.Options().windowSize(screen))
        //     .build();
        const chrome = require('selenium-webdriver/chrome')
        driver = new webdriver.Builder()
            .forBrowser('chrome')
            .setChromeOptions(new chrome.Options().addArguments('start-fullscreen'))
            .build();

        var idEmpresaActual = idEmpresa;
        var nombreEmpresaActual = nombre;
        var supervisoresRobot = emaillog;

        var now = new Date();
        logText = "Iniciando RPA ingreso de contratos a Dirección del Trabajo " + now + "\n";
        logText += "Accediendo al sitio " + urldt + "\n";

        await driver.get(urldt);
        await esperarWeb();

        logText += "Conectando usuario " + usernamedt + "\n";
        
        var btnClaveUnica = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div[3]/div/button")), 120000);
        await btnClaveUnica.click()
        await esperarWeb()

        var usuario = await driver.wait(until.elementLocated(By.xpath('/html/body/main/section/div/div[1]/div/form/div[1]/input')), 120000);
        await usuario.sendKeys(usernamedt + webdriver.Key.TAB);

        var password = await driver.wait(until.elementLocated(By.xpath('/html/body/main/section/div/div[1]/div/form/div[2]/input')), 120000);
        await password.sendKeys(passworddt + webdriver.Key.TAB);


        var t = await usuario.getAttribute("value");

        var btnsubmit = await driver.wait(until.elementLocated(By.xpath("/html/body/main/section/div/div[1]/div/form/div[3]/div/button")), 120000);
        await btnsubmit.click()
        await esperarWeb();


        var btnsubmitEmpleador = await driver.wait(until.elementLocated(By.css('#btn-empleador')), 40000)
        await btnsubmitEmpleador.click()
        await esperarWeb();

        var btnsubmitPJuridica = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/div[2]/div[2]/div[2]/div/div/div[2]/div[1]')), 40000)
        await btnsubmitPJuridica.click()
        await esperarWeb();

        var btnsubmitEmpresa = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/div[2]/div[2]/div[2]/div/div/div[2]/div[2]/div/button')), 40000)
        await btnsubmitEmpresa.click()
        await esperarWeb();

        var btnRegistroElectronico = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div[2]/div/div/div/div[2]/div/a[2]')), 40000)
        await btnRegistroElectronico.click()
        await esperarWeb();

        var btnRegistrar = await driver.wait(until.elementLocated(By.xpath('//*[@id="body-content"]/div/section/div[3]/div[3]/div/div/button')), 40000)
        await btnRegistrar.click()
        await esperarWeb();

        var titulo = await driver.wait(until.elementLocated(By.xpath('//*[@id="barra-menu-perfil"]/div[2]/span')), 40000)
        var pos = await titulo.getRect()

        var iframe = await driver.wait(until.elementLocated(By.xpath('//*[@id="body-content"]/div/div/div/div/div/iframe')), 20000)
        await driver.switchTo().frame(iframe)
        var pos = await iframe.getRect()

        var btnRegistroFnq = await driver.wait(until.elementLocated(By.xpath('//*[@id="busqueda-termino-contrato-frame-id"]/div/section/div[3]/div[1]/div[1]/div/div/button')), 20000)
        await btnRegistroFnq.click()
        await esperarWeb();

        logText += "Buscando contratos nuevos " + "\n";
        
        data = await leeEmpleados()
            .catch(error => {
                console.log(error)
            })

        for (var i = 0; i < data.length; i++) {
            var per = data[i]

            var buscaRut = await driver.wait(until.elementLocated(By.xpath('//*[@id="inputId"]')), 20000)
            await buscaRut.sendKeys(per.rut)

            var buscaLupa = await driver.wait(until.elementLocated(By.xpath('//*[@id="busqueda-termino-contrato-frame-id"]/div/form/div[1]/div[1]/div[1]/i')), 20000)
            var retry = 0
            while (retry < 100) {
                retry++
                var displayed = await buscaLupa.isDisplayed()
                var enabled = await buscaLupa.isEnabled()
                console.log(retry + ' ' + displayed + ' ' + enabled)
                if (enabled && displayed) {
                    break
                }
            }
            await driver.executeScript("arguments[0].click();", buscaLupa)

            await esperarWeb()

            var selRut = await driver.wait(until.elementLocated(By.xpath('//*[@id="busqueda-termino-contrato-frame-id"]/div/form/div[2]/div[1]/div/div/div/div/div/div/div/table/tbody/tr/td[3]/div/a')), 20000)
            await selRut.click()
            await sleep(1000)
            await esperarWeb()

            var fechaFiniquito = await driver.wait(until.elementLocated(By.xpath('//*[@id="fechaTerminoContratoId"]')), 20000)
            await fechaFiniquito.sendKeys(per.fechaFiniquito + webdriver.Key.ENTER + webdriver.Key.TAB)

            var idxCausal = await getIdxCausal(per.causal)
            var opcionCausal = await driver.wait(until.elementLocated(By.css('#causalTerminoContrato > option:nth-child(' + idxCausal +')')), 20000)
            await opcionCausal.click()

            await esperarWeb()

            var btn = await driver.wait(until.elementLocated(By.xpath('//*[@id="busqueda-termino-contrato-frame-id"]/div/form/div/form/section/div[2]/div[3]/div[2]/button')), 20000)
            await btn.click()

            await esperarWeb()

            if (idxCausal >= 8) {
                var textoMotivo = await getMotivo(idxCausal, per.texto)
                var motivo = await driver.wait(until.elementLocated(By.xpath('//*[@id="motivoTerminoContratoId"]')), 20000)
                await motivo.sendKeys(textoMotivo)
            }

            await esperarWeb()
            await sleep(500)
            
            var btnSgte = await driver.wait(until.elementLocated(By.xpath('//*[@id="busqueda-termino-contrato-frame-id"]/div/form/div/form/section/div[3]/div[2]/button')), 20000)
            await btnSgte.click()

            await esperarWeb()


            await esperarWeb()

            await sleep(500)

            var btnConfirma
            var retry=0
            while (retry<20) {
                try {
                    btnConfirma = await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div/div[3]/div[2]/button/span[2]')), 10000)
                    break
                } catch (error) {
                    // var fechaFiniquito = await driver.wait(until.elementLocated(By.xpath('//*[@id="fechaTerminoContratoId"]')), 20000)
                    // await fechaFiniquito.sendKeys(per.fechaFiniquito + webdriver.Key.ENTER + webdriver.Key.TAB)
                    // await esperarWeb()
                    // await sleep(500)
                    // var btnSgte = await driver.wait(until.elementLocated(By.xpath('//*[@id="busqueda-termino-contrato-frame-id"]/div/form/div/form/section/div[3]/div[2]/button')), 20000)
                    // await btnSgte.click()

                    retry++
                }
            }
            
            await btnConfirma.click()
                .then(async data =>  {
                    var resultado = await rpaFiniquitoIngresado.create(per)
                        .catch(error => {
                            console.log(error)
                        })
                    var now = new Date();
                    logText += 'Finiquito ' + per.rut + ' Fecha :' + per.fechaFiniquito + ' Causal: ' + per.causal + ' Ingresado a las ' + now + "\n";
                    console.log('Finiquito ' + per.rut + ' Fecha :' + per.fechaFiniquito )
                })

            await esperarWeb()

            var btnOk = await driver.wait(until.elementLocated(By.xpath('//*[@id="busqueda-termino-contrato-frame-id"]/div/form/div/form/div/div/div/button')), 20000)
            await btnOk.click()

            await esperarWeb()

            var btnVolver = await driver.wait(until.elementLocated(By.xpath('//*[@id="busqueda-termino-contrato-frame-id"]/div/form/div[2]/div[3]/div/button')), 20000)
            await btnVolver.click()

            await esperarWeb()

            var btnRegistroFnq = await driver.wait(until.elementLocated(By.xpath('//*[@id="busqueda-termino-contrato-frame-id"]/div/section/div[3]/div[1]/div[1]/div/div/button')), 20000)
            await btnRegistroFnq.click()

            await esperarWeb();


        }


        await driver.quit()
        console.log("Fin Finiquitos RPA DT")
        var now = new Date();
        logText += "Finalizando RPA finiquitos " + now + "\n";

        await enviaCorreo(supervisoresRobot, 'Reporte de procesamiento RPA Dirección del Trabajo')    

    })
}

var getMotivo = async function (idx, texto) {

    var t = ''
    switch (idx) {
        case 15:
            t = 'Faltar al trabajo sin causa justificada durante dos días seguidos, dos lunes en el mes o tres días en igual período'
            break

        case 20:
            t = 'El empleador podrá poner término al contrato de trabajo invocando  '
            t += 'como causal las necesidades de la empresa, establecimiento o servicio,  '
            t += 'tales como las derivadas de la separación de uno o más trabajadores productividad,  '
            t += 'cambios en las condiciones del mercado o de la economía, que hagan necesaria la  '
            t += 'racionalización o modernización de los mismos, bajas en la '
            t += 'productividad, cambios en las condiciones del mercado o de la economía,  '
            t += 'que hagan necesaria la separación de uno o más trabajadores. '
            break

        case 14:
            t = "Causal Término: artículo 160 Nº2 - Ejecutar negociaciones dentro del giro del negocio estando prohibidas en el contrato."

        case 19:
            t = "Causal Término: artículo 160 nº7 - Incumplimiento grave de las obligaciones que impone el contrato."
    
        default:
            break;
    }

    return t
    
}

var getIdxCausal= function (causal) {
    var tCausales = [
        { causal: 'artículo 159 Nº1 - Mutuo acuerdo de las partes.', idx: 2 },
        { causal: 'artículo 159 Nº2 - Renuncia del trabajador, dando aviso a su empleador con treinta días de anticipación, a lo menos.', idx: 3 },
        { causal: 'artículo 159 Nº4 - Vencimiento del plazo convenido en el contrato.', idx: 5 },
        { causal: 'artículo 160 Nº3 - Faltar al trabajo sin causa justificada durante dos días seguidos, dos lunes en el mes o tres días en igual período.', idx: 15 },
        { causal: 'artículo 160 Nº2 - Ejecutar negociaciones dentro del giro del negocio estando prohibidas en el contrato.', idx: 14 },
        { causal: 'artículo 160 nº7 - Incumplimiento grave de las obligaciones que impone el contrato.', idx: 19 },
        { causal: 'artículo 161 - Necesidades de la empresa, establecimiento o servicio', idx: 20 }
    ]

    var idx=0
    for (var i=0; i < tCausales.length; i++) {
        if (causal == tCausales[i].causal) {
            idx = tCausales[i].idx
            break
        }
    }

    return idx
}



async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


var pressTab = async function (veces) {
    var strTab=''
    var i=0
    while (i<veces){
        i++
        strTab += webdriver.Key.TAB
    }
    return strTab    
}

var press = async function (tecla, veces) {
    var strTab = ''
    var i = 0
    while (i < veces) {
        i++
        strTab += tecla
    }
    return strTab
}



var leeEmpleados = async function () {
    return new Promise(async function (resolve, reject) {

        var sql = "";
        sql += "SELECT idFiniquito ,rut ,fechaFiniquito ,causal ,texto ,url "
        sql += "  FROM rpaFiniquitos  "
        sql += "  Where convert(date, substring(fechaFiniquito,1,2) + '-' + substring(fechaFiniquito,3,2) + '-' +  substring(fechaFiniquito,5,4),105) >= '2021-01-01' "
        sql += "    and rut not in (select rut from rpaFiniquitoIngresados)"
        sql += "  order by convert(date, substring(fechaFiniquito,1,2) + '-' + substring(fechaFiniquito,3,2) + '-' +  substring(fechaFiniquito,5,4),105) "
        var data = await sequelize.query(sql)
            .catch(err => {
                reject(err)
            })

        resolve(data[0])

    })
}


var esperarWeb = async function () {
    var docReady = false;
    while (!docReady) {
        docReady = driver.wait(function () {
            return driver.executeScript('return document.readyState').then(function (readyState) {
                //console.log(readyState)
                return readyState === 'complete';
            });
        });
    }
}




var getTotales = function (idNotaria) {
    return new Promise(function (resolve, reject) {
        var sql = "select count(*) total from repertorios where idNotaria = " + idNotaria;
        sequelize.query(sql)
            .then(repertorios => {
                var sql = "select count(*) total from repertoriodetalles where idNotaria = " + idNotaria;
                sequelize.query(sql)
                    .then(detalles => {
                        var totales = { totalRepertorios: repertorios[0][0].total, totalDetalles: detalles[0][0].total }
                        resolve(totales);
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
            .catch(err => {
                reject(err);
            });
    });
};

var reprograma = function (taskdata, idTask) {
    var job = cron.schedule(taskdata.minuto + ' ' + taskdata.hora + ' * * ' + taskdata.dia, function () {
        console.log('Inicio Ejecución Programada RPA ' + taskdata.hora + ':' + taskdata.minuto + ' / ' + taskdata.dia);
        procesaConsulta(null, null, taskdata);
    }, {
        scheduled: true,
        timezone: timeZone
    });
    global.tjobs.push({ id: idTask, job: job });
}

var enviaCorreo = function (destinatarios, asunto, texto) {
    return new Promise(function (resolve, reject) {
        const transporter = nodemailer.createTransport({
            host: mailServer,
            port: mailPort,
            ignoreTLS: false,
            secure: true,
            auth: {
                user: mailUsu,
                pass: mailPwd
            }
        });


        var mailOptions = {
            from: mailUsu,
            to: destinatarios,
            subject: asunto,
            text: logText,
            // attachments: [{
            //     filename: 'Afijo.csv',
            //     path: nombreArchivo,
            //     contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            // }]
        };

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log('correo enviado');
                resolve("correo enviado");
            }
        });

    })
}



exports.agendaRPAdtFiniquitosRoutes = router;
exports.reprogramaAgendaRPAdtFiniquitos = reprograma;