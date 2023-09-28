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
var rpaEmpleadosNoVigente = require("../models/rpaEmpleadosNoVigente");
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
    res.render("agendaRPAbuk/index", { data: data });
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
        aplicacion: 'RPAbuk', username: req.session.username,
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

    res.redirect("/agendaRPAbuk/index");
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
        .then(ok => { res.redirect("/agendaRPAbuk/index") })
        .catch(error=>{console.log(error.message)})
   
});

router.post("/indexApi", async function (req, res) {
    var bukPersona = require("../models/bukPersona")
    var bukArea = require("../models/bukArea");

    req.body.data.body = req.sanitize(req.body.data.body)
    var axios = require('axios')

    var dataPersonas = []

    var now = new Date().toISOString()
    var fecha = now.split('T')

    fecha[0] = "2022-06-01"


    // var resApi = await axios.get('https://qa-areaschile.buk.cl/api/v1/employees/active?date=' + fecha[0] + '&page=1', {
    //     headers: {
    //         'Accept': 'application/json',
    //         'auth_token': 'CcqJEsji5Tk4FQiTDUU6dJWh'
    //     }
    // })
    var resApi = await axios.get('https://qa-areaschile.buk.cl/api/v1/employees?page=1', {
        headers: {
            'Accept': 'application/json',
            'auth_token': 'CcqJEsji5Tk4FQiTDUU6dJWh'
        }
    })

    // for (d in resApi.data.data){
    //     var r = {rut: d.rut, nombre: d.full_name, id: d.id}
    //     dataPersonas.push(r)
    // }

    for (var i = 0; i < resApi.data.data.length; i++) {

        var r = { 
            idBuk: resApi.data.data[i].id,
            full_name: resApi.data.data[i].full_name,
            rut: resApi.data.data[i].rut,
            address: resApi.data.data[i].address,
            gender: resApi.data.data[i].gender,
            birthday: resApi.data.data[i].birthday,
            active_since: resApi.data.data[i].active_since,
            status: resApi.data.data[i].status,
            weekly_hours: resApi.data.data[i].current_job.weekly_hours,
            AreaId: resApi.data.data[i].current_job.area_id,
            Name: resApi.data.data[i].current_job.role.name
        }
        dataPersonas.push(r)

        const data = await bukPersona.findOne({ where: { idBuk: r.idBuk } })
        if (data === null) {
            await bukPersona.create(r)
        } else {
            await bukPersona.update(r, { where: { idBuk: r.idBuk } })
        }        

        
    }

    var next = resApi.data.pagination.next
    while (next) {
        resApi = await axios.get(next, {
            headers: {
                'Accept': 'application/json',
                'auth_token': 'CcqJEsji5Tk4FQiTDUU6dJWh'
            }
        })
        next = resApi.data.pagination.next

        for (var i = 0; i < resApi.data.data.length; i++) {

            var r = {
                idBuk: resApi.data.data[i].id,
                full_name: resApi.data.data[i].full_name,
                rut: resApi.data.data[i].rut,
                address: resApi.data.data[i].address,
                gender: resApi.data.data[i].gender,
                birthday: resApi.data.data[i].birthday,
                active_since: resApi.data.data[i].active_since,
                status: resApi.data.data[i].status,
                weekly_hours: resApi.data.data[i].current_job.weekly_hours,
                AreaId: resApi.data.data[i].current_job.area_id,
                Name: resApi.data.data[i].current_job.role.name
            }
            dataPersonas.push(r)
            const data = await bukPersona.findOne({ where: { idBuk: r.idBuk } })
            if (data === null) {
                await bukPersona.create(r)
            } else {
                await bukPersona.update(r, { where: { idBuk: r.idBuk } })
            }        
        }
    }

    //---Areas

    var dataAreas = []

    var resApi = await axios.get('https://qa-areaschile.buk.cl/api/v1/chile/areas?status=both', {
        headers: {
            'Accept': 'application/json',
            'auth_token': 'CcqJEsji5Tk4FQiTDUU6dJWh'
        }
    })
    for (var i = 0; i < resApi.data.data.length; i++) {
        var r = {
            idBuk: resApi.data.data[i].id,
            nombre: resApi.data.data[i].name,
            centroCostos: resApi.data.data[i].cost_center,
            nombreDivision: resApi.data.data[i].department.division.name
        }
        dataAreas.push(r)
        const data = await bukArea.findOne({ where: { idBuk: r.idBuk } })
        if (data === null) {
            await bukArea.create(r)
        } else {
            await bukArea.update(r, { where: { idBuk: r.idBuk } })
        }        
    }

    var next = resApi.data.pagination.next
    while (next) {
        resApi = await axios.get(next, {
            headers: {
                'Accept': 'application/json',
                'auth_token': 'CcqJEsji5Tk4FQiTDUU6dJWh'
            }
        })
        next = resApi.data.pagination.next

        for (var i = 0; i < resApi.data.data.length; i++) {
            var r = {
                idBuk: resApi.data.data[i].id,
                nombre: resApi.data.data[i].name,
                centroCostos: resApi.data.data[i].cost_center,
                nombreDivision: resApi.data.data[i].department.division.name
            }
            dataAreas.push(r)
            const data = await bukArea.findOne({ where: { idBuk: r.idBuk } })
            if (data === null) {
                await bukArea.create(r)
            } else {
                await bukArea.update(r, { where: { idBuk: r.idBuk } })
            }
        }
    }




    console.log("ok? " + dataPersonas.length)
})


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
        logText = "Iniciando RPA extrae contratos vigentes desde BUK " + now + "\n";
        logText += "Accediendo al sitio " + urlbuk + "\n";

        await driver.get(urlbuk);
        await esperarWeb();


        //var usuario = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/div[2]/form/div[1]/div/div/div/input')), 60000);
        var usuario = await driver.wait(until.elementLocated(By.xpath('//*[@id="user_email"]')), 60000);        
        await usuario.sendKeys(usernamebuk + webdriver.Key.TAB);

        var t = await usuario.getAttribute("value");

        //var btnsubmit = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/form/div[2]/input")), 60000); 
        var btnsubmit = await driver.wait(until.elementLocated(By.xpath('//*[@id="login-form"]/input[3]')), 60000); 
        await btnsubmit.click()
        while (noDisponible) {
            if (await btnsubmit.isDisplayed()) {
                noDisponible = false;
            }
        }

        await esperarWeb();

        //var password = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/div[2]/form/div[1]/div[2]/div/div/input')), 60000);
        var password = await driver.wait(until.elementLocated(By.xpath('//*[@id="user_password"]')), 60000);
        await password.sendKeys(passwordbuk + webdriver.Key.TAB);

        logText += "Conectando usuario " + usernamebuk + "\n";


        //var btnsubmit = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/div[2]/form/div[2]/input')), 60000);
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
        
        if (extrae==1){
            await driver.get(URLEMPRESA + '/employees?filter_query_id=1');
        }else{
            await driver.get(URLEMPRESA + '/employees?filter_query_id=2');
        }
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

        var W3 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/header/nav/div/ul/li[1]/a/span")), 20000);
        var mesProceso = await W3.getText()
        var mesProceso = mesProceso.split(' ')
        var añoProceso = mesProceso[1]
        var mes = getNumMes(mesProceso[0])
        var periodoProceso = mes + '-' + añoProceso

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
                try {
                    var href = columnas[1].innerHTML
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

        logText += "Buscando contratos nuevos" + "\n";
        var i = 0
        while (i < tEmpleados.length){
            await ProcesaRegistraEmpleado(tEmpleados[i], periodoProceso, extrae)
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

var yaCargado = async function (rut) {
    var empleado = await rpaEmpleadoIngresado.findOne({ where: { rut: rut } })
    return !(empleado == null)
}

var ProcesaRegistraEmpleado = async function (url, periodoProceso, extrae) {

    var retry=0
    var rut=''
    while (retry<20) {
        try {
            await driver.get(url);
            await esperarWeb();
            //var WebElement1 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[1]/div[1]/div/ul/li[1]/span")), 1000);
            var WebElement1 = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/section/div/div[1]/div/div/div[2]/div[1]/div[2]/div/ul/div[1]/div[2]')), 1000)

            rut = await WebElement1.getText()
            rut = rut.split('.').join('')
            break
        } catch (error) {
            retry++
        }
    }

    var causal
    if (extrae != 1) {
        var WebCausal = await driver.wait(until.elementLocated(By.xpath('//*[@id="resumen"]/div[1]/div[1]/table/tbody/tr[13]/td[2]/a')), 20000);
        causal = await WebCausal.getText()
    }

    console.log(" rut " + rut )
    if (!(await yaCargado(rut))) {
        
        console.log("Ingresando rut " + rut)
        logText += "Ingresando rut " + rut + "\n";

        var WebElement2 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[2]/div/div/div[2]/div[1]/div/div[2]/div[1]/table/tbody/tr[11]/td[2]")), 20000);
        var fechaIngreso = await WebElement2.getText()
        var tfecha = fechaIngreso.split(" ")
        var dia = tfecha[0]
        var mesp = tfecha[2]
        var año = tfecha[4]
        var fechaContrato = formateaFecha(dia, mesp, año)

        var fechaFiniquito = '01-01-1900'
        var mesFiniquito = '01-1900'
        if (extrae != 1) {
            var WebElement3 = await driver.wait(until.elementLocated(By.xpath('//*[@id="resumen"]/div[1]/div[1]/table/tbody/tr[12]/td[2]')), 20000);
            var fechaSalida = await WebElement3.getText()
            var tfecha = fechaSalida.split(" ")
            var dia = tfecha[0]
            var mesp = tfecha[2]
            var año = tfecha[4]
            fechaFiniquito = formateaFecha(dia, mesp, año)
            tfecha = fechaFiniquito.split('-')
            mesFiniquito = tfecha[1] + '-' + tfecha[2]
        }

        var WebElement4 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[1]/div/div/div[2]/div[2]/div[2]/div/ul/div[1]/div[2]")), 20000);
        var prevision = await WebElement4.getText()
        if (prevision == '') {
            var WebElement5 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[1]/div[2]/div[2]/p[1]")), 20000);
            prevision = await WebElement5.getAttribute("innerHTML")
            prevision = prevision.split('\n').join('')
            prevision = prevision.split('<br>')
            prevision[0] = prevision[0].trim()
            prevision[1] = prevision[1].trim()
        } else {
            prevision = prevision.split('\n')
        }

        var isapre = prevision[0]
        var afp = prevision[1]

        var comunaContrato = 'PUDAHUEL'
        var correoRepresentante = 'alejandra.canales@areas.com'



        var W10 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[2]/div/div/div[2]/div[1]/div/div[2]/div[1]/table/tbody/tr[1]/td[2]/a")), 20000);
        var cargo = await W10.getText()

        var W11 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[2]/div/div/div[2]/div[1]/div/div[2]/div[1]/table/tbody/tr[8]/td[2]")), 20000);
        var sueldo = await W11.getText()
        var Tsueldo = sueldo.split(" ")
        var sueldo = Tsueldo[1].split('.').join('')

        var W12 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[2]/div/div/div[2]/div[1]/div/div[2]/div[1]/table/tbody/tr[9]/td[2]")), 20000);
        var tipoContrato = await W12.getText()

        var W13 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[2]/div/div/div[2]/div[1]/div/div[2]/div[1]/table/tbody/tr[10]/td[2]")), 20000);
        var jornada = await W13.getText()

        //Haberes
        // var WebElement14 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[2]/div/div/div[1]/ul/li[6]/a")), 20000);
        // await WebElement14.click()
        // await esperarWeb()

        // var WebElement15 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[2]/div/div/div[1]/ul/li[6]/div/a[1]")), 20000);
        // await WebElement15.click()
        // await esperarWeb()


        //box-body
        var THaberes = []
        var THaberesImponibles = []
        var THaberesNoImponibles = []
        // var WebElement = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[2]/div/div/div[2]/div[8]/div/div[1]/div[2]/div/table/tbody")), 20000);
        // var tbodyHtml = await WebElement.getAttribute("innerHTML")
        // var dom = await parser.parseFromString(tbodyHtml)
        // var filas = await dom.getElementsByTagName("tr")
        // for await (const linea of filas) {
        //     var columnas = await linea.getElementsByTagName("td")
        //     var vigente = columnas[6].textContent.split('\n ').join('')
        //     if (extrae==1) {
        //         if (vigente == 'Sin Término' || vigente == periodoProceso) {
        //             var f = columnas[0].textContent.split('\n ').join('')
        //             var imponible = f.search('Asig') == -1
        //             var haber = {
        //                 formula: f,
        //                 valor: columnas[3].textContent.replace('$', '').replace('.', '').replace(' ', '').split('.').join(''),
        //             }
        //             THaberes.push(haber)
        //             if (imponible) {
        //                 THaberesImponibles.push(haber)
        //             } else {
        //                 THaberesNoImponibles.push(haber)
        //             }
        //         } 
        //     } else {
        //         if (vigente == 'Sin Término' || vigente == mesFiniquito) {
        //             var f = columnas[0].textContent.split('\n ').join('')
        //             var imponible = f.search('Asig') == -1
        //             var haber = {
        //                 formula: f,
        //                 valor: columnas[3].textContent.replace('$', '').replace('.', '').replace(' ', '').split('.').join(''),
        //             }
        //             THaberes.push(haber)
        //             if (imponible) {
        //                 THaberesImponibles.push(haber)
        //             } else {
        //                 THaberesNoImponibles.push(haber)
        //             }
        //         } 
        //     }
        // }

        var HaberesImponibles = JSON.stringify(THaberesImponibles)
        var HaberesNoImponibles = JSON.stringify(THaberesNoImponibles)

        //lápiz
        var WebElement16 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[1]/div/div/div[1]/span[3]/div/div/button/i")), 20000);
        await WebElement16.click()
        await esperarWeb()

        //personal
        var WebElement17 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[1]/div/div/div[1]/span[3]/div/div/div/a[1]")), 20000);
        await WebElement17.click()
        await esperarWeb()



        await driver.switchTo().defaultContent();

        esperarWeb();

        var correoW = await driver.wait(until.elementLocated(By.xpath('//*[@id="person_email_personal"]')), 20000);
        var correo = await correoW.getAttribute("value");

        var comunaW = await driver.wait(until.elementLocated(By.xpath('/html/body/div[2]/div/div/div[2]/form/div/div[2]/div[6]/div[1]/div/div/div[1]/div[1]')), 20000);
        var comunaH = await comunaW.getAttribute("innerHTML")
        var comunaT = comunaH.split('<div class=\"vue-treeselect__single-value\">')
        var comunaT = comunaT[1].split('</div><div class=\"vue-treeselect__placeholder vue-treeselect-helper-zoom-effect-off')
        var comuna = comunaT[0].toUpperCase()

        var W17 = await driver.wait(until.elementLocated(By.xpath('//*[@id="person_direccion"]')), 20000);
        var direccion = await W17.getAttribute("value");

        var W18 = await driver.wait(until.elementLocated(By.xpath('//*[@id="select2-payment_detail_payment_method-container"]')), 20000);
        var formapago = await W18.getAttribute("innerHTML");

        var W19 = await driver.wait(until.elementLocated(By.xpath('//*[@id="select2-person_codigo_pais-container"]')), 20000);
        var nacionalidad = await W19.getAttribute("title");

        var W20 = await driver.wait(until.elementLocated(By.xpath('//*[@id="person_celular"]')), 20000);
        var telefonoEmpleado = await W20.getAttribute("value");


        var empleado = {
            rut: rut,
            comuna: comunaContrato,
            fecha: fechaContrato,
            correoRepresentante: correoRepresentante,
            correoEmpleado: correo,
            telefonoEmpleado: telefonoEmpleado,
            region: 'RM',
            comuna: comuna,
            calle: direccion,
            numero: direccion,
            cargo: cargo,
            regionPrestacion: 'RM',
            comunaPrestacion: 'PUDAHUEL',
            callePrestacion: 'Jean Mermoz',
            numeroPrestacion: '2150',
            SueldoBase: sueldo,
            HaberesImponibles: HaberesImponibles,
            HaberesNoImponibles: HaberesNoImponibles,
            periodoPago: 'mensual',
            formaPago: formapago,
            anticipo: 'no',
            afp: afp,
            salud: isapre,
            tipoContrato: tipoContrato,
            jornada: jornada,
            fechaInicio: fechaContrato,
            fechaFiniquito: fechaFiniquito,
            nacionalidad: nacionalidad
        }

        if (extrae == 1) {
            await registraEmpleado(empleado)
        } else {
            await registraEmpleadoNoVigente(empleado)
        }


        await driver.navigate().back()
        await esperarWeb();
    }

    
}

var procesaPaginaDatos = async function (meses) {
    return new Promise(async function (resolve, reject) {
        console.log("Ingresa Rangos de Fecha.")
        logText += "Ingresa Rangos de Fecha" + "\n";

        await esperarWeb();

        await driver.get(URLEMPRESA + '/employees?filter_query_id=1');

        await esperarWeb();

        var W = await driver.wait(until.elementLocated(By.xpath("/html/body/div/header/nav/div/ul/li[1]/a/span")), 20000);
        var mesProceso = await W.getText()
        var mesProceso = mesProceso.split(' ')
        var añoProceso = mesProceso[1]
        var mes = getNumMes(mesProceso[0])
        var periodoProceso = mes + '-' + añoProceso


        var tpaginas = await driver.wait(until.elementsLocated(By.xpath('/html/body/div/div/section/div/div/div[3]/div[2]/div/div[3]/div[2]/div/ul/li')), 20000)
        await tpaginas[1].click
        await esperarWeb();

        console.log(tpaginas.length)

        var pagina = 1
        var finPaginas = false

        while (!finPaginas) {
            logText += "Procesando página " + pagina + "\n";

            console.log("Procesando página " + pagina)

            var tabla = []
            var TlineaHTML = []
            var idx = 0
            await driver.wait(until.elementsLocated(By.xpath('/html/body/div/div/section/div/div/div[3]/div[2]/div/div[2]/div/table/tbody/tr')), 20000)
            .then(async tabla => {
                for await (const linea of tabla) {
 //                   console.log(idx)
                    var attempts = 0;
                    while (attempts < 5) {
                        try {
                            await TlineaHTML.push(await tabla[idx].getAttribute("innerHTML"))
                            break
                        } catch (error) {
                            tabla = await driver.wait(until.elementsLocated(By.xpath('/html/body/div/div/section/div/div/div[3]/div[2]/div/div[2]/div/table/tbody/tr')), 20000)
//                            console.log("retry")
                        }
                        attempts++
                    }
                    idx++
                }      
            })


            
            var tablaHref = []
            var idx = 0
            for await (const linea of TlineaHTML) {
                //var btnPersona = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div/div[3]/div[2]/div/div[2]/div/table/tbody/tr[" + indLinea + "]/td[2]/a")), 20000);
                
                var lineaHTML = TlineaHTML[idx]
                var dom = parser.parseFromString(lineaHTML)
                var columnas = dom.getElementsByTagName("td")
                var href = columnas[1].innerHTML

                var dom = parser.parseFromString(href)
                var anker = dom.getElementsByTagName("a")
                var href = URLEMPRESA+anker[0].attributes[7].value

                if (href != 'https://qa-areaschile.buk.cl/employees/1039') {
                    tablaHref.push(href)
                    idx++
                }
            }

            //procesa tabla
            var indLinea = 0
            for await (const hreflinea of tablaHref) {


                await driver.get(hreflinea);
               
                await esperarWeb();

                var WebElement = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[1]/div[1]/div/ul/li[1]/span")), 20000);
                var rut = await WebElement.getText()
                rut=rut.split('.').join('')

                console.log("linea " + indLinea++ + " rut " + rut + " pagina " + pagina)

                var WebElement = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[2]/div/div/div[2]/div[1]/div[1]/div[1]/table/tbody/tr[11]/td[2]")), 20000);
                var fechaIngreso = await WebElement.getText()
                var tfecha = fechaIngreso.split(" ")
                var dia = tfecha[0]
                var mesp = tfecha[2]
                var año = tfecha[4]
                var fechaContrato = formateaFecha(dia, mesp, año)

                var WebElement = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[1]/div[2]/div[2]/p[1]")), 20000);
                var prevision = await WebElement.getText()
                if (prevision=='') {
                    var WebElement2 = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div[2]/div[1]/div[2]/div[2]/p[1]")), 20000);
                    prevision = await WebElement2.getAttribute("innerHTML")
                    prevision = prevision.split('\n').join('')
                    prevision = prevision.split('<br>')
                    prevision[0]=prevision[0].trim()
                    prevision[1]=prevision[1].trim()
                } else {
                    prevision = prevision.split('\n')
                }

                var isapre = prevision[0]
                var afp = prevision[1]

                var comunaContrato = 'PUDAHUEL'
                var correoRepresentante = 'alejandra.canales@areas.com'



                var W = await driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div/section/div/div[2]/div/div/div[2]/div[1]/div[1]/div[1]/table/tbody/tr[1]/td[2]/a")), 20000);
                var cargo = await W.getText()

                var W = await driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div/section/div/div[2]/div/div/div[2]/div[1]/div[1]/div[1]/table/tbody/tr[8]/td[2]")), 20000);
                var sueldo = await W.getText()
                var Tsueldo = sueldo.split(" ")
                var sueldo = Tsueldo[1].split('.').join('')

                var W = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[2]/div/div/div[2]/div[1]/div[1]/div[1]/table/tbody/tr[9]/td[2]")), 20000);
                var tipoContrato = await W.getText()

                var W = await driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div/section/div/div[2]/div/div/div[2]/div[1]/div[1]/div[1]/table/tbody/tr[10]/td[2]")), 20000);
                var jornada = await W.getText()

                //Haberes
                var WebElement = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[2]/div/div/div[1]/ul/li[6]/a")), 20000);
                await WebElement.click()
                await esperarWeb()

                var WebElement = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[2]/div/div/div[1]/ul/li[6]/div/a[1]")), 20000);
                await WebElement.click()
                await esperarWeb()


                //box-body
                var THaberes = []
                var THaberesImponibles = []
                var THaberesNoImponibles = []
                var WebElement = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/section/div/div[2]/div/div/div[2]/div[8]/div/div[1]/div[2]/div/table/tbody")), 20000);
                var tbodyHtml = await WebElement.getAttribute("innerHTML")
                var dom = await parser.parseFromString(tbodyHtml)
                var filas = await dom.getElementsByTagName("tr")
                for await (const linea of filas) {
                    var columnas = await linea.getElementsByTagName("td")
                    var vigente = columnas[6].textContent.split('\n ').join('')
                    if (vigente == 'Sin Término' || vigente == periodoProceso){
                        var f = columnas[0].textContent.split('\n ').join('')
                        var imponible = f.search('Asig') == -1   
                        var haber = {
                            formula: f,
                            valor: columnas[3].textContent.replace('$', '').replace('.', '').replace(' ', '').split('.').join(''),
                        }
                        THaberes.push(haber)
                        if (imponible) {
                           THaberesImponibles.push(haber) 
                        } else {
                           THaberesNoImponibles.push(haber) 
                        }
                    }
                }

                var HaberesImponibles = JSON.stringify(THaberesImponibles)
                var HaberesNoImponibles = JSON.stringify(THaberesNoImponibles)

                //lápiz
                var WebElement = await driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div/section/div/div[1]/div[1]/div/span[3]/div/div/button/i")), 20000);
                await WebElement.click()
                await esperarWeb()

                //personal
                var WebElement = await driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div/section/div/div[1]/div[1]/div/span[3]/div/div/div/a[1]")), 20000);
                await WebElement.click()
                await esperarWeb()



                await driver.switchTo().defaultContent();

                esperarWeb();
                
                var correoW = await driver.wait(until.elementLocated(By.xpath('//*[@id="person_email_personal"]')), 20000);
                var correo = await correoW.getAttribute("value");

                var comunaW = await driver.wait(until.elementLocated(By.xpath('/html/body/div[2]/div/div/div[2]/form/div/div[2]/div[6]/div[1]/div/div/div[1]/div[1]')), 20000);
                var comunaH = await comunaW.getAttribute("innerHTML")
                var comunaT = comunaH.split('<div class=\"vue-treeselect__single-value\">')
                var comunaT = comunaT[1].split('</div><div class=\"vue-treeselect__placeholder vue-treeselect-helper-zoom-effect-off')
                var comuna = comunaT[0].toUpperCase() 

                var W = await driver.wait(until.elementLocated(By.xpath('//*[@id="person_direccion"]')), 20000);
                var direccion = await W.getAttribute("value");

                var W = await driver.wait(until.elementLocated(By.xpath('//*[@id="select2-payment_detail_payment_method-container"]')), 20000);
                var formapago = await W.getAttribute("innerHTML");

                var W = await driver.wait(until.elementLocated(By.xpath('//*[@id="select2-person_codigo_pais-container"]')), 20000);
                var nacionalidad = await W.getAttribute("title");

                var W = await driver.wait(until.elementLocated(By.xpath('//*[@id="person_celular"]')), 20000);
                var telefonoEmpleado = await W.getAttribute("value");


                var empleado = {
                    rut: rut,
                    comuna: comunaContrato,
                    fecha: fechaContrato,
                    correoRepresentante: correoRepresentante,
                    correoEmpleado: correo,
                    telefonoEmpleado: telefonoEmpleado,
                    region: 'RM',
                    comuna: comuna,
                    calle: direccion,
                    numero: direccion,
                    cargo: cargo,
                    regionPrestacion: 'RM',
                    comunaPrestacion: 'PUDAHUEL',
                    callePrestacion: 'Jean Mermoz',
                    numeroPrestacion: '2150',
                    SueldoBase: sueldo,
                    HaberesImponibles: HaberesImponibles,
                    HaberesNoImponibles: HaberesNoImponibles,
                    periodoPago: 'mensual',
                    formaPago: formapago,
                    anticipo: 'no',
                    afp: afp,
                    salud: isapre,
                    tipoContrato: tipoContrato,
                    jornada: jornada,
                    fechaInicio: fechaContrato
                }

                await registraEmpleado(empleado)

                await driver.navigate().back()
                await esperarWeb();

                //console.log("cierra modal")

            }

            var tablaBotonera = await driver.wait(until.elementsLocated(By.xpath('/html/body/div/div/section/div/div/div[3]/div[2]/div/div[3]/div[2]/div/ul/li')), 20000)
            var indiceUltimoBoton = tablaBotonera.length

            pagina++
            var bpag = await driver.wait(until.elementLocated(By.xpath('/html/body/div/div/section/div/div/div[3]/div[2]/div/div[3]/div[2]/div/ul/li['+pagina+']/a')), 20000)
            try {
                await bpag.click();
                await esperarWeb();
            }
            catch (err) {
                finPaginas=true;
            }
            
        }
        await driver.quit();
        logText += "Fin Procesamiento Notaria " + nombreNotariaActual + "\n";
        getTotales(idNotariaActual)
            .then(d => {
                logText += "-------------- Totales Procesados ------------------------------------------" + "\n"
                logText += "Total Repertorios descargados : " + d.totalRepertorios + "\n"
                logText += "Total Detalles descargados : " + d.totalDetalles + "\n"
                logText += "----------------------------------------------------------------------------" + "\n\n\n"

                enviaCorreo(supervisoresRobot, "Reporte de procesamiento para robot de notarías", logText)
                    .then(r => {
                        resolve("ok lineas");
                    })
                    .catch(err => {
                        reject(err);
                    })
            })
            .catch(err => {
                console.log(err)
                reject(err)
            });

    })
}

var getPaginaActiva = async function () {
    var tablaBoton = await driver.wait(until.elementsLocated(By.xpath('/html/body/div/div/section/div/div/div[3]/div[2]/div/div[3]/div[2]/div/ul/li')), 20000)
    var contPag = 0
    for await (const linea of tablaBoton) {
        contPag++
        var li = await linea.getAttribute("class")
        var p = li.search("active")
        if (p != -1) {
            paginaActiva = contPag - 1
            return paginaActiva
        }
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

var idRepertorioNew = 0;

var registraEmpleado = async function (dataEmpleado) {
    var dataEmp = await rpaEmpleado.findAll({
        where: {
            rut: dataEmpleado.rut
        }
    })

    const t = await sequelize.transaction();
    if (dataEmp.length > 0) {
        await rpaEmpleado.update(dataEmpleado, { where: { idEmpleado: dataEmp[0].idEmpleado } })
            .catch(error => {
                console.log(error)
            })
    } else {
        var resultado = await rpaEmpleado.create(dataEmpleado)
            .catch(error => {
                console.log(error)
            })
    }
    await t.commit();

}

var registraEmpleadoNoVigente = async function (dataEmpleado) {
    var dataEmp = await rpaEmpleadosNoVigente.findAll({
        where: {
            rut: dataEmpleado.rut
        }
    })

    const t = await sequelize.transaction();
    if (dataEmp.length > 0) {
        await rpaEmpleadosNoVigente.update(dataEmpleado, { where: { idEmpleado: dataEmp[0].idEmpleado } })
            .catch(error => {
                console.log(error)
            })
    } else {
        var resultado = await rpaEmpleadosNoVigente.create(dataEmpleado)
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


    return diaOk+'-'+mesOk+'-'+año;
  
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


exports.agendaRPAbukRoutes = router;
exports.reprogramaAgendaRPAbuk = reprograma;