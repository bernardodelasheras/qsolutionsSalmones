const { promiseImpl } = require("ejs");
var express = require("express");
const cron = require('node-cron');
var moment = require("moment");
var nodemailer = require('nodemailer');
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
var sequelize = require('../models/sequelizeConnection');
var rpaEmpleado = require("../models/rpaEmpleado");
var rpaEmpleadoIngresado = require("../models/rpaEmpleadoIngresado");
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
    res.render("agendaRPAdt/index", { data: data });
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
        aplicacion: 'RPAdt', username: req.session.username,
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

    res.redirect("/agendaRPAdt/index");
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

        var btnRegistrar = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div[2]/div/section/div[3]/div[1]/div/div/button')), 40000)
        await btnRegistrar.click()
        await esperarWeb();

        var titulo = await driver.wait(until.elementLocated(By.xpath('//*[@id="barra-menu-perfil"]/div[2]/span')), 40000)
        var pos = await titulo.getRect()

        var iframe = await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div[2]/div/div/div/div/div/iframe')), 20000)
        await driver.switchTo().frame(iframe)
        var pos = await iframe.getRect()

        var btnRegistroCto = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div[2]/div/section/div[3]/div[1]/div[1]/div/div/button')), 20000)
        await btnRegistroCto.click()
        await esperarWeb();

        logText += "Buscando contratos nuevos " + "\n";
        
        data = await leeEmpleados()
            .catch(error => {
                console.log(error)
            })

        for (var i = 0; i < data.length; i++) {
            var per = data[i]
            
            var comunaNoOk=true
            while (comunaNoOk){
                var spin = true
                while (spin) {
                    try {
                        var spinImg = await driver.wait(until.elementLocated(By.xpath('//*[@id="front001-servicios-minimos-frame-id"]/div/section/section/div/div/div[2]/form/div/div[1]/div/img')), 100)
                        try {
                            var btnRetintenta = await driver.wait(until.elementLocated(By.xpath('/html/body/div[2]/div/div[2]/div/div[2]/div/div/div[2]/button')), 100)
                            await btnRetintenta.click()
                            await vuelveAnteriores()
                        } catch (error) {
                            spin = true
                        }
                    } catch (error) {
                        spin = false
                        comunaNoOk = false
                    }
                }
            }

            await esperarWeb();
            // await driver.executeScript("document.getElementsByClassName('iso-databot')[0].click();")
            // await sleep(1000)
            await driver.executeScript("document.getElementsByClassName('icono_burbuja-2')[0]")
            // await sleep(1000)



            logText += "Ingresando rut " + per.rut + "\n";

            console.log("Inicio rut " + per.rut + ' ' + i + ' de ' + data.length)

            await ingresaPagina1(per)
            console.log("Fin Pagina 1 " + per.rut)

            await ingresaPagina2(per)
            console.log("Fin Pagina 2 " + per.rut)

            await ingresaPagina3(per)
            console.log("Fin Pagina 3 " + per.rut)

            await ingresaPagina4(per)
            console.log("Fin Pagina 4 " + per.rut)

            var d = {rut: per.rut}
            var resultado = await rpaEmpleadoIngresado.create(d)
                .catch(error => {
                    console.log(error)
                })
        }


        await driver.quit()
        console.log("Fin RPA DT")
        var now = new Date();
        logText += "Finalizando RPA " + now + "\n";

        await enviaCorreo(supervisoresRobot, 'Reporte de procesamiento RPA Dirección del Trabajo')    

    })
}

var ingresaPagina1 = async function (per) {
    var ComunaCto = await driver.wait(until.elementLocated(By.xpath('//*[@id="comunaJuridiccionId"]')), 20000)
    await ComunaCto.sendKeys(per.comunaPrestacion + webdriver.Key.RETURN + webdriver.Key.TAB)

    var FechaCto = await driver.wait(until.elementLocated(By.xpath('//*[@id="fechaSuscripcionContrato"]')), 20000)
    await FechaCto.sendKeys(per.fecha + webdriver.Key.RETURN + webdriver.Key.TAB)

    var rutRepre = await driver.wait(until.elementLocated(By.xpath('//*[@id="rutRepresentanteLegal"]')), 20000)
    await rutRepre.click()
    esperarWeb()
    var rutRepreValor = await driver.wait(until.elementLocated(By.xpath('/html/body/div[4]/div/div/div/div[2]/div[1]/div/div/div/div')), 20000)
    await rutRepreValor.click()

    var correoRepresentante = await driver.wait(until.elementLocated(By.xpath('//*[@id="email"]')), 20000)
    await correoRepresentante.sendKeys(per.correoRepresentante + webdriver.Key.TAB)

    var ActEconomica = await driver.wait(until.elementLocated(By.xpath('//*[@id="codActividadEconomica"]')), 20000)
    await ActEconomica.sendKeys('ACTIVIDADES DE' + webdriver.Key.RETURN + webdriver.Key.TAB)

    var domicilioEmpresa = await driver.wait(until.elementLocated(By.xpath('//*[@id="domicilio"]')), 20000)
    await domicilioEmpresa.sendKeys('JEAN M' + webdriver.Key.RETURN + webdriver.Key.TAB)

    var rut = await driver.wait(until.elementLocated(By.xpath('//*[@id="rutTrabajador"]')), 20000)
    await rut.sendKeys(per.rut + webdriver.Key.TAB)
    var rutSearch = await driver.wait(until.elementLocated(By.xpath('//*[@id="front001-servicios-minimos-frame-id"]/div/section/section/div/div/div[2]/form/div/div/div[6]/div/div[3]/div/div[1]/div[2]/div[1]/div/span/span/span/button')), 20000)
    await rutSearch.click()

    // await esperarWeb()
    // await sleep(2000)

    var retry=0
    var txtnombre=''
    while (txtnombre.trim() == '') {
        retry++
        await rutSearch.click()
        var nombres = await driver.wait(until.elementLocated(By.xpath('//*[@id="nombresTrabajador"]')), 20000)
        txtnombre = await nombres.getAttribute("value")
        if (retry > 50000) {
            break
        }
    }


    var nacion = await getNacionalidad(per.nacionalidad)
    try {
        var nacionalidad = await driver.wait(until.elementLocated(By.xpath('//*[@id="codigoNacionalidad"]')), 500)
        await nacionalidad.sendKeys(nacion + webdriver.Key.RETURN + webdriver.Key.TAB)
    } catch (error) {
        console.log('Nacionalidad ' + error.message)
    }

    
    var correoEmpleado = per.correoEmpleado
    if (per.correoEmpleado.trim() == '') {
        correoEmpleado = 'contacto@gmail.com'
    }
    var correo = null
    var correo = await driver.wait(until.elementLocated(By.xpath('//*[@id="emailTrabajador"]')), 20000)
    await driver.executeScript(elt => elt.select(), correo)
    await correo.sendKeys(await press(webdriver.Key.BACK_SPACE,50))
    await correo.sendKeys(correoEmpleado)


    var telefonoEmpleado = per.telefonoEmpleado
    if (per.telefonoEmpleado.trim() == '') {
        telefonoEmpleado = '912345678'
    }
    var fono = null
    var fono = await driver.wait(until.elementLocated(By.xpath('//*[@id="telefonoTrabajador"]')), 20000)
    await driver.executeScript("arguments[0].select();", fono)
    await fono.sendKeys(webdriver.Key.BACK_SPACE + telefonoEmpleado)

    var regionEmpleado = null
    var regionEmpleado = await driver.wait(until.elementLocated(By.xpath('//*[@id="regionTrabajador"]')), 20000)
    await regionEmpleado.sendKeys('METRO' + webdriver.Key.RETURN )

    var comunaEmpleado = null
    var comunaEmpleado = await driver.wait(until.elementLocated(By.xpath('//*[@id="comunaTrabajador"]')), 20000)
    await comunaEmpleado.sendKeys(per.comuna + webdriver.Key.RETURN )

    var calleEmpleado = null
    var calleEmpleado = await driver.wait(until.elementLocated(By.xpath('//*[@id="calleTrabajador"]')), 20000)
    await driver.executeScript("arguments[0].select();", calleEmpleado)
    await calleEmpleado.sendKeys(webdriver.Key.BACK_SPACE + per.calle)
    
    var nro = per.calle.replace(/[^0-9]/g, "")
    if (nro == '') {nro = 'SN'}
    var nrocalleEmpleado = null
    var nrocalleEmpleado = await driver.wait(until.elementLocated(By.xpath('//*[@id="numeroTrabajador"]')), 20000)
    await driver.executeScript("arguments[0].select();", nrocalleEmpleado)
    await nrocalleEmpleado.sendKeys(webdriver.Key.BACK_SPACE + nro)
    
    var btnSgtePag1 = null
    var btnSgtePag1 = await driver.wait(until.elementLocated(By.xpath('//*[@id="front001-servicios-minimos-frame-id"]/div/section/section/div/div/div[2]/form/div/div/div[8]/div[3]/button')), 20000)
    while (retry < 50) {
        retry++
        var displayed = await btnSgtePag1.isDisplayed()
        var enabled = await btnSgtePag1.isEnabled()
        console.log(displayed + ' ' + enabled)
        if (displayed && enabled) {
            break
        }
    }

    //await btnSgtePag1.click()
    await driver.executeScript("document.getElementsByClassName('ant-btn ant-btn-primary')[1].click();")

    await esperarWeb()

}

var ingresaPagina2 = async function (per) {

    await esperarWeb()
    var tablaCargos
    var retry=0
    while (retry<5) {
        try {
            tablaCargos = await driver.wait(until.elementsLocated(By.xpath('/html/body/div[2]/div/div/div/div[2]/div[1]/div/div/div')), 500)
            console.log(tablaCargos.length)
            break
        } catch (error) {
            retry++
        }
    }

    var cargoEmpleado = await locateElement('//*[@id="cargoId"]')      //    driver.wait(until.elementLocated(By.xpath('//*[@id="cargoId"]')), 60000)
    var retry = 0
    while (retry < 50) {
        retry++
        var displayed = await cargoEmpleado.isDisplayed()
        var enabled = await cargoEmpleado.isEnabled()
        console.log(displayed + ' ' + enabled)
        if (displayed && enabled) {
            break
        }
    }

    await cargoEmpleado.click()
    await cargoEmpleado.sendKeys('Otro' + webdriver.Key.ENTER)

    var intentos = 0
    while (intentos < 50) {
        try {
            intentos++
            var otroCargoEmpleado = await driver.wait(until.elementLocated(By.xpath('//*[@id="otroCargo"]')), 1000)
            await otroCargoEmpleado.sendKeys(per.cargo + webdriver.Key.TAB)
            break
        } catch (error) {
            console.log("espera Otro Cargo")
        }
    }

    var funcionEmpleado = await driver.wait(until.elementLocated(By.xpath('//*[@id="funciones"]')), 60000)
    await funcionEmpleado.sendKeys(per.cargo + webdriver.Key.RETURN + webdriver.Key.TAB)

    var regionPrestacion = await driver.wait(until.elementLocated(By.xpath('//*[@id="regionLugarPresatacionServicios"]')), 60000)
    await regionPrestacion.sendKeys('METROPOLITANA' + webdriver.Key.RETURN + webdriver.Key.TAB)

    var comunaPrestacion = await driver.wait(until.elementLocated(By.xpath('//*[@id="comunaLugarPresatacionServicios"]')), 60000)
    await comunaPrestacion.sendKeys(per.comunaPrestacion + webdriver.Key.RETURN + webdriver.Key.TAB)

    var callePrestacion = await driver.wait(until.elementLocated(By.xpath('//*[@id="calleLugarPresatacionServicios"]')), 60000)
    await callePrestacion.sendKeys(per.callePrestacion + webdriver.Key.TAB)

    var numeroPrestacion = await driver.wait(until.elementLocated(By.xpath('//*[@id="numeroLugarPresatacionServicios"]')), 60000)
    await numeroPrestacion.sendKeys(per.numeroPrestacion + webdriver.Key.TAB)

    await cargoEmpleado.sendKeys('Otro' + webdriver.Key.ENTER)

    var btnSgtePag2 = await driver.wait(until.elementLocated(By.xpath('//*[@id="front001-servicios-minimos-frame-id"]/div/section/section/div/div/div[2]/form/div/div/div[5]/div[3]/button')), 20000)
    await btnSgtePag2.click()

    await esperarWeb()
}

var ingresaPagina3 = async function (per) {

    await esperarWeb()
    var tablaTipoSueldo
    var retry = 0
    while (retry < 5) {
        try {
            tablaTipoSueldo = await driver.wait(until.elementsLocated(By.xpath('/html/body/div[2]/div/div/div/div[2]/div[1]/div/div/div')), 500)
            console.log(tablaTipoSueldo.length)
            break
        } catch (error) {
            retry++
        }
    }


    var tipoSueldo = per.jornada.split(' ')[0]
    var tipoSueldoBase = await driver.wait(until.elementLocated(By.xpath('//*[@id="sueldoBase"]')), 60000)
    var retry = 0
    while (retry < 10) {
        retry++
        var displayed = await tipoSueldoBase.isDisplayed()
        var enabled = await tipoSueldoBase.isEnabled()
        if (enabled) {
            break
        }
    }
    //await tipoSueldoBase.click()
    if (tipoSueldo=='Diaria') {
        //var tipoDiario = await driver.wait(until.elementLocated(By.xpath('/html/body/div[2]/div/div/div/div[2]/div[1]/div/div/div[2]/div')), 20000)
        //await tipoDiario.click()
        await tipoSueldoBase.sendKeys(await press(webdriver.Key.ARROW_DOWN, 2) + webdriver.Key.ENTER)
    } else {
        // var tipoMensual = await driver.wait(until.elementLocated(By.xpath('/html/body/div[2]/div/div/div/div[2]/div[1]/div/div/div[4]/div')), 20000)
        // await tipoMensual.click()
        await tipoSueldoBase.sendKeys(await press(webdriver.Key.ARROW_DOWN, 4) + webdriver.Key.ENTER)
    }
    
    var sueldoImponible = await driver.wait(until.elementLocated(By.xpath('//*[@id="montoImponible"]')), 60000)
    await sueldoImponible.sendKeys(per.SueldoBase + await pressTab(11))

    var tipoGratificacion = await driver.wait(until.elementLocated(By.xpath('//*[@id="front001-servicios-minimos-frame-id"]/div/section/section/div/div/div[2]/form/div/div/div[9]/div[1]/div[1]/div/div/div[2]/div/div/div/div/span[2]')), 60000)
    await tipoGratificacion.click()

    var tipoGratificacionSelItem = await driver.wait(until.elementLocated(By.xpath('/html/body/div[3]/div/div/div/div[2]/div[1]/div/div/div[4]/div')), 60000)
    await driver.executeScript("arguments[0].click();", tipoGratificacionSelItem);

    var periodoPagoGrat = await driver.wait(until.elementLocated(By.xpath('//*[@id="periodicidadPagoGratificacionId4"]')), 60000)    
    await esperarWeb()
    await periodoPagoGrat.sendKeys(await press(webdriver.Key.ARROW_DOWN, 6) + webdriver.Key.ENTER)

    var periodoPago = await driver.wait(until.elementLocated(By.xpath('//*[@id="periodoPago"]')), 60000)    
    await esperarWeb()
    if (tipoSueldo == 'Diaria') {
        await periodoPago.sendKeys(await press(webdriver.Key.ARROW_DOWN, 3) + webdriver.Key.ENTER)
    } else {
        await periodoPago.sendKeys(await press(webdriver.Key.ARROW_DOWN, 2) + webdriver.Key.ENTER)

        var fechaPago = await driver.wait(until.elementLocated(By.xpath('//*[@id="fechaPago"]')), 20000)
        await fechaPago.sendKeys(await press(webdriver.Key.ARROW_DOWN, 30) + webdriver.Key.ENTER)
    }

    var formaPago = await driver.wait(until.elementLocated(By.xpath('//*[@id="formaPago"]')), 20000)
    if (per.formaPago =='Transferencia Bancaria') {
        await formaPago.sendKeys(await press(webdriver.Key.ARROW_DOWN, 5) + webdriver.Key.ENTER)
    } else {
        await formaPago.sendKeys(await press(webdriver.Key.ARROW_DOWN, 3) + webdriver.Key.ENTER)    
    }

    var anticipo = await driver.wait(until.elementLocated(By.xpath('//*[@id="anticipoRemuneraciones"]')), 20000)
    await anticipo.sendKeys(await press(webdriver.Key.ARROW_DOWN, 1) + webdriver.Key.ENTER)    
    
    var indiceAfp = await getIndiceAfp(per.afp)
    var afp = await driver.wait(until.elementLocated(By.xpath('//*[@id="afp"]')), 20000)
    await afp.sendKeys(await press(webdriver.Key.ARROW_DOWN, indiceAfp) + webdriver.Key.ENTER)    

    var isapre = per.salud.split(' UF')[0]
    var indiceIsapre = await getIndiceIsapre(isapre)
    var salud = await driver.wait(until.elementLocated(By.xpath('//*[@id="salud"]')), 20000)
    await salud.sendKeys(await press(webdriver.Key.ARROW_DOWN, indiceIsapre) + webdriver.Key.ENTER)    



    var btnSgtePag3 = await driver.wait(until.elementLocated(By.xpath('//*[@id="front001-servicios-minimos-frame-id"]/div/section/section/div/div/div[2]/form/div/div/div[12]/div[3]/button')), 20000)
    await btnSgtePag3.click()

    await esperarWeb()

}

var ingresaPagina4 = async function (per) {


    var horasJornada = per.jornada.split(' ')[1].split('.0')[0]
    var idx = await getIndiceJornada(horasJornada)

    var horasJornada
        var retry=0
    while (retry < 50) {
        retry++
        try {
            horasJornada = await driver.wait(until.elementLocated(By.xpath('//*[@id="duracionJornadaSemanal"]')), 20000)
        } catch (error) {
            console.log (error)
        }
    }
    
    var retry = 0
    while (retry < 10) {
        retry++
        var displayed = await horasJornada.isDisplayed()
        var enabled = await horasJornada.isEnabled()
        if (enabled) {
            break
        }
    }

    await horasJornada.sendKeys(await press(webdriver.Key.ARROW_DOWN, idx) + webdriver.Key.ENTER)    

    var turnos = await driver.wait(until.elementLocated(By.xpath('//*[@id="horariosTurnos"]')), 20000)
    await turnos.sendKeys(await press(webdriver.Key.ARROW_DOWN, 2) + webdriver.Key.ENTER)
    
    var indiceBoton=0
    if (per.tipoContrato == 'Indefinido') {
        var indiceBoton = 15
        var tc = await driver.wait(until.elementLocated(By.xpath('//*[@id="duracionId"]/label[1]/span[1]/input')), 20000)
        await tc.click()
    }  else {
        var indiceBoton = 21
        var tc = await driver.wait(until.elementLocated(By.xpath('//*[@id="duracionId"]/label[2]/span[1]/input')), 20000)
        await tc.click()

        var fecha = await getFechaTermino(per.tipoContrato)
        var fechaTermino = await driver.wait(until.elementLocated(By.xpath('//*[@id="fechaTerminoRelacionLaboral"]')), 20000)
        await fechaTermino.sendKeys(fecha + webdriver.Key.RETURN + webdriver.Key.TAB)

    }

    var fechaInicio = await driver.wait(until.elementLocated(By.xpath('//*[@id="fechaInicioContrato"]')), 20000)
    await fechaInicio.sendKeys(per.fecha + webdriver.Key.RETURN + webdriver.Key.TAB)

    var btnDJ = await driver.wait(until.elementLocated(By.xpath('//*[@id="switch4"]')), 20000)
    await btnDJ.click()

    //await esperarWeb()
    //await sleep(1000)

    //console.log('pag 4 sleep 5')
    //await sleep(5000)

    
    //var btnFinalizar = await driver.wait(until.elementLocated(By.xpath('//*[@id="front001-servicios-minimos-frame-id"]/div/section/section/div/div/div[2]/form/div/div/div[9]/div[2]/button')), 20000)
    //await btnFinalizar.sendKeys(webdriver.Key.ENTER)
    //await btnFinalizar.click()
    await driver.executeScript("document.getElementsByClassName('ant-btn ant-btn-primary btn-finalizar')[0].click();")

    await esperarWeb()

    await driver.executeScript("document.getElementsByTagName('button')["+ indiceBoton + "].click();")

    var registroOK=false
    while (!registroOK) {
        try {
            var btnVolver = await driver.wait(until.elementLocated(By.xpath('//*[@id="front001-servicios-minimos-frame-id"]/div/section/section/div/section/div/div[2]/div/div/button')), 20000)
            await btnVolver.sendKeys(webdriver.Key.ENTER)
            registroOK=true
        } catch (error) {
            var retry = 0
            while (retry < 10) {
                try {
                    var btnError = await driver.wait(until.elementLocated(By.xpath('//*[@id="front001-servicios-minimos-frame-id"]/div/section/section/div/section/div/div[2]/div/div/button')), 20000)
                    await btnError.sendKeys(webdriver.Key.ENTER)
                    break
                } catch (error) {
                    retry++
                }
            }

            await esperarWeb()
            await sleep(1000)

            var btnBorradores = await driver.wait(until.elementLocated(By.xpath('//*[@id="front001-servicios-minimos-frame-id"]/div/section/div[3]/div[1]/div[3]/div/div/button')), 20000)
            await btnBorradores.sendKeys(webdriver.Key.ENTER)

            await esperarWeb()
            await sleep(1000)

            //Lapiz
            try { 
                await driver.executeScript("document.getElementsByTagName('button')[1].click();")
            } catch(error) {
                break
            }
            

            await esperarWeb()
            await sleep(1000)

            var horasJornada = per.jornada.split(' ')[1].split('.0')[0]
            var idx = await getIndiceJornada(horasJornada)

            var horasJornada
            var retry = 0
            while (retry < 50) {
                retry++
                try {
                    horasJornada = await driver.wait(until.elementLocated(By.xpath('//*[@id="duracionJornadaSemanal"]')), 20000)
                } catch (error) {
                    console.log(error)
                }
            }

            var retry = 0
            while (retry < 10) {
                retry++
                var displayed = await horasJornada.isDisplayed()
                var enabled = await horasJornada.isEnabled()
                if (enabled) {
                    break
                }
            }

            await horasJornada.sendKeys(await press(webdriver.Key.ARROW_DOWN, idx) + webdriver.Key.ENTER)

            var turnos = await driver.wait(until.elementLocated(By.xpath('//*[@id="horariosTurnos"]')), 20000)
            await turnos.sendKeys(await press(webdriver.Key.ARROW_DOWN, 2) + webdriver.Key.ENTER)

            var indiceBoton = 0
            if (per.tipoContrato == 'Indefinido') {
                var indiceBoton = 15
                var tc = await driver.wait(until.elementLocated(By.xpath('//*[@id="duracionId"]/label[1]/span[1]/input')), 20000)
                await tc.click()
            } else {
                var indiceBoton = 21
                var tc = await driver.wait(until.elementLocated(By.xpath('//*[@id="duracionId"]/label[2]/span[1]/input')), 20000)
                await tc.click()

                var fecha = await getFechaTermino(per.tipoContrato)
                var fechaTermino = await driver.wait(until.elementLocated(By.xpath('//*[@id="fechaTerminoRelacionLaboral"]')), 20000)
                await fechaTermino.sendKeys(fecha + webdriver.Key.RETURN + webdriver.Key.TAB)

            }

            var fechaInicio = await driver.wait(until.elementLocated(By.xpath('//*[@id="fechaInicioContrato"]')), 20000)
            await fechaInicio.sendKeys(per.fecha + webdriver.Key.RETURN + webdriver.Key.TAB)

            var btnDJ = await driver.wait(until.elementLocated(By.xpath('//*[@id="switch4"]')), 20000)
            await btnDJ.click()

            await esperarWeb()
            await sleep(1000)

            var btnFinalizar = await driver.wait(until.elementLocated(By.xpath('//*[@id="front001-servicios-minimos-frame-id"]/div/section/section/div/div/div[2]/form/div/div/div[9]/div[2]/button')), 20000)
            //await btnFinalizar.sendKeys(webdriver.Key.ENTER)
            await btnFinalizar.click()

            await esperarWeb()
            await sleep(1000)

            await driver.executeScript("document.getElementsByTagName('button')[document.getElementsByTagName('button').length-1].click();")

            await esperarWeb()
            await sleep(1000)
        }
    }
    await esperarWeb()


    var btnReg = await driver.wait(until.elementLocated(By.xpath('//*[@id="front001-servicios-minimos-frame-id"]/div/section/div[3]/div[1]/div[1]/div/div/button')), 20000)
    var retry = 0
    while (retry < 10) {
        retry++
        var displayed = await btnReg.isDisplayed()
        var enabled = await btnReg.isEnabled()
        if (enabled) {
            break
        }
    }
    await btnReg.sendKeys(webdriver.Key.ENTER)

    await esperarWeb()

}


async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

var getFechaTermino = async function (tipo) {
    var fecha = tipo.split('Plazo fijo (F.T.: ')[1].split(')')[0].split('-')
    var fechaOk = fecha[2] + '-' + fecha[1] + '-' + fecha[0]
    return fechaOk
}

var getIndiceJornada = async function (horas) {

    var t = [{ jornada: '10', pos: 36 },
    { jornada: '20', pos: 26 },
    { jornada: '30', pos: 16 },
    { jornada: '40', pos: 6 },
    { jornada: '45', pos: 1 }]

    var posicion = 0
    for (var i = 0; i < t.length; i++) {
        if (horas == t[i].jornada) {
            posicion = t[i].pos
            break
        }
    }

    return posicion

    
}

var getIndiceIsapre = async function (isapre) {
    var tisa =[{ isapre: 'Banmedica', pos: 2 },
        { isapre: 'Colmena', pos: 4 },
        { isapre: 'Consalud', pos: 5 },
        { isapre: 'Cruz Blanca', pos: 6 },
        { isapre: 'Fonasa', pos: 1 },
        { isapre: 'Nueva Masvida', pos: 10 }]

    var posicion = 0
    for (var i = 0; i < tisa.length; i++) {
        if (isapre == tisa[i].isapre) {
            posicion = tisa[i].pos
            break
        }
    }

    return posicion

}

var getIndiceAfp = async function (afp) {
    var tafp = [{ afp: 'Capital (AFP)', posicion: 8 },
    { afp: 'Cuprum (AFP)', posicion: 4 },
    { afp: 'Habitat (AFP)', posicion: 5 },
    { afp: 'Modelo (AFP)', posicion: 12 },
    { afp: 'No Cotiza', posicion: 13 },
    { afp: 'PlanVital (AFP)', posicion: 3 },
    { afp: 'ProVida (AFP)', posicion: 2 },
    { afp: 'Uno (AFP)', posicion: 6 }]

    var posicion=0
    for (var i=0; i<tafp.length; i++) {
        if (afp == tafp[i].afp) {
            posicion=tafp[i].posicion
            break
        }
    }

    return posicion
}

var getNacionalidad = async function (pais) {

    var paises = [
        'Argentina',
        'Brasil',
        'Chile',
        'Colombia',
        'Cuba',
        'Ecuador',
        'España',
        'Haití',
        'Paraguay',
        'Perú',
        'República Dominicana',
        'Venezuela'
    ]

    var nacionalidad = [
        'ARGENTINA',
        'BRASILEÑA',
        'CHILENA',
        'COLOMBIANA',
        'CUBANA',
        'ECUATORIANA',
        'ESPAÑOLA',
        'HAITIANA',
        'PARAGUAYA',
        'PERUANA',
        'DOMINICANA',
        'VENEZOLANA'
    ]

    var n=''
    if (paises.indexOf(pais) == -1) {
        n='CHILENA'
    } else {
        n = nacionalidad[paises.indexOf(pais)] 
    }

    return n
    
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


var vuelveAnteriores = async function () {
    try {
        await driver.navigate().refresh()

        var btnRegistrar = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div[2]/div/section/div[3]/div[1]/div/div/button')), 10000)
        await btnRegistrar.click()
        await esperarWeb();

        var iframe = await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div[2]/div/div/div/div/div/iframe')), 20000)
        await driver.switchTo().frame(iframe)

        var btnRegistroCto = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div[2]/div/section/div[3]/div[1]/div[1]/div/div/button')), 20000)
        await btnRegistroCto.click()
        await esperarWeb();

    } catch (error) {
        var iframe = await driver.wait(until.elementLocated(By.xpath('/html/body/div[1]/div[2]/div/div/div/div/div/iframe')), 20000)
        await driver.switchTo().frame(iframe)

        var btnRegistroCto = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div[2]/div/section/div[3]/div[1]/div[1]/div/div/button')), 20000)
        await btnRegistroCto.click()
        await esperarWeb();
    }
}

var leeEmpleados = async function () {
    return new Promise(async function (resolve, reject) {

        var sql = "";
        sql += "SELECT idEmpleado ,rut ,comuna ,fecha ,correoRepresentante"
        sql += "      ,correoEmpleado ,telefonoEmpleado ,region ,calle"
        sql += "      ,numero ,cargo ,regionPrestacion ,comunaPrestacion"
        sql += "      ,callePrestacion ,numeroPrestacion ,SueldoBase"
        sql += "      ,HaberesImponibles ,HaberesNoImponibles"
        sql += "      ,periodoPago ,formaPago ,anticipo"
        sql += "      ,afp ,salud ,tipoContrato ,jornada ,fechaInicio, nacionalidad"
        sql += "  FROM rpaEmpleados where rut not in (select rut from rpaEmpleadoIngresados)"
        sql += "                      and rut not in ('33499191-1','66600000-5','33574799-2')"

        //sql = "select * from rpaEmpleadosNoVigentes where rut = '26786833-6'"

        // var sql = "";
        // sql += "SELECT rut, comuna, fecha,correoRepresentante,correoEmpleado,telefonoEmpleado "
        // sql += "      ,region ,calle ,numero ,cargo ,regionPrestacion ,comunaPrestacion ,callePrestacion "
        // sql += "      ,numeroPrestacion ,SueldoBase ,HaberesImponibles ,HaberesNoImponibles ,periodoPago "
        // sql += "      ,formaPago ,anticipo ,afp ,salud ,tipoContrato ,jornada ,fechaInicio ,fechaFiniquito "
        // sql += "  FROM rpaEmpleadosNoVigentes "
        // sql += "  where convert(date, fechaFiniquito, 105) >= '2021-01-01' "
        // sql += "  and rut not in (select rut from rpaEmpleados) "
        // sql += "  and rut not in (select rut from rpaEmpleadoIngresados) "
        // sql += "group by rut, comuna, fecha,correoRepresentante,correoEmpleado,telefonoEmpleado "
        // sql += "      ,region ,calle ,numero ,cargo ,regionPrestacion ,comunaPrestacion ,callePrestacion "
        // sql += "      ,numeroPrestacion ,SueldoBase ,HaberesImponibles ,HaberesNoImponibles ,periodoPago "
        // sql += "      ,formaPago ,anticipo ,afp ,salud ,tipoContrato ,jornada ,fechaInicio ,fechaFiniquito "
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

var formateaFecha = function (dia, mes, año) {
    var diaOk = ""
    var mesOk = ""

    if (Number(dia) < 10) {
        diaOk = '0' + dia;
    } else {
        diaOk = dia;
    }

    var m = mes.substring(0, 3);
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


    return diaOk + '-' + mesOk + '-' + año;

}

var getNumMes = function (mes) {
    var mesOk = ''
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

var locateElement = async function (xpath) {
    var element
    var trys = 0
    while (trys < 50) {
        try {
            element = await driver.wait(until.elementLocated(By.xpath(xpath)), 500)
            break
        } catch (error) {
            trys++
        }
    }
    return element
}



exports.agendaRPAdtRoutes = router;
exports.reprogramaAgendaRPAdt = reprograma;