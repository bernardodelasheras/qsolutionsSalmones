const { promiseImpl } = require("ejs");
var express = require("express");
const cron = require('node-cron');
var moment = require("moment");
var nodemailer = require('nodemailer');
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
var sequelize = require('../models/sequelizeConnection');
var task = require('../models/task');
var sequelize = require('../models/sequelizeConnection');
const periodos = require("../models/periodos");
const cargo = require("../models/cargo");

var axios = require('axios')

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
    res.render("agendaAPILiquidacion/index", { data: data });
});

router.post("/index", async function (req, res) {
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
    var job = cron.schedule(cronTime, async function () {
        console.log('Inicio Ejecución Programada RPA ' + req.body.data.hora + ':' + req.body.data.minuto + '/' + diaCron);
        await procesaConsulta(req, res, taskdata);
    }, {
        scheduled: true,
        timezone: timeZone
    });
    var item = {
        aplicacion: 'APILiquidacion', username: req.session.username,
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
    req.flash("success", "Proceso de API agendado")
    res.redirect("/agendaAPILiquidacion/index");
});

router.post("/indexApi", async function (req, res) {
    var taskdata = {}
    await procesaConsulta(req, res, taskdata)
    req.flash("success", "Proceso de API Terminado")
    res.redirect("/agendaAPILiquidacion/index")
})

var procesaConsulta = async function (req, res, taskdata) {
    data = await leePeriodos().catch(err => { console.log(err) })
    for (var i = 0; i < data.length; i++) {
        await procesaConsultaMes(req, res, taskdata, data[i].periodo)    
    }
}

var procesaConsultaMes = async function (req, res, taskdata, periodo) {

    await borraDataLiquidacion(periodo)
    await getDataFromAPILiquidacion(periodo)

    await borraDataHorasNoTrabajadas(periodo)
    await getDataFromAPIHorasNoTrabajadas(periodo)

    await borraDataAusencias(periodo)
    await getDataFromAPIAusencias(periodo)

    await borraDataLicencias(periodo)
    await getDataFromAPILicencias(periodo)

    await borraDataVacaciones(periodo)
    await getDataFromAPIVacaciones(periodo)

}


var getDataFromAPILiquidacion = async function (periodo) {
    var fechaProceso = await getFecha(periodo)

    var bukLiquidacion = require("../models/bukLiquidacion")

    //req.body.data.body = req.sanitize(req.body.data.body)
    

    var dataMov = []

    var now = new Date().toISOString()
    var fecha = now.split('T')


    var resApi = await axios.get('https://qa-areaschile.buk.cl/api/v1/chile/payroll_detail/month?date='+fechaProceso+'&page=1&page_size=100', {
        headers: {
            'Accept': 'application/json',
            'auth_token': 'CcqJEsji5Tk4FQiTDUU6dJWh'
        }
    })

    console.log('https://qa-areaschile.buk.cl/api/v1/chile/payroll_detail/month?date='+fechaProceso+'&page=1&page_size=100')
    for (var i = 0; i < resApi.data.data.length; i++) {
        console.log(resApi.data.data[i].rut)
        var lineas = resApi.data.data[i].lines_settlement
        for (var j = 0; j < lineas.length; j++) {
            var r = {
                liquidacion_id: resApi.data.data[i].liquidacion_id,
                person_id: resApi.data.data[i].person_id,
                employee_id: resApi.data.data[i].employee_id,
                rut: resApi.data.data[i].rut,
                month: resApi.data.data[i].month,
                year: resApi.data.data[i].year,
                worked_days: resApi.data.data[i].worked_days,
                noworked_days: resApi.data.data[i].noworked_days,
                income_gross: resApi.data.data[i].income_gross,
                income_net: resApi.data.data[i].income_net,
                income_afp: resApi.data.data[i].income_afp,
                income_ips: resApi.data.data[i].income_ips,
                total_income_taxable: resApi.data.data[i].total_income_taxable,
                total_income_notaxable: resApi.data.data[i].total_income_notaxable,
                total_legal_discounts: resApi.data.data[i].total_legal_discounts,
                total_other_discounts: resApi.data.data[i].total_other_discounts,
                closed: resApi.data.data[i].closed,
                type: lineas[j].type,
                income_type: lineas[j].income_type,
                subtype: lineas[j].subtype,
                name: lineas[j].name,
                amount: lineas[j].amount,
                resettlement : lineas[j].resettlement,
                taxable : lineas[j].taxable,
                imponible : lineas[j].imponible,
                anticipo : lineas[j].anticipo,
                credit_type : lineas[j].credit_type,
                institution : lineas[j].institution,
                description : lineas[j].description,
                code :  lineas[j].code ,
                item_code : lineas[j].item_code                
            }
            dataMov.push(r)
            await bukLiquidacion.create(r)
        }
    }

    var next = resApi.data.pagination.next
    while (next) {
        console.log(next)
        resApi = await axios.get(next, {
            headers: {
                'Accept': 'application/json',
                'auth_token': 'CcqJEsji5Tk4FQiTDUU6dJWh'
            }
        })
        next = resApi.data.pagination.next
        

        for (var i = 0; i < resApi.data.data.length; i++) {
            console.log(resApi.data.data[i].rut)
            var lineas = resApi.data.data[i].lines_settlement
            for (var j = 0; j < lineas.length; j++) {
                var r = {
                    liquidacion_id: resApi.data.data[i].liquidacion_id,
                    person_id: resApi.data.data[i].person_id,
                    employee_id: resApi.data.data[i].employee_id,
                    rut: resApi.data.data[i].rut,
                    month: resApi.data.data[i].month,
                    year: resApi.data.data[i].year,
                    worked_days: resApi.data.data[i].worked_days,
                    noworked_days: resApi.data.data[i].noworked_days,
                    income_gross: resApi.data.data[i].income_gross,
                    income_net: resApi.data.data[i].income_net,
                    income_afp: resApi.data.data[i].income_afp,
                    income_ips: resApi.data.data[i].income_ips,
                    total_income_taxable: resApi.data.data[i].total_income_taxable,
                    total_income_notaxable: resApi.data.data[i].total_income_notaxable,
                    total_legal_discounts: resApi.data.data[i].total_legal_discounts,
                    total_other_discounts: resApi.data.data[i].total_other_discounts,
                    closed: resApi.data.data[i].closed,
                    type: lineas[j].type,
                    income_type: lineas[j].income_type,
                    subtype: lineas[j].subtype,
                    name: lineas[j].name,
                    amount: lineas[j].amount,
                    resettlement : lineas[j].resettlement,
                    taxable : lineas[j].taxable,
                    imponible : lineas[j].imponible,
                    anticipo : lineas[j].anticipo,
                    credit_type : lineas[j].credit_type,
                    institution : lineas[j].institution,
                    description : lineas[j].description,
                    code :  lineas[j].code ,
                    item_code : lineas[j].item_code                
                }
                dataMov.push(r)
                await bukLiquidacion.create(r)
            }
        }
    }
}

var getDataFromAPIHorasNoTrabajadas = async function (periodo) {
    finicial = await getFechaYMD1(periodo)
    ffinal = await getFechaYMD(periodo)

    const bukHorasNoTrabajadas = require("../models/bukHorasNoTrabajadas");
    var resApi = await axios.get('https://qa-areaschile.buk.cl/api/v1/chile/attendances/non-worked-hours?from='+finicial+'&page_size=100&to='+ffinal, {
        headers: {
            'Accept': 'application/json',
            'auth_token': 'CcqJEsji5Tk4FQiTDUU6dJWh'
        }
    })
    console.log('https://qa-areaschile.buk.cl/api/v1/chile/attendances/non-worked-hours?from='+finicial+'&page_size=100&to='+ffinal)

    for (var i = 0; i < resApi.data.data.length; i++) {
        var r = {
            idBuk: resApi.data.data[i].id,
            month: resApi.data.data[i].month,
            year: resApi.data.data[i].year,
            hours: resApi.data.data[i].hours,
            employee_id: resApi.data.data[i].employee_id,
            type_id: resApi.data.data[i].type_id,
            periodo: periodo
        }
        await bukHorasNoTrabajadas.create(r)
    }

    var next = resApi.data.pagination.next
    while (next) {
        console.log(next)
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
                month: resApi.data.data[i].month,
                year: resApi.data.data[i].year,
                hours: resApi.data.data[i].hours,
                employee_id: resApi.data.data[i].employee_id,
                type_id: resApi.data.data[i].type_id,
                periodo: periodo
            }
            await bukHorasNoTrabajadas.create(r)
        }
    }
   
}

var getDataFromAPIAusencias = async function (periodo) {

    finicial = await getFechaYMD1(periodo)
    ffinal = await getFechaYMD(periodo)

    const bukAusencias = require("../models/bukAusencias");
    var resApi = await axios.get('https://qa-areaschile.buk.cl/api/v1/chile/absences/absence?from='+finicial+'&page_size=100&to='+ffinal, {
        headers: {
            'Accept': 'application/json',
            'auth_token': 'CcqJEsji5Tk4FQiTDUU6dJWh'
        }
    })

    console.log('https://qa-areaschile.buk.cl/api/v1/chile/absences/absence?from='+finicial+'&page_size=100&to='+ffinal)

    for (var i = 0; i < resApi.data.data.length; i++) {
        var r = {
            idBuk: resApi.data.data[i].id,
            start_date: resApi.data.data[i].start_date,
            end_date: resApi.data.data[i].end_date,
            days_count: resApi.data.data[i].days_count,
            day_percent: resApi.data.data[i].day_percent,
            workday_stage: resApi.data.data[i].workday_stage,
            application_date: resApi.data.data[i].application_date,
            application_end_date: resApi.data.data[i].application_end_date,
            justification: resApi.data.data[i].justification,
            employee_id: resApi.data.data[i].employee_id,
            status: resApi.data.data[i].status,
            absence_type_id: resApi.data.data[i].absence_type_id,
            periodo: periodo
        }
        await bukAusencias.create(r)
    }

    var next = resApi.data.pagination.next
    while (next) {
        console.log(next)
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
                start_date: resApi.data.data[i].start_date,
                end_date: resApi.data.data[i].end_date,
                days_count: resApi.data.data[i].days_count,
                day_percent: resApi.data.data[i].day_percent,
                workday_stage: resApi.data.data[i].workday_stage,
                application_date: resApi.data.data[i].application_date,
                application_end_date: resApi.data.data[i].application_end_date,
                justification: resApi.data.data[i].justification,
                employee_id: resApi.data.data[i].employee_id,
                status: resApi.data.data[i].status,
                absence_type_id: resApi.data.data[i].absence_type_id,
                periodo: periodo
            }
            await bukAusencias.create(r)
        }
    }
}


var getDataFromAPILicencias = async function (periodo) {
    finicial = await getFechaYMD1(periodo)
    ffinal = await getFechaYMD(periodo)

    const bukLicencias = require("../models/bukLicencias");
    var resApi = await axios.get('https://qa-areaschile.buk.cl/api/v1/chile/absences/licence?from='+finicial+'&page_size=100&to='+ffinal, {
        headers: {
            'Accept': 'application/json',
            'auth_token': 'CcqJEsji5Tk4FQiTDUU6dJWh'
        }
    })

    console.log('https://qa-areaschile.buk.cl/api/v1/chile/absences/licence?from='+finicial+'&page_size=100&to='+ffinal)

    for (var i = 0; i < resApi.data.data.length; i++) {
        var r = {
            idBuk: resApi.data.data[i].id,
            start_date: resApi.data.data[i].start_date,
            end_date: resApi.data.data[i].end_date,
            days_count: resApi.data.data[i].days_count,
            day_percent: resApi.data.data[i].day_percent,
            workday_stage: resApi.data.data[i].workday_stage,
            application_date: resApi.data.data[i].application_date,
            application_end_date: resApi.data.data[i].application_end_date,
            justification: resApi.data.data[i].justification,
            employee_id: resApi.data.data[i].employee_id,
            status: resApi.data.data[i].status,
            type: resApi.data.data[i].type,
            licence_type_id: resApi.data.data[i].licence_type_id,
            licence_type: resApi.data.data[i].licence_type,
            motivo: resApi.data.data[i].motivo,
            contribution_days: resApi.data.data[i].contribution_days,
            format: resApi.data.data[i].format,
            licence_number: resApi.data.data[i].licence_number,
            medic_rut: resApi.data.data[i].medic_rut,
            medic_name: resApi.data.data[i].medic_name,
            periodo: periodo
        }
        await bukLicencias.create(r)
    }

    var next = resApi.data.pagination.next
    while (next) {
        console.log(next)
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
                start_date: resApi.data.data[i].start_date,
                end_date: resApi.data.data[i].end_date,
                days_count: resApi.data.data[i].days_count,
                day_percent: resApi.data.data[i].day_percent,
                workday_stage: resApi.data.data[i].workday_stage,
                application_date: resApi.data.data[i].application_date,
                application_end_date: resApi.data.data[i].application_end_date,
                justification: resApi.data.data[i].justification,
                employee_id: resApi.data.data[i].employee_id,
                status: resApi.data.data[i].status,
                type: resApi.data.data[i].type,
                licence_type_id: resApi.data.data[i].licence_type_id,
                licence_type: resApi.data.data[i].licence_type,
                motivo: resApi.data.data[i].motivo,
                contribution_days: resApi.data.data[i].contribution_days,
                format: resApi.data.data[i].format,
                licence_number: resApi.data.data[i].licence_number,
                medic_rut: resApi.data.data[i].medic_rut,
                medic_name: resApi.data.data[i].medic_name,
                periodo: periodo
            }
            await bukLicencias.create(r)
        }
    }
    
}

var getDataFromAPIVacaciones = async function (periodo) {

    finicial = await getFechaYMD1(periodo)
    ffinal = await getFechaYMD(periodo)

    const bukVacaciones = require("../models/bukVacaciones");
    var resApi = await axios.get('https://qa-areaschile.buk.cl/api/v1/chile/vacations?date='+finicial+'&page_size=100&end_date='+ffinal, {
        headers: {
            'Accept': 'application/json',
            'auth_token': 'CcqJEsji5Tk4FQiTDUU6dJWh'
        }
    })

    console.log('https://qa-areaschile.buk.cl/api/v1/chile/vacations?date='+finicial+'&page_size=100&end_date='+ffinal)

    for (var i = 0; i < resApi.data.data.length; i++) {
        var r = {
            idBuk: resApi.data.data[i].id,
            employee_id: resApi.data.data[i].employee_id,
            working_days: resApi.data.data[i].working_days,
            start_date: resApi.data.data[i].start_date,
            end_date: resApi.data.data[i].end_date,
            type: resApi.data.data[i].type,
            status: resApi.data.data[i].status,
            periodo: periodo
    }
        await bukVacaciones.create(r)
    }

    var next = resApi.data.pagination.next
    while (next) {
        console.log(next)
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
                employee_id: resApi.data.data[i].employee_id,
                working_days: resApi.data.data[i].working_days,
                start_date: resApi.data.data[i].start_date,
                end_date: resApi.data.data[i].end_date,
                type: resApi.data.data[i].type,
                status: resApi.data.data[i].status,
                periodo: periodo
            }
            await bukVacaciones.create(r)
        }
    }
}


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

var leePeriodos = async function () {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select id, periodo "
        sql += "   from periodos"
        sql += "   order by periodo "
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var borraDataLiquidacion = async function (periodo) {
    return new Promise(function (resolve, reject) {
        var p = periodo.toString()
        var ano = p.substring(0, 4)
        var mes = p.substring(4, 6)
        var sql = ""
        sql += "delete from bukLiquidacions "
        sql += " where month = " + mes
        sql += "   and year = " + ano
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
}

var borraDataHorasNoTrabajadas = async function (periodo) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "delete from bukHorasNoTrabajadas "
        sql += " where periodo = " + periodo
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
}

var borraDataAusencias = async function (periodo) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "delete from bukAusencias "
        sql += " where periodo = " + periodo
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
}

var borraDataLicencias = async function (periodo) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "delete from bukLicencias "
        sql += " where periodo = " + periodo
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
}

var borraDataVacaciones = async function (periodo) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "delete from bukVacaciones "
        sql += " where periodo = " + periodo
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
}

var getFecha = async function (periodo) {

    var p = periodo.toString()

    var ano = p.substring(0, 4)
    var mes = p.substring(4, 6)
    var dia = ''

    var bisiesto = (parseInt(ano) % 4 == 0)

    if (mes == '01' || mes == '03' || mes == '05' || mes == '07' || mes == '08' || mes == '10' || mes == '12') {
        dia = '31'
    } else {
        if (mes == '02') {
                if (bisiesto) {
                    dia = '29'
                } else {
                    dia = '28'
                }
        }
        else { 
            dia = '30'
        }
    }

    return dia + '-' + mes + '-' + ano
    
}

var getFechaYMD1 = async function (periodo) {

    var p = periodo.toString()

    var ano = p.substring(0, 4)
    var mes = p.substring(4, 6)
    var dia = '01'

    return ano + '-' + mes + '-' + dia
    
}

var getFechaYMD = async function (periodo) {

    var p = periodo.toString()

    var ano = p.substring(0, 4)
    var mes = p.substring(4, 6)
    var dia = ''

    var bisiesto = (parseInt(ano) % 4 == 0)

    if (mes == '01' || mes == '03' || mes == '05' || mes == '07' || mes == '08' || mes == '10' || mes == '12') {
        dia = '31'
    } else {
        if (mes == '02') {
                if (bisiesto) {
                    dia = '29'
                } else {
                    dia = '28'
                }
        }
        else { 
            dia = '30'
        }
    }

    return ano + '-' + mes + '-' + dia
    
}


exports.agendaAPILiquidacionRoutes = router;
exports.reprogramaAgendaAPILiquidacion = reprograma;