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
var dominio = require("../models/dominio");
var sequelize = require('../models/sequelizeConnection');

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
    res.render("agendaAPIBuk/index", { data: data });
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
        aplicacion: 'APIBuk', username: req.session.username,
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
    res.redirect("/agendaAPIBuk/index");
});

router.post("/indexApi", async function (req, res) {
    var taskdata = {}
    await procesaConsulta(req, res, taskdata)
    req.flash("success", "Proceso de API Terminado")
    res.redirect("/agendaAPIBuk/index")
})

var procesaConsulta = async function (req, res, taskdata) {

    var bukPersona = require("../models/bukPersona")
    var bukArea = require("../models/bukArea");

    //req.body.data.body = req.sanitize(req.body.data.body)
    var axios = require('axios')

    var dataPersonas = []

    var now = new Date().toISOString()
    var fecha = now.split('T')

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

        if (resApi.data.data[i].current_job.area_id) {
            if (resApi.data.data[i].current_job.contract_type != 'A honorarios') {
                var dataCentro = await leeArea(resApi.data.data[i].current_job.area_id)
                console.log("id Persona:" + resApi.data.data[i].id)
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
                    Name: resApi.data.data[i].current_job.role.name,
                    union: resApi.data.data[i].current_job.union,
                    email: resApi.data.data[i].email,
                    active_until: resApi.data.data[i].active_until,
                    first_name: resApi.data.data[i].first_name,
                    surname: resApi.data.data[i].surname,
                    second_surname: resApi.data.data[i].second_surname,
                    role_code: resApi.data.data[i].current_job.role.code,
                    personal_email: resApi.data.data[i].personal_email,
                    dominio: 'Aeropuerto de Santiago' + ' - ' + dataCentro.centro,
                    cargoMyAreas: resApi.data.data[i].current_job.custom_attributes["Cargo MyAreas"]
                } 
                dataPersonas.push(r)
        
                const data = await bukPersona.findOne({ where: { idBuk: r.idBuk } })
                if (data === null) {
                    await bukPersona.create(r)
                } else {
                    await bukPersona.update(r, { where: { idBuk: r.idBuk } })
                }
        
            } else {
                conosle.log("Honorarios "+resApi.data.data[i].id)
            }
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

            if (resApi.data.data[i].current_job.area_id) {

                if (resApi.data.data[i].current_job.contract_type != 'A honorarios') {
                    var dataCentro = await leeArea(resApi.data.data[i].current_job.area_id)
                    console.log("id Persona:" + resApi.data.data[i].id)
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
                        Name: resApi.data.data[i].current_job.role.name,
                        union: resApi.data.data[i].current_job.union,
                        email: resApi.data.data[i].email,
                        active_until: resApi.data.data[i].active_until,
                        first_name: resApi.data.data[i].first_name,
                        surname: resApi.data.data[i].surname,
                        second_surname: resApi.data.data[i].second_surname,
                        role_code: resApi.data.data[i].current_job.role.code,
                        personal_email: resApi.data.data[i].personal_email,
                        dominio: 'Aeropuerto de Santiago' + ' - ' + dataCentro.centro,
                        cargoMyAreas: resApi.data.data[i].current_job.custom_attributes["Cargo MyAreas"]
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
        }
    }


    
    leeCargos()
        .then (async data=> {
            for (var i=0; i < data.length; i++) {
                var dataCargo = await cargo.findOne({ where: { nombre: data[i].cargo } })
                    var item = {nombre: data[i].cargo, cargoMyAreas: data[i].cargoMyAreas}
                    if (dataCargo===null) {
                        cargo.create(item)
                    } else {
                        cargo.update(item, { where: { idCargo: dataCargo.idCargo } })
                    }
            }
            console.log("?")
        })
        .catch(err=>{console.log(err)})

    leeDominios()
        .then (async data=> {
            for (var i=0; i < data.length; i++) {
                var dataDominio = await dominio.findOne({ where: { nombre: data[i].dominio } })
                    if (dataDominio===null) {
                        var item = {nombre: data[i].dominio}
                        dominio.create(item)
                    }
            }
            console.log("?")
        })
        .catch(err=>{console.log(err)})

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

var leeCargos = function (empid, usuario) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select name cargo, cargoMyAreas"
        sql += "  from bukPersonas"
        sql += " where cargoMyAreas <> 'NULL'"
        sql += " group by name, cargoMyAreas"
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeDominios = function (empid, usuario) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select dominio"
        sql += "  from bukPersonas"
        sql += " where dominio <> 'NULL'"
        sql += " group by dominio"
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeArea = function (id) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select nombreDivision + ' ' + nombre centro"
        sql += "  from bukAreas"
        sql += " where idBuk = " + id
        sequelize.query(sql)
            .then(data => {
                resolve(data[0][0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};


exports.agendaAPIBukRoutes = router;
exports.reprogramaAgendaAPIBuk = reprograma;