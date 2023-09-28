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

var URLEMPRESA ="https://qa-areaschile.buk.cl"

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
    res.render("agendaRPAbukFiniquitos/index", { data: data });
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
        sessionID: req.sessionID,
        extrae: req.body.data.extrae
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
        aplicacion: 'RPAbukFiniquitos', username: req.session.username,
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

    res.redirect("/agendaRPAbukFiniquitos/index");
});

router.post("/indexAhora", async function (req, res) {
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
        sessionID: req.sessionID,
        extrae: req.body.data.extrae
    }

    var cronTime = req.body.data.minuto + ' ' + req.body.data.hora + ' * * ' + diaCron

    await procesaConsulta(req, res, taskdata)
        .then(ok => { res.redirect("/agendaRPAbukFiniquitos/index") })
        .catch(error=>{console.log(error.message)})
   
});

// function procesaConsulta(req, res, taskdata) {
//     var sql = "";
//     sql += "SELECT idEmpresa ,nombre ,urlbuk ,usernamebuk "
//     sql += "      ,passwordbuk ,meses ,urldt ,usernamedt ,passworddt"
//     sql += "      ,emaillog ,createdAt ,updatedAt"
//     sql += "  FROM rpaEmpresas where meses > -1"
//     sequelize.query(sql)
//         .then(data => {
//             procesaDataEmpresa(data[0], 0, taskdata)
//             .then (r=>{
//                 res.redirect("/agendaRPAbuk/index")
//             })
//             .catch(error=>{
//                 console.log(error)
//             })
//         })
//         .catch(err => { console.log(err) });
// }

var procesaConsulta = async function (req, res, taskdata) {
    return new Promise(async function (resolve, reject) {
    var sql = "";
    sql += "SELECT idEmpresa ,nombre ,urlbuk ,usernamebuk "
    sql += "      ,passwordbuk ,meses ,urldt ,usernamedt ,passworddt"
    sql += "      ,emaillog ,createdAt ,updatedAt"
    sql += "  FROM rpaEmpresas where meses > -1"
    sequelize.query(sql)
        .then(data => {
            procesaDataEmpresa(data[0], 0, taskdata)
            .then (r=>{
                resolve('ok')
            })
            .catch(error=>{
                reject(error.message)
            })
        })
        .catch(err => { console.log(err) });

    })
}

var procesaDataEmpresa = async function (data, indice, taskdata) {
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
                             e.urldt, e.usernamedt, e.passworddt, taskdata.extrae)
            .then(r => {
                indice++
                if (indice == data.length) {
                    console.log("Fin de todas las Empresas");
                    resolve("ok")
                }
                else {
                    procesaDataEmpresa(data, indice, taskdata)
                }
            })
            .catch(err => {
                reject(err)
            })
    })
}


// var procesaDataEmpresa = async function (data, indice, taskdata) {
//     return new Promise(async function (resolve, reject) {
//         for (var i=0; i<data.length; i++){
//             var e = data[indice]
//             var now = new Date();
//             console.log("Inicia Robot para Empresa " + e.nombre);
//             logText = "Inicia Robot para Empresa " + e.nombre + " " + now + "\n";
//             pagina = 1;
//             ultimaPagina = 0;
//             var result = await procesaEmpresa(e.idEmpresa, e.nombre, e.urlbuk,
//                                                 e.meses, e.emaillog,
//                                                 e.usernamebuk, e.passwordbuk,
//                                                 e.urldt, e.usernamedt, e.passworddt, taskdata.extrae)
//                                 .catch(
//                                     error=>{reject(error.message)}
//                                 )
//         }
//         console.log("Fin de todas las Empresas");
//         resolve("ok")
//     })
// }




var driver;
var publico = false;

var procesaEmpresa = async function (idEmpresa, nombre, urlbuk, meses, emaillog, usernamebuk, 
    passwordbuk, urldt, usernamedt, passworddt, extrae) {
    return new Promise(async function (resolve, reject) {
        // driver = new webdriver.Builder()
        //     .forBrowser('firefox')
        //     //.setFirefoxOptions(new firefox.Options().headless().windowSize(screen))
        //     .setFirefoxOptions(new firefox.Options().windowSize(screen))
        //     //.setFirefoxOptions(new firefox.Options().windowSize(screen))
        //     .build();
        const chrome = require('selenium-webdriver/chrome')

        driver = await new webdriver.Builder()
            .forBrowser('chrome')
            //.setChromeOptions(new chrome.Options().headless())
            .setChromeOptions(new chrome.Options().addArguments('start-fullscreen'))
            .build();


        var idEmpresaActual = idEmpresa;
        var nombreEmpresaActual = nombre;
        var supervisoresRobot = emaillog;

        var now = new Date();        
        logText = "Iniciando RPA extrae Finiquitos desde BUK " + now + "\n";
        logText += "Accediendo al sitio " + urlbuk + "\n";

        await driver.get(urlbuk);
        await esperarWeb();


        var usuario = await driver.wait(until.elementLocated(By.xpath('//*[@id="user_email"]')), 60000);
        await usuario.sendKeys(usernamebuk + webdriver.Key.TAB);

        var t = await usuario.getAttribute("value");

        var btnsubmit = await driver.wait(until.elementLocated(By.xpath('//*[@id="login-form"]/input[3]')), 60000); 
        await btnsubmit.click()
        while (noDisponible) {
            if (await btnsubmit.isDisplayed()) {
                noDisponible = false;
            }
        }

        await esperarWeb();

        var password = await driver.wait(until.elementLocated(By.xpath('//*[@id="user_password"]')), 60000);
        await password.sendKeys(passwordbuk + webdriver.Key.TAB);

        logText += "Conectando usuario " + usernamebuk + "\n";


        var btnsubmit = await driver.wait(until.elementLocated(By.xpath('//*[@id="new_user"]/input[3]')), 60000);
        var noDisponible = true;
        while (noDisponible) {
            if (await btnsubmit.isDisplayed()) {
                noDisponible = false;
            }
        }
        await btnsubmit.click()
        procesaPaginaDatos2(meses, extrae, supervisoresRobot)
            .then(r => {
                resolve("ok")
            })
            .catch(e => {
                reject(err)
            })

    })
}

var finPaginas = false
var tEmpleados=[]
var procesaPaginaDatos2 = async function (meses, extrae, supervisoresRobot) {
    return new Promise(async function (resolve, reject) {
        tEmpleados = []
        
        await driver.get(URLEMPRESA + '/employees?filter_query_id=2');
        await esperarWeb();

        var W1 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div/div[3]/div[2]/div/div[1]/div[1]/div/label/select")),20000)
        await W1.click()

        var W2 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div/div[3]/div[2]/div/div[1]/div[1]/div/label/select/option[5]")), 20000)
        await W2.click()

        await esperarWeb()

        var tablaW = await driver.wait(until.elementsLocated(By.xpath('/html/body/div/div/section/div/div/div[3]/div[2]/div/div[2]/div/table/tbody/tr')), 20000)            
        var esperaDespliegue = true
        while (esperaDespliegue){
            tablaW = await driver.wait(until.elementsLocated(By.xpath('/html/body/div/div/section/div/div/div[3]/div[2]/div/div[2]/div/table/tbody/tr')), 20000)            
            if (tablaW.length>25) {
                esperaDespliegue = false
            }
        }
        await sleep(10000)        

        var pag=1;
        finPaginas=false;
        while (!finPaginas) {
            var tabla = await driver.wait(until.elementsLocated(By.xpath('/html/body/div/div/section/div/div/div[3]/div[2]/div/div[2]/div/table/tbody/tr')), 20000)
            var i = 0
            console.log(tabla.length)
            while (i < tabla.length) {

                var lhtml = ''
                var attempts = 0;
                while (attempts < 15) {
                    try {
                        var lhtml = await tabla[i].getAttribute("innerHTML")
                        break
                    } catch (error) {
                        tabla = await driver.wait(until.elementsLocated(By.xpath('/html/body/div/div/section/div/div/div[3]/div[2]/div/div[2]/div/table/tbody/tr')), 20000)
                    }
                    attempts++
                }
                i++         
                var dom = parser.parseFromString(lhtml)
                var columnas = dom.getElementsByTagName("td")
                var href=""
                var fechaTermino=""
                try {
                    var href = columnas[1].innerHTML
                    fechaTermino = columnas[7].innerHTML
                }
                catch (err) {
                    console.log(err)
                }


                var dom = parser.parseFromString(href)
                var anker = dom.getElementsByTagName("a")
                var href = URLEMPRESA + anker[0].attributes[7].value
                if (href != 'https://qa-areaschile.buk.cl/employees/1039') {
                    await procesaEmpleado(href)
                }
            }
            console.log(tabla.length)
            pag++
            finPaginas = await avanzaPagina(pag)
        }

        logText += "Buscando finiquitos nuevos" + "\n";
        var i = 0
        while (i < tEmpleados.length){
            await ProcesaRegistraEmpleado(tEmpleados[i], extrae)
            i++
        }
        var now = new Date();
        logText += "Finalizando RPA " + now + "\n";

        var W4 = await driver.wait(until.elementLocated(By.xpath('/html/body/div/header/nav/div/ul/li[7]/a/span')), 20000)
        await W4.click()

        var W5 = await driver.wait(until.elementLocated(By.xpath('/html/body/div[2]/div[2]/section/div/div/div[2]/a')), 20000)
        await W5.click()

        await driver.quit()
            .then(ok => { resolve("ok") })
            .catch (error=>{console.log(error.message)})

        await enviaCorreo(supervisoresRobot, 'Reporte de procesamiento RPA BUK')    
        
    })
}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


var procesaEmpleado = function (href) {
    console.log(href)
    tEmpleados.push(href)
}

var avanzaPagina = async function (pagina) {

    var tablaBotonera = await driver.wait(until.elementsLocated(By.xpath('/html/body/div/div/section/div/div/div[3]/div[2]/div/div[3]/div[2]/div/ul/li')), 20000)
    var indUltimoBoton = await tablaBotonera.length

    var btnSiguientePagina = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/section/div/div/div[3]/div[2]/div/div[3]/div[2]/div/ul/li[' + indUltimoBoton + ']')), 20000);
    
    var btnStatus = await btnSiguientePagina.getAttribute("class")
                    .catch(err=>{
                        console.log(err)
                    })

    var finPag = (btnStatus == 'paginate_button page-item next disabled')
    if (!finPag) {
        //await driver.actions().mouseMove(btnSiguientePagina).click().perform()
        await btnSiguientePagina.click()
        await esperarWeb();
    }

    return finPag
}

var yaCargado = async function (rut, fechaFiniquito, url) {
    
    var fnq = await rpaFiniquito.findOne({ where: { url: url } })

    return !(fnq == null)
}

var ProcesaRegistraEmpleado = async function (url, periodoProceso, extrae) {

    if (!(await yaCargado(rut, fechaFiniquito, url))) {
        var rut = ''
        var retry = 0
        while (retry < 20) {
            try {
                await driver.get(url)
                await esperarWeb();

                var WebElement1 = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/section/div/div[1]/div/div/div[2]/div[1]/div[2]/div/ul/div[1]/div[2]')), 20000);
                rut = await WebElement1.getText()
                rut = rut.split('.').join('')
                break
            } catch (error) {
                retry++
            }
        }


        var fechaFiniquito = '01-01-1900'
        var mesFiniquito = '01-1900'
        var WebElement3 = await driver.wait(until.elementLocated(By.xpath('//*[@id="resumen"]/div/div[2]/div[1]/table/tbody/tr[13]/td[2]')), 20000);
        var fechaSalida = await WebElement3.getText()
        var tfecha = fechaSalida.split(" ")
        var dia = tfecha[0]
        var mesp = tfecha[2]
        var año = tfecha[4]
        fechaFiniquito = formateaFecha(dia, mesp, año)
        tfecha = fechaFiniquito.split('-')
        mesFiniquito = tfecha[1] + '-' + tfecha[2]

        console.log(" rut " + rut)


        logText += "Ingresando rut " + rut + "\n";


        var divResumen = await driver.wait(until.elementLocated(By.xpath('//*[@id="resumen"]'), 20000));
        var divResumenHtml = await divResumen.getAttribute('innerHTML');
        var causal = divResumenHtml.split('Causal Término')[1].split('javascript:void(0)" aria-expanded="false">')[1].split('</a></td>\n    \n  </tr>\n\n\n  <tr>\n    \n      <td><b>Saldo')[0];


        //var WebCausal = await driver.wait(until.elementLocated(By.xpath('//*[@id="resumen"]/div[1]/div[1]/table/tbody/tr[14]/td[2]/a/text()')), 20000);
        //causal = await WebCausal.getText()

        //Historial
        var WebHistorial = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[2]/div/div/div[1]/ul/li[4]/a")), 20000);
        await WebHistorial.click()
        await esperarWeb()


        //box-body
        var texto
        var WebElement = await driver.wait(until.elementLocated(By.xpath('//*[@id="timeline"]/div/div/div[1]/div[2]/ul')), 20000);
        var tbodyHtml = await WebElement.getAttribute("innerHTML")
        var dom = await parser.parseFromString(tbodyHtml)
        var filas = await dom.getElementsByTagName("li")
        var outerHtml = await filas[1].outerHTML
        texto = outerHtml.split('data-append-to="body" title="Detalle" href="javascript:void(0)" aria-expanded="false">')[1].split('</a>')[0]


        var finiquito = {
            rut: rut,
            fechaFiniquito: fechaFiniquito,
            causal: causal,
            texto: texto,
            url: url
        }

        await registraFiniquito(finiquito)


    }
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

var registraFiniquito = async function (finiquito) {
    var dataEmp = await rpaFiniquito.findAll({
        where: {
            rut: finiquito.rut,
            fechaFiniquito : finiquito.fechaFiniquito
        }
    })

    const t = await sequelize.transaction();
    if (dataEmp.length > 0) {
        await rpaFiniquito.update(finiquito, { where: { idFiniquito: dataEmp[0].idFiniquito } })
            .catch(error => {
                console.log(error)
            })
    } else {
        var resultado = await rpaFiniquito.create(finiquito)
            .catch(error => {
                console.log(error)
            })
    }
    await t.commit();
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

var formateaFecha = function (dia, mes, año) {
    var diaOk=""
    var mesOk=""

    if (Number(dia)<10) {
        diaOk = '0'+dia;
    } else {
        diaOk = dia;
    }

    var m = mes.substring(0,3);
    if (m == 'ene') { mesOk = '01' } 
    if (m == 'feb') { mesOk = '02' } 
    if (m == 'mar') { mesOk = '03' } 
    if (m == 'abr') { mesOk = '04' } 
    if (m == 'may') { mesOk = '05' } 
    if (m == 'jun') { mesOk=  '06' } 
    if (m == 'jul') { mesOk=  '07' } 
    if (m == 'ago') { mesOk=  '08' } 
    if (m == 'sep') { mesOk=  '09' } 
    if (m == 'oct') { mesOk=  '10' } 
    if (m == 'nov') { mesOk=  '11' } 
    if (m == 'dic') { mesOk = '12' } 


    return diaOk + mesOk + año;
  
}

var getNumMes = function (mes) {
    var mesOk=''
    var m = mes.substring(0, 3).toLowerCase();
    if (m == 'ene') { mesOk = '01' }
    if (m == 'feb') { mesOk = '02' }
    if (m == 'mar') { mesOk = '03' }
    if (m == 'abr') { mesOk = '04' }
    if (m == 'may') { mesOk = '05' }
    if (m == 'jun') { mesOk = '06' }
    if (m == 'jul') { mesOk = '07' }
    if (m == 'ago') { mesOk = '08' }
    if (m == 'sep') { mesOk = '09' }
    if (m == 'oct') { mesOk = '10' }
    if (m == 'nov') { mesOk = '11' }
    if (m == 'dic') { mesOk = '12' }
    return mesOk
}


exports.agendaRPAbukFiniquitosRoutes = router;
exports.reprogramaAgendaRPAbukFiniquitos = reprograma;