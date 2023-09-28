const { promiseImpl } = require("ejs");
var express = require("express");
const cron = require('node-cron');
var moment = require("moment");
var nodemailer = require('nodemailer');
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
var sequelize = require('../models/sequelizeConnection');
var task = require('../models/task');
var cargo = require("../models/cargo");
var sequelize = require('../models/sequelizeConnection');
var xl = require('excel4node');
var path = require('path')

require('dotenv').config({ path: 'variables.env' });
var rutEmpresa = process.env.RUTEMPRESA;
var timeZone = process.env.TIMEZONE;
var mailServer = process.env.MAIL_SERVER;
var mailUsu = process.env.MAIL_USUARIO;
var mailPwd = process.env.MAIL_CONTRASENA;
var mailPort = process.env.MAIL_SMTPPORT;


var logText = "";
var idNotariaActual = 0;
var nombreNotariaActual = "";
var supervisoresRobot = "";

var logText = "";

var webdriver = require('selenium-webdriver'),
    By = webdriver.By,
    until = webdriver.until;

const screen = {
    width: 1360, height: 700
};

var firefox = require('selenium-webdriver/firefox');


router.get("/index", middleware.isLoggedIn, function (req, res) {
    var data = { dia: 22, hora: 19, minuto: 30 };
    res.render("agendaCarga/index", { data: data });
});

router.post("/index", async function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);


    var taskdata = {
        correo: req.body.data.correo,
        dia: '*',
        diaDelMes: req.body.data.dia,
        hora: req.body.data.hora,
        minuto: req.body.data.minuto,
        sessionID: req.sessionID,
    }

    var cronTime = req.body.data.minuto + ' ' + req.body.data.hora + ' ' + req.body.data.dia + ' * *' 
    var job = cron.schedule(cronTime, async function () {
        console.log('Inicio Ejecución Programada Intragación Solicitudes' + req.body.data.hora + ':' + req.body.data.minuto + '/' + req.body.data.dia);
        await procesaConsulta(req, res, taskdata);
    }, {
        scheduled: true,
        timezone: timeZone
    });
    var item = {
        aplicacion: 'CargaSolicitudes', username: req.session.username,
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
    req.flash("success", "Proceso Agendado")
    res.redirect("/agendaCarga/index");
});

// router.post("/indexApi", async function (req, res) {
//     var taskdata = {}
//     await procesaConsulta(req, res, taskdata)
//     req.flash("success", "Proceso de API Terminado")
//     res.redirect("/agendaCarga/index")
// })

var procesaConsulta = async function (req, res, taskdata) {

    let dIni = new Date()
    dIni.setDate(dIni.getDate()-30)
    fIni = dIni.toLocaleString().split(' ')[0].split('-')
    dia = '16'
    mes = fIni[1]
    ano = fIni[2]
    let fechaDesde = ano + '-' + mes + '-' + dia

    let dFin = new Date()
    dFin.setDate(dIni.getDate())
    fFin = dFin.toLocaleString().split(' ')[0].split('-')
    dia = '15'
    mes = fFin[1]
    ano = fFin[2]
    let fechaHasta = ano + '-' + mes + '-' + dia

    let fechaHastaConfirmacion = ano + '-' + mes + '-' + '17'


    var dataSolicitudes = await leeSolicitudes(fechaDesde, fechaHasta, fechaHastaConfirmacion)
    

    await GeneraArchivo2(dataSolicitudes, taskdata, fechaDesde, fechaHasta, fechaHastaConfirmacion)

}

// var GeneraArchivo2 = async function (data) {
//     var path = require('path')
//     var fs = require('fs');

//     var ses = Date.now()
//     const filePath = path.resolve('tmp', 'CargaSolicitudes' + ses + '.xls')
//     var writeStream = fs.createWriteStream(filePath);
    
//     var header="RUT*" + "\t" + "VALOR*" + "\n"
//     writeStream.write(header)

//     var i=0
//     while (i < data.length) {
//         var d = data[i]
//         var row = d.rut + "\t" + d.valor + "\n"
//         writeStream.write(row)
//         i++
//     }
    
//     writeStream.close()

// }

var GeneraArchivo2 = async function (data, taskdata, fechaDesde, fechaHasta, fechaHastaConfirmacion) {

    //var path = require('path')

    var dataDet = await leeSolicitudesDet(fechaDesde, fechaHasta, fechaHastaConfirmacion)

    var xl = require('xlgen')
    var ses = Date.now()
    const filePath = path.resolve('tmp', 'CargaSolicitudes' + ses + '.xls')
    var xlg = xl.createXLGen(filePath)
    var sht = xlg.addSheet('bonos')
    var sht2 = xlg.addSheet('bonosDetalle')

    try{
        sht.cell(0, 0, 'RUT*')
        sht.cell(0, 1, 'VALOR*')} 
    catch (e) {console.log(e.name, e.message)}

    try{
        sht2.cell(0, 0, 'Nro. Solicitud')
        sht2.cell(0, 1, 'Fecha')
        sht2.cell(0, 2, 'Solicitante')
        sht2.cell(0, 3, 'Motivo')
        sht2.cell(0, 4, 'Fecha Reemplazo')
        sht2.cell(0, 5, 'Rut')
        sht2.cell(0, 6, 'Nombre')
        sht2.cell(0, 7, 'Cargo')
        sht2.cell(0, 8, 'Reemplazado')
        sht2.cell(0, 9, 'Centro')
        sht2.cell(0, 10, 'Valor')
        sht2.cell(0, 11, 'Confirmado Por')
        sht2.cell(0, 12, 'Fecha Confirmacion')
        sht2.cell(0, 13, 'Status')
    } 
    catch (e) {console.log(e.name, e.message)}

    var i=1
    var it=0
    while (it < data.length) {
        var d = data[it]
        try{
            sht.cell(i, 0, d.rut)
            sht.cell(i, 1, d.valor)} 
        catch (e) {console.log(e.name, e.message)}
        i++
        it++
    }


    var i=1
    var it=0
    while (it < dataDet.length) {
        var d = dataDet[it]
        try{
            sht2.cell(i, 0, d.NroSolicitud)
            sht2.cell(i, 1, d.fecha)
            sht2.cell(i, 2, d.Solicitante)
            sht2.cell(i, 3, d.Motivo)
            sht2.cell(i, 4, d.fechaReemplazo)
            sht2.cell(i, 5, d.rut)
            sht2.cell(i, 6, d.full_name)
            sht2.cell(i, 7, d.Cargo)
            sht2.cell(i, 8, d.Reemplazado)
            sht2.cell(i, 9, d.centro)
            sht2.cell(i, 10, d.valor)
            sht2.cell(i, 11, d.ConfirmadoPor)
            sht2.cell(i, 12, d.FechaConfirmacion)
            sht2.cell(i, 13, d.status)
        } 
        catch (e) {console.log(e.name, e.message)}
        i++
        it++
    }

    xlg.end(async function(err){
        if(err) {
            console.log(err.name, err.message)
        } else {
            await rpaCarga(filePath, taskdata, fechaDesde, fechaHasta, ses)
        }
     })    
}

var getAMD=function (fecha) {

    var meses = ['None','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    var mesesN = ['None','01','02','03','04','05','06','07','08','09','10','11','12']
    var f = fecha.split(' ')
    var dia = f[2]
    var mesIngles = f[1]
    var idxMes = meses.indexOf(mesIngles)
    var mes = mesesN[idxMes]
    var ano = f[3]
    return ano + '-' + mes + '-' + dia
    
}


var rpaCarga = async function (filePath, taskdata, fechaDesde, fechaHasta, ses) {

    driver = new webdriver.Builder()
        .forBrowser('firefox')
        //.setFirefoxOptions(new firefox.Options().headless().windowSize(screen))
        //.setFirefoxOptions(new firefox.Options().windowSize(screen))
        //.setFirefoxOptions(new firefox.Options().windowSize(screen))
        .build();


    var dataEmpresa = await leeEmpresa()        

    await driver.get(dataEmpresa.urlbuk);
    await esperarWeb();

    var usuario = await getElemento('//*[@id="user_email"]')
    await usuario.sendKeys(dataEmpresa.usernamebuk + webdriver.Key.TAB)
    var t = await usuario.getAttribute("value")

    var btnSubmit = await getElemento('//*[@id="login-form"]/input[3]')
    await btnSubmit.click()

    var pwd = await getElemento('//*[@id="user_password"]')
    await pwd.sendKeys(dataEmpresa.passwordbuk + webdriver.Key.TAB)

    var btnSubmit = await getElemento('//*[@id="new_user"]/input[3]')
    await btnSubmit.click()

    await driver.get(dataEmpresa.urlbuk.replace('/users/sign_in','/data_load/importador_masivo/bonos_predefinidos'))
    await esperarWeb();

    var txt = await getElemento('//*[@id="select2-bonos_predefinido_upload_form_bono_id-container"]')
    await txt.click()
    await esperarWeb()
    
    var txt2 = await getElemento('//*[@id="bonos_selectors"]/div[1]/div/span[2]/span/span[1]/input')
    var KeyDown = await press(webdriver.Key.DOWN, 1)
    var KeyEnter = await press(webdriver.Key.RETURN, 1)
    await txt2.sendKeys('Incentivo')
    await esperarWeb()

    await sleep(3000)

    var li = await getElemento('/html/body/div/div/section/form/div[2]/div[1]/div/span[2]/span/span[2]/ul/li[2]')
    await li.click()
    await esperarWeb()

    await sleep(3000)

    console.log("inputFile")

    var inputFile = await getElemento('/html/body/div[1]/div/section/form/span/span[1]/input')
    await inputFile.sendKeys(filePath)
    await esperarWeb()

    await sleep(25000)    
    console.log("?")

    console.log("Envío Correo")
    
    await enviaCorreo(taskdata.correo, 'Resultado Integración Solicitudes a BUK', filePath, fechaDesde, fechaHasta, ses)

    await sleep(3000)


    // var W4 = await getElemento('/html/body/div/header/nav/div/ul/li[7]/a/span')
    // var retry=0
    // while (retry < 10) {
    //     retry++
    //     var displayed = await W4.isDisplayed()
    //     var enabled = await W4.isEnabled()
    //     await sleep(250)
    //     if (displayed && enabled) {
    //         console.log(displayed + ' ' + enabled)
    //         break
    //     }
    // }
    // await W4.click()

    // var W5 = await getElemento('/html/body/div[2]/div[2]/section/div/div/div[2]/a')
    // var retry=0
    // while (retry < 10) {
    //     retry++
    //     var displayed = await W5.isDisplayed()
    //     var enabled = await W5.isEnabled()
    //     await sleep(250)
    //     if (displayed && enabled) {
    //         console.log(displayed + ' ' + enabled)
    //         break
    //     }
    // }
    // await W5.click()

    console.log('Fin RPA Carga')

    var result =  await driver.quit()
         .catch (error=>{
            console.log(error.message)
        })

    console.log("Fin Carga")
}

async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
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


var getElemento = async function (htmlpath) {
    var elemento
    var retry=0
    while (retry<50) {
        try {
            elemento = await driver.wait(until.elementLocated(By.xpath(htmlpath)), 20000)
            break
        } catch (err) {
            retry++
        }
    }
    return elemento
}

var getElementos = async function (htmlpath) {
    var elemento
    var retry=0
    while (retry<50) {
        try {
            elemento = await driver.wait(until.elementsLocated(By.xpath(htmlpath)), 20000)
            break
        } catch (err) {
            retry++
        }
    }
    return elemento
}

var enviaCorreo = async function (destinatarios, asunto, filePath, fechaDesde, fechaHasta, ses) {
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


        texto = ""
        texto += "<strong><h2>Carga de Solcitudes</h2></strong><br>"
        texto += "Se adjunta archivo cargado en BUK que contiene el resúmen <br>"
        texto += "y detalle de la valorización de las solicitudes confirmadas <br> "
        texto += "con fecha de solicitud entre el " + fechaDesde + " y el " + fechaHasta

        nombreAdjunto = 'CargaSolicitudes' + ses + '.xls'

        var mailOptions = {
            from: mailUsu,
            to: destinatarios,
            subject: asunto,
            html: texto,
            attachments: [{
                filename: nombreAdjunto,
                path: filePath,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }]
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



var reprograma = function (taskdata, idTask) {
    var cronTime = taskdata.minuto + ' ' + taskdata.hora + ' ' + taskdata.diaDelMes + ' * *' 
    var job = cron.schedule(cronTime, function () {
        console.log('Inicio Ejecución Programada RPA ' + taskdata.hora + ':' + taskdata.minuto + ' / ' + taskdata.diaDelMes);
        procesaConsulta(null, null, taskdata);
    }, {
        scheduled: true,
        timezone: timeZone
    });
    global.tjobs.push({ id: idTask, job: job });
}

var leeSolicitudes = function (fechaDesde, fechaHasta, fechaHastaConfirmacion) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select rut,"
        sql += "       sum(solicitudes.valor) valor "
        sql += "  from solicitudes inner join"
        sql += "       motivos on solicitudes.idMotivo = motivos.idMotivo inner join"
        sql += "       bukPersonas on solicitudes.idBukReemplazante = bukPersonas.idBuk inner join"
        sql += "       (select idSolicitud, estado, usuario, max(createdAt) fecha from solicitudesLogs where isnull(usuario,' ') <> ' ' group by idSolicitud, estado, usuario) logs "
        sql += "           on Logs.idSolicitud = solicitudes.idSolicitud and Logs.estado = 4 "
        sql += " where solicitudes.estado = 4"
        sql += "   and solicitudes.fechaReemplazo between '" + fechaDesde + "' and '" + fechaHasta + "'"
        sql += "   and convert(varchar,logs.fecha,23) <= '" + fechaHastaConfirmacion + "'"
        sql += "   and bukPersonas.status = 'activo'"
        sql += " group by rut "
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeSolicitudesDet = function (fechaDesde, fechaHasta, fechaHastaConfirmacion) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select solicitudes.idSolicitud NroSolicitud,  "
        sql += "       solicitudes.fecha,  "
        sql += "       bukPersonas2.full_name Solicitante, "
        sql += "       motivos.glosa Motivo, "
        sql += "       solicitudes.fechaReemplazo, "
        sql += "       bukPersonas.rut,  "
        sql += "       bukPersonas.full_name,  "
        sql += "       cargos.nombre Cargo, "
        sql += "       bukPersonas3.full_name Reemplazado, "
        sql += "       bukAreas.nombreDivision + ' - '+ bukAreas.nombre centro , "
        sql += "       solicitudes.valor, "
        sql += "       Logs.usuario ConfirmadoPor, "
        sql += "       Logs.fecha FechaConfirmacion, "
        sql += "       bukPersonas.status "
        sql += "  from solicitudes inner join "
        sql += "       motivos on solicitudes.idMotivo = motivos.idMotivo inner join "
        sql += "       bukPersonas on solicitudes.idBukReemplazante = bukPersonas.idBuk inner join "
        sql += "       bukAreas on solicitudes.IdArea = bukAreas.idBuk inner join "
        sql += "       usuarios usuarioSolicitante on solicitudes.IdUsuarioSolicitante = usuarioSolicitante.idUsuario inner join "
        sql += "       bukPersonas bukPersonas2 on usuarioSolicitante.idBuk = bukPersonas2.idBuk inner join "
        sql += "       cargos on cargos.idCargo = solicitudes.idCargoReemplazante inner join "
        sql += "       bukPersonas bukPersonas3 on solicitudes.idBukReemplazado = bukPersonas3.idBuk inner join "
        sql += "       (select idSolicitud, estado, usuario, max(createdAt) fecha from solicitudesLogs where isnull(usuario,' ') <> ' ' group by idSolicitud, estado, usuario) logs on Logs.idSolicitud = solicitudes.idSolicitud and Logs.estado = 4  "
        sql += " where solicitudes.estado = 4 "
        sql += "   and solicitudes.fechaReemplazo between '" + fechaDesde + "' and '" + fechaHasta + "'"
        sql += "   and convert(varchar,logs.fecha,23) <= '" + fechaHastaConfirmacion + "'"
        sql += " order by solicitudes.idSolicitud "
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};


var leeEmpresa = function (empid, usuario) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "SELECT idEmpresa ,nombre ,urlbuk ,usernamebuk "
        sql += "      ,passwordbuk ,meses ,urldt ,usernamedt ,passworddt"
        sql += "      ,emaillog ,createdAt ,updatedAt"
        sql += "  FROM rpaEmpresas where meses > -1"
        sequelize.query(sql)
            .then(data => {
                resolve(data[0][0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var GeneraArchivo = async function (data) {

    var path = require('path')
    var wb = new xl.Workbook()
    var ws = wb.addWorksheet('bonos')

    var styleTitulos = wb.createStyle({
        font: {
            color: 'black',
            size: 10,
            bold: true
        },
        //numberFormat: '$#,##0.00; ($#,##0.00); -',
        numberFormat: '##0', 
    });
    var style = wb.createStyle({
        font: {
            color: 'black',
            size: 10,
            bold: false
        },
        //numberFormat: '$#,##0.00; ($#,##0.00); -',
        numberFormat: '##0',
    });

    var titulo = ['RUT*', 'VALOR*']
    var i = 0
    while (i < titulo.length) {
        ws.cell(1, i + 1).string(titulo[i]).style(styleTitulos).style({alignment: {horizontal: 'center'}})
        i++
    }  


    ws.column(1).setWidth(10)
    ws.column(2).setWidth(10)

    var line=0
    var i=0
    while (i < data.length) {
        line = i+2
        var d = data[i]
        ws.cell(line, 1).string(d.rut).style(style)
        ws.cell(line, 2).number(d.valor).style(style)
        i++
    }


    var ses = Date.now();             
    const filePath = path.resolve('tmp', 'CargaSolicitudes' + ses + '.xlsx')
    wb.write(filePath, async function (err, stats) {
        if (err) {
            console.error(err);
        } else {
            console.log(filePath) // Prints out an instance of a node.js fs.Stats object
            await rpaCarga(filePath)
            // res.download(filePath, function (err) {
            //     if (err) {
            //         console.log(err);
            //     }
            // });

        }
    });

    
}


exports.agendaCargaRoutes = router;
exports.reprogramaAgendaCarga = reprograma;