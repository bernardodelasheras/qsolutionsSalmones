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
//const ftp = require("basic-ftp");
const ftp = require("basic-ftp");
const { options } = require(".");
const { nullFormat } = require("numeral");

require('dotenv').config({ path: 'variables.env' });
var rutEmpresa = process.env.RUTEMPRESA;
var timeZone = process.env.TIMEZONE;
var mailServer = process.env.MAIL_SERVER;
var mailUsu = process.env.MAIL_USUARIO;
var mailPwd = process.env.MAIL_CONTRASENA;
var mailPort = process.env.MAIL_SMTPPORT;

var ftpHost = process.env.FTP_HOST
var ftpPort = process.env.FTP_PORT
var ftpUser = process.env.FTP_USER
var ftpPassword = process.env.FTP_PASSWORD
var MyAreasPrimeraVez = process.env.MYAREAS_PRIMERAVEZ
var ftpFolder = process.env.FTP_FOLDER

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
    res.render("agendaMyAreas/index", { data: data });
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
        extrae: req.body.data.extrae,
        mail: req.body.data.mail
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
        aplicacion: 'MyAreas', username: req.session.username,
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
    res.redirect("/agendaMyAreas/index");
});

router.post("/indexApi", async function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body)

    var taskdata = {mail: req.body.data.mail}
    await procesaConsulta(req, res, taskdata)
    req.flash("success", "Proceso Terminado")
    res.redirect("/agendaMyAreas/index")
})

var traduceMes = async function (mes) {
    var m = '00'
    if (mes == 'Jan') m='01'
    if (mes == 'Feb') m='02'
    if (mes == 'Mar') m='03'
    if (mes == 'Apr') m='04'
    if (mes == 'May') m='05'
    if (mes == 'Jun') m='06'
    if (mes == 'Jul') m='07'
    if (mes == 'Aug') m='08'
    if (mes == 'Sep') m='09'
    if (mes == 'Oct') m='10'
    if (mes == 'Nov') m='11'
    if (mes == 'Dec') m='12'
    return m
}

var procesaConsulta = async function (req, res, taskdata) {

    var archivos=[]

    var now = '' + new Date().toISOString()
    var fecha = now.split('T')[0].split('-')

    var now2 = '' + Date()
    var diaGMT = now2.split(' ')[2]
    var añoGMT = now2.split(' ')[3]
    var mesGMT = await traduceMes(now2.split(' ')[1])
    var hora = now2.split(' ')[4].split(':')

    var fechaAMD = añoGMT + mesGMT + diaGMT
    var horaHMS = hora[0] + hora[1] //+ hora[2]

    var nombreArchivoSolo = 'HRCHLAPP_IMO_' + fechaAMD + '_' + horaHMS + '.CSV'
    var nombreArchivo = 'tmp/HRCHLAPP_IMO_' + fechaAMD + '_' + horaHMS + '.CSV'
    archivos.push(nombreArchivoSolo)

    var dataPersonas = await leePersonas().catch(e=>{console.log(e)})
    await generaArchivoPersonas(dataPersonas, nombreArchivo)

 
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
        host: ftpHost,
        port: ftpPort,
        user: ftpUser,
        password: ftpPassword
        });
        //console.log(await client.list());
        await client.uploadFrom(nombreArchivo, ftpFolder + nombreArchivoSolo);
    } catch(err) {
        console.log(err);
    }
    client.close();

//-----------------
    // var fechaAMD = fecha[0] + fecha[1] + fecha[2] 
    // var horaHM = hora[0] + hora[1]
    var nombreArchivoSolo = 'import_jobroles_cl_' + fechaAMD + horaHMS + '.csv'
    var nombreArchivo = 'tmp/import_jobroles_cl_' + fechaAMD + horaHMS + '.csv'
    archivos.push(nombreArchivoSolo)

    var dataCargos = await leeCargos().catch(e=>{console.log(e)})
    await generaArchivoCargos(dataCargos, nombreArchivo)

    try {
        await client.access({
        host: ftpHost,
        port: ftpPort,
        user: ftpUser,
        password: ftpPassword
        });
        //console.log(await client.list());
        await client.uploadFrom(nombreArchivo, ftpFolder + nombreArchivoSolo);
    } catch(err) {
        console.log(err);
    }
    client.close();

//-----------------
    // var fechaAMD = fecha[0] + fecha[1] + fecha[2] 
    // var horaHM = hora[0] + hora[1]
    var nombreArchivoSolo = 'import_domain_cl_' + fechaAMD + horaHMS + '.csv'
    var nombreArchivo = 'tmp/import_domain_cl_' + fechaAMD + horaHMS + '.csv'
    archivos.push(nombreArchivoSolo)

    var dataDominios = await leeDominios().catch(e=>{console.log(e)})
    await generaArchivoDominios(dataDominios, nombreArchivo)

    try {
        await client.access({
        host: ftpHost,
        port: ftpPort,
        user: ftpUser,
        password: ftpPassword
        });
        //console.log(await client.list());
        await client.uploadFrom(nombreArchivo, ftpFolder + nombreArchivoSolo);
    } catch(err) {
        console.log(err);
    }
    client.close();
   

    enviaCorreo (taskdata.mail, "Envío MyAreas", "", archivos)

}

var generaArchivoPersonas = async function (data, nombreArchivo) {
    const fs = require('fs');
    let writeStream = fs.createWriteStream(nombreArchivo);
    var linea = 'Registration_Date;Given_Name;Last_Name_1;Last_Name_2;Birth_Date;Gender;Personal_Email;Authoritative_Source;Code_User_As;Code_User;Title_Code;Title;Work_Center_Code;Work_Center;Entry_Date_As;Leaving_Date_As;Country;Identity_Document;Contract;Ocupation_ID;Domain_ID'
    writeStream.write(linea + "\n", "ascii")
    data.forEach(
        p => {
            linea = procesaLinea(p)
            writeStream.write(linea + "\n", "ascii")
        }
    )
    writeStream.end();
}

var generaArchivoCargos = async function (data, nombreArchivo) {
    const fs = require('fs');
    let writeStream = fs.createWriteStream(nombreArchivo);
    var linea = '"IDOCCUPATION";"NOMBREOCUPACION";"IDCOLECTIVO";"IDTIPOOCUPACION";"IDAMBITO";"IDCOMPETENCE"'
    writeStream.write(linea + "\n", "ascii")
    data.forEach(
        p => {
            linea = p.idCargo + ';' + p.nombre.replace(/[^a-zA-Z0-9 ]/g, '') + ';;;cl;'
            writeStream.write(linea + "\n", "ascii")
        }
    )
    writeStream.end();
}

var generaArchivoDominios = async function (data, nombreArchivo) {
    const fs = require('fs');
    let writeStream = fs.createWriteStream(nombreArchivo);
    var linea = 'ID DOMINIO;NOMBRE DEL DOMINIO;ID DOMINIO PADRE;TIPO DE DOMINIO;DESCRIPCION;ID DISTRITO;ID CENTRO FORMACION;ID ESTADO;ID AMBITO;NOMBREDOMINIO2;NOMBREDOMINIO3;IDCATEGORIA1;IDCATEGORIA2;IDCATEGORIA3;IDCATEGORIA4;IDCATEGORIA5;FREE1;FREE2;FREE3;FREE4;FREE5;FREE6;FREE7;FREE8;FREE9;FREE10;FREE11;FREE12;FREE13;FREE14'
    writeStream.write(linea + "\n", "ascii")
    linea = 'cl_0' + ';' + 'Aeropuerto Santiago - AREASCL' +";ROOT;DEFAULT;" + 'Aeropuerto Santiago - AREASCL' + ";;;ALTA;cl;;;;;;;;;;;;;;;;;;;;;;"
    writeStream.write(linea + "\n", "ascii")
    data.forEach(
        p => {
            linea = p.idDominio + ';' + p.nombre.replace(/[^a-zA-Z0-9 -]/g, '') +";cl_0;DEFAULT;" + p.nombre.replace(/[^a-zA-Z0-9 -]/g, '') + ";;;ALTA;cl;;;;;;;;;;;;;;;;;;;;;;"
            writeStream.write(linea + "\n", "ascii")
        }
    )
    writeStream.end();
}

function procesaLinea(d) {
    var linea = "";
    Object.getOwnPropertyNames(d).forEach(function (val, idx, array) {
        if (typeof d[val] === 'number') {
            valor = d[val].toString().replace('.', ',');
        } else {
            if (d[val] != null) {
                valor = d[val].toString();
            } else {
                valor = ' ';
            }
        }
        linea += valor + ';';

    });
    return linea.substring(0, linea.length - 1).replace(/[^a-zA-Z0-9;/ -@_]/g, '');
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

var leeCargos = async function (empid, usuario) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select 'cl_' + convert(varchar,idCargo) idCargo, cargoMyAreas nombre"
        sql += "  from cargos"
        sql += " where cargoMyAreas <> 'NULL'"
        sql += " order by idCargo"
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeDominios = async function (empid, usuario) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select 'cl_' + convert(varchar, idDominio) idDominio, nombre"
        sql += "  from dominios"
        sql += " order by idDominio"
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leePersonas = async function (empid, usuario) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select convert(varchar, getdate(), 103) Registration_Date, "
        sql += "       replace(replace(bukPersonas.first_name,'ñ','n'),'Ñ','N') first_name, "
        sql += "       replace(replace(bukPersonas.surname,'ñ','n'),'Ñ','N') surname, "
        sql += "       replace(replace(bukPersonas.second_surname,'ñ','n'),'Ñ','N') second_surname, "
        sql += "       convert(varchar,convert(date, bukPersonas.birthday), 103) birthday, "
        sql += "       bukPersonas.gender, "
        sql += "       bukPersonas.personal_email email, "
        sql += "       'HRCHLAPP' Authoritative_Source, "
        sql += "       bukPersonas.idBuk Code_User_As, "
        sql += "       'HRCHLAPP_' + convert(varchar,bukPersonas.idBuk)  Code_User, "
        // sql += "       bukPersonas.role_code Title_Code, "
        // sql += "       bukPersonas.name Title, "
        sql += "       cargos.idCargo Title_Code, "
        sql += "       cargos.cargoMyAreas Title, "
        sql += "       bukAreas.centroCostos Work_Center_Code, "
        sql += "       bukAreas.nombreDivision + ' ' + bukAreas.nombre Work_Center, "
        sql += "       convert(varchar,convert(date, active_since), 103) Entry_Date_As, "
        sql += "       isnull(convert(varchar,convert(date, active_until), 103),'') Leaving_Date_As, "
        sql += "       'CHL'Country, "
        sql += "       rut Identity_Document, "
        sql += "       '' Contract, "
        sql += "       'cl_' + convert(varchar, cargos.idCargo) Ocupation_ID, "
        sql += "       'cl_' + convert(varchar, dominios.idDominio) Domain_ID "
        sql += "  from bukPersonas join "
        sql += "       bukAreas on bukPersonas.AreaId = bukAreas.idBuk join "
        sql += "       cargos on bukPersonas.name = cargos.nombre left join"
        sql += "       dominios on bukPersonas.dominio = dominios.nombre "

        if (MyAreasPrimeraVez=='SI'){
            sql += "  where status = 'activo'  "
            sql += "    and bukPersonas.surname <> 'NULL'"
        } else {
            sql += "  where ((status = 'activo')  "
            sql += "     or  (status = 'inactivo' and convert(date, active_until) > getdate()-30)) "        
            sql += "    and (bukPersonas.surname <> 'NULL')"
        }

        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var enviaCorreo = async function (destinatarios, asunto, texto, archivos) {
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
            text: texto,
            attachments: [
                {filename: archivos[0],
                path: 'tmp/'+archivos[0],
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},
            
                {filename: archivos[1],
                path: 'tmp/'+archivos[1],
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},

                {filename: archivos[2],
                path: 'tmp/'+archivos[2],
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'},
    
               
            ]
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



exports.agendaMyAreasRoutes = router;
exports.reprogramaagendaMyAreas = reprograma;