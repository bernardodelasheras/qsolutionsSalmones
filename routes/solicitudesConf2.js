var express = require("express");
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
var sequelize = require('../models/sequelizeConnection');
const solicitudes = require("../models/solicitudes");
const solicitudesLog = require("../models/solicitudesLog");
var nodemailer = require('nodemailer');
const { session } = require("passport");

require('dotenv').config({ path: 'variables.env' });
var rutEmpresa = process.env.RUTEMPRESA;
var timeZone = process.env.TIMEZONE;
var mailServer = process.env.MAIL_SERVER;
var mailUsu = process.env.MAIL_USUARIO;
var mailPwd = process.env.MAIL_CONTRASENA;
var mailPort = process.env.MAIL_SMTPPORT;
var HOST = process.env.HOST;
var PORT = process.env.PORT;
var correosEmpleados = process.env.CORREOSEMPLEADOS;

// Index Route
router.get("/index", middleware.isLoggedIn, function (req, res) {
    let isMobile = req.session.isMobile
    leeSolicitudes(req.session.idUsuario)
        .then(data => {
            if (!isMobile) {
                res.render("solicitudesConf2/index", { data: data });
            } else {
                res.render("solicitudesConf2/indexMobile", { data: data });
            }
            
        })
        .catch(err => {
            console.log(err);
        })
});

// Create Route
// Restful: CREATE
router.get("/new", middleware.isLoggedIn, async function (req, res) {
    let meses = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

    let dateOri = ('' + new Date()).split(' ')
    let dia = fmtNumber(dateOri[2], 2)
    let mes = fmtNumber(meses.indexOf(dateOri[1]) + 1, 2)   
    let ano = dateOri[3]
    let fecha = ano + '-' + mes + '-' + dia

    var dataSolicitante = await leeSolicitante(req.session.idUsuario)
                                .catch(err=>console.log(err))


    leeMotivos()
    .then(motivos=>{
        leeCargosUsuario(req.session.idUsuario)
        .then(cargos=>{
            var idCargo = cargos[0].idCargo
            leePersonas(idCargo)
            .then(reemplazantes=>{
                var idPersona=reemplazantes[0].idBuk
                var sindicalizado = reemplazantes[0].sindicalizado
                leeValor(idCargo)
                .then(valores=>{
                    var valor = 0
                    if (sindicalizado=='1') {
                        valor = valores[0].Sindicalizado
                    } else {
                        valor = valores[0].noSindicalizado
                    }
                    leeAreas()
                    .then(areas=>{
                        var cargo = cargos[0].idCargo
                        leePersonas(cargo)
                        .then(reemplazados=>{
                            leeEstados()
                            .then(estados=>{
                                var data = { 
                                    fecha: fecha, 
                                    solicitante: dataSolicitante.nombre,
                                    idUsuarioSolicitante: req.session.idUsuario, 
                                    idMotivo: 0,
                                    fechaReemplazo: fecha,
                                    idBukReemplazante: 0,
                                    idArea: 0,
                                    valor: valor,
                                    idBukReemplazado: 0,
                                    explicacion: '',
                                    estado: 1
                                };
                                let isMobile = req.session.isMobile
                                if (!isMobile) {
                                    res.render("solicitudesConf2/new", { data: data, 
                                        motivos: motivos,
                                        cargos: cargos,
                                        reemplazantes: reemplazantes, 
                                        areas: areas,
                                        reemplazados: reemplazados,
                                        estados: estados,
                                        valores: valores
                                    });

                                } else {
                                    res.render("solicitudesConf2/newMobile", { data: data, 
                                        motivos: motivos,
                                        cargos: cargos,
                                        reemplazantes: reemplazantes, 
                                        areas: areas,
                                        reemplazados: reemplazados,
                                        estados: estados,
                                        valores: valores
                                    });

                                }
                            })
                            .catch(err=>{console.log(err)})
                        })
                        .catch(err=>{console.log(err)})
                    })
                    .catch(err=>{console.log(err)})
                })
                .catch(err=>{console.log(err)})
            })
            .catch(err=>{console.log(err)})
        })
        .catch(err=>{console.log(err)})
    })
    .catch(err=>{console.log(err)})
});

//router.post("/articulos", middleware.isValidProductoNew, function (req, res) {
router.post("/solicitudes", middleware.isValidSolicitudesNew, function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    solicitudes.create(req.body.data)
        .then(async datanew => {
// Enviar
    
            let data= await leeSolicitud(datanew.dataValues.idSolicitud).catch(err=>{console.log(err)})
            let correos= await leeCorreos().catch(err=>{console.log(err)})

            var t=""
            t += "<strong><h3>Solicitud Nro. "+ data.idSolicitud +" del "+ data.fecha + "</h3></strong>"
            t += "Solicitante: " + data.Solicitante + "<br>"
            t += "Motivo: " + data.motivo + "<br>"
            t += "Fecha Reemplazo: " + data.fechaReemplazo + "<br>"
            t += "Reemplazante: " + data.Reemplazante + "<br>"
            t += "Cargo Reemplazante: " + data.CargoReemplazante + "<br>"
            t += "Reemplazado: " + data.Reemplazado + "<br>"
            t += "Cargo Reemplazado: " + data.CargoReemplazado + "<br>"
            t += "Centro de Costos: " + data.centro + "<br>"
            t += "Valor Bruto: $" + data.valor.toLocaleString() + "<br>"
            t += "Explicación: " + data.explicacion + "<br>"
            t += "</br>"
            t += 'Para Aprobar esta solicitud presione aquí <a href="http://'+ HOST + ':' + PORT  +'/solicitudes/aprobar/'+data.idSolicitud+'">Aprobar</a>'

            var texto=t
            await enviaCorreo(correos.emailOperaciones, "Solicitud Nro. " + data.idSolicitud, texto)
            await solicitudes.update({estado: 2}, { where: { idSolicitud: data.idSolicitud } })

            var fecha = '' + new Date()
            var dataLog = {
                idSolicitud: req.params.id,
                usuario: req.session.username,
                estado: 2,
                fecha: fecha
            }
            solicitudesLog.create(dataLog)

// Enviar
            res.redirect("/solicitudesConf2/index");
        })
        .catch(err => {console.log(err)})
});


// Edit Route
// Restful: EDIT
router.get("/:id/edit", middleware.isLoggedIn, async function (req, res) {
    var dataSolicitante = await leeSolicitante(req.session.idUsuario)
                                .catch(err=>console.log(err))

    var data = await solicitudes.findByPk(req.params.id)                            
                     .catch(err=>console.log(err))

    leeMotivos()
    .then(motivos=>{
        leeCargosUsuario(req.session.idUsuario)
        .then(cargos=>{
            leePersonas(data.idCargoReemplazante)
            .then(reemplazantes=>{
                leeAreas()
                .then(areas=>{
                    leePersonas(data.idCargoReemplazado)
                    .then(reemplazados=>{
                        leeEstados()
                        .then(estados=>{
                            if (!req.session.isMobile) {
                                res.render("solicitudesConf2/edit", { data: data, 
                                    motivos: motivos,
                                    cargos: cargos,
                                    reemplazantes: reemplazantes, 
                                    areas: areas,
                                    reemplazados: reemplazados,
                                    estados: estados,
                                    idSolicitud: req.params.id,
                                    solicitante: dataSolicitante.nombre
                                });
                            } else {
                                res.render("solicitudesConf2/editMobile", { data: data, 
                                    motivos: motivos,
                                    cargos: cargos,
                                    reemplazantes: reemplazantes, 
                                    areas: areas,
                                    reemplazados: reemplazados,
                                    estados: estados,
                                    idSolicitud: req.params.id,
                                    solicitante: dataSolicitante.nombre
                                });
                            }
                        })
                        .catch(err=>{console.log(err)})
                    })
                    .catch(err=>{console.log(err)})
                })
                .catch(err => {console.log(err)})
            })
            .catch(err=>{console.log(err)})
        })
        .catch(err=>{console.log(err)})
    })
    .catch(err=>{console.log(err)})
});    

// Put Route
// Restful: PUT
// router.put("/:id", middleware.isValidProductoEdit, function (req, res) {
router.put("/:id", middleware.isValidSolicitudesEdit, function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    solicitudes.update(req.body.data, { where: { idSolicitud: req.params.id } })
        .then(d => {
            res.redirect("/solicitudesConf2/index");
        })
        .catch(err => {
            console.log(err);
        })

});

router.get("/:id/delete", middleware.isLoggedIn, async function (req, res) {
    var dataSolicitante = await leeSolicitante(req.session.idUsuario)
                                .catch(err=>console.log(err))

    var data = await solicitudes.findByPk(req.params.id)                            
                     .catch(err=>console.log(err))

    leeMotivos()
    .then(motivos=>{
        leeCargosUsuario(req.session.idUsuario)
        .then(cargos=>{
            leePersonas(data.idCargoReemplazante)
            .then(reemplazantes=>{
                leeAreas()
                .then(areas=>{
                    leePersonas(data.idCargoReemplazado)
                    .then(reemplazados=>{
                        leeEstados()
                        .then(estados=>{
                            if (!req.session.isMobile) {
                                res.render("solicitudesConf2/delete", { data: data, 
                                    motivos: motivos,
                                    cargos: cargos,
                                    reemplazantes: reemplazantes, 
                                    areas: areas,
                                    reemplazados: reemplazados,
                                    estados: estados,
                                    idSolicitud: req.params.id,
                                    solicitante: dataSolicitante.nombre
                                });
                            } else {
                                res.render("solicitudesConf2/deleteMobile", { data: data, 
                                    motivos: motivos,
                                    cargos: cargos,
                                    reemplazantes: reemplazantes, 
                                    areas: areas,
                                    reemplazados: reemplazados,
                                    estados: estados,
                                    idSolicitud: req.params.id,
                                    solicitante: dataSolicitante.nombre
                                });
                            }
                        })
                        .catch(err=>{console.log(err)})
                    })
                    .catch(err=>{console.log(err)})
                })
                .catch(err => {console.log(err)})
            })
            .catch(err=>{console.log(err)})
        })
        .catch(err=>{console.log(err)})
    })
    .catch(err=>{console.log(err)})
});

router.delete("/:id", middleware.isValidSolicitudesDelete, function (req, res) {
    solicitudes.destroy({
        where: { idSolicitud: req.params.id }
    })
        .then(d => {
            res.redirect("/solicitudesConf2/index");
        })
        .catch(err => {
            console.log(err);
        })
});

router.get("/:id/enviar", middleware.isLoggedIn, async function (req, res) {
    var dataSolicitante = await leeSolicitante(req.session.idUsuario)
                                .catch(err=>console.log(err))

    var data = await solicitudes.findByPk(req.params.id)                            
                     .catch(err=>console.log(err))

    leeMotivos()
    .then(motivos=>{
        leeCargosUsuario(req.session.idUsuario)
        .then(cargos=>{
            leePersonas(data.idCargoReemplazante)
            .then(reemplazantes=>{
                leeAreas()
                .then(areas=>{
                    leePersonas(data.idCargoReemplazado)
                    .then(reemplazados=>{
                        leeEstados()
                        .then(estados=>{
                            if (!req.session.isMobile) {
                                res.render("solicitudesConf2/enviar", { data: data, 
                                    motivos: motivos,
                                    cargos: cargos,
                                    reemplazantes: reemplazantes, 
                                    areas: areas,
                                    reemplazados: reemplazados,
                                    estados: estados,
                                    idSolicitud: req.params.id,
                                    solicitante: dataSolicitante.nombre
                                });
                            } else {
                                res.render("solicitudesConf2/enviarMobile", { data: data, 
                                    motivos: motivos,
                                    cargos: cargos,
                                    reemplazantes: reemplazantes, 
                                    areas: areas,
                                    reemplazados: reemplazados,
                                    estados: estados,
                                    idSolicitud: req.params.id,
                                    solicitante: dataSolicitante.nombre
                                });
                            }


                        })
                        .catch(err=>{console.log(err)})
                    })
                    .catch(err=>{console.log(err)})
                })
                .catch(err => {console.log(err)})
            })
            .catch(err=>{console.log(err)})
        })
        .catch(err=>{console.log(err)})
    })
    .catch(err=>{console.log(err)})
});

router.post("/enviar/:id", middleware.isValidSolicitudesDelete, async function (req, res) {
    let data= await leeSolicitud(req.params.id).catch(err=>{console.log(err)})
    let correos= await leeCorreos().catch(err=>{console.log(err)})

    var t=""
    t += "<strong><h3>Solicitud Nro. "+ data.idSolicitud +" del "+ data.fecha + "</h3></strong>"
    t += "Solicitante: " + data.Solicitante + "<br>"
    t += "Motivo: " + data.motivo + "<br>"
    t += "Fecha Reemplazo: " + data.fechaReemplazo + "<br>"
    t += "Reemplazante: " + data.Reemplazante + "<br>"
    t += "Cargo Reemplazante: " + data.CargoReemplazante + "<br>"
    t += "Reemplazado: " + data.Reemplazado + "<br>"
    t += "Cargo Reemplazado: " + data.CargoReemplazado + "<br>"
    t += "Centro de Costos: " + data.centro + "<br>"
    t += "Valor Bruto: $" + data.valor.toLocaleString() + "<br>"
    t += "Explicación: " + data.explicacion + "<br>"
    t += "</br>"
    t += 'Para Aprobar esta solicitud presione aquí <a href="http://'+ HOST + ':' + PORT  +'/solicitudes/aprobar/'+data.idSolicitud+'">Aprobar</a>'

    var texto=t
    await enviaCorreo(correos.emailOperaciones, "Solicitud Nro. " + data.idSolicitud, texto)
    await solicitudes.update({estado: 2}, { where: { idSolicitud: req.params.id } })

    var fecha = '' + new Date()
    var dataLog = {
        idSolicitud: req.params.id,
        usuario: req.session.username,
        estado: 2,
        fecha: fecha
     }
     solicitudesLog.create(dataLog)

    res.redirect("/solicitudesConf2/index")
});

router.get("/aprobar/:id", async function (req, res) {
    let dataSolicitud = await solicitudes.findByPk(req.params.id).catch(err=>console.log(err))

    if (dataSolicitud.estado==2) {
        let data= await leeSolicitud(req.params.id).catch(err=>{console.log(err)})
        let correos= await leeCorreos().catch(err=>{console.log(err)})
        let empleado = await leeEmpleado(req.params.id).catch(err=>{console.log(err)})
    
        var t=""
        t += "<strong><h3>Solicitud Nro. "+ data.idSolicitud +" del "+ data.fecha + "</h3></strong>"
        t += "<strong><h3>Aprobada por Operaciones</h3></strong>"
        t += "Solicitante: " + data.Solicitante + "<br>"
        t += "Motivo: " + data.motivo + "<br>"
        t += "Fecha Reemplazo: " + data.fechaReemplazo + "<br>"
        t += "Reemplazante: " + data.Reemplazante + "<br>"
        t += "Cargo Reemplazante: " + data.CargoReemplazante + "<br>"
        t += "Reemplazado: " + data.Reemplazado + "<br>"
        t += "Cargo Reemplazado: " + data.CargoReemplazado + "<br>"
        t += "Centro de Costos: " + data.centro + "<br>"
        t += "Valor Bruto: $" + data.valor.toLocaleString() + "<br>"
        t += "Explicación: " + data.explicacion + "<br>"
        t += "</br>"
    
        var destinatarios = correos.emailOperaciones + ', '
        destinatarios += correos.emailRRHH 

        if (correosEmpleados != '0') {
            if (empleado.email != '') {
                destinatarios += ', ' + empleado.email
            }
            if (data.emailSolicitante != '') {
                destinatarios += ', ' + data.emailSolicitante
            }
        }

    
        //agregar correo de solicitante y empleado
    
        var texto=t
        await enviaCorreo(correos.emailOperaciones, "Se ha aprobado la Solicitud Nro. " + data.idSolicitud, texto)
    
        await solicitudes.update({estado: 3}, { where: { idSolicitud: req.params.id } })

        var fecha = '' + new Date()
        var dataLog = {
            idSolicitud: req.params.id,
            usuario: 'Operaciones',
            estado: 3,
            fecha: fecha
         }
         solicitudesLog.create(dataLog)
    

        var mensaje = "Solicitud " + req.params.id + " Aprobada"
        res.render("solicitudesConf2/aprobado", {mensaje: mensaje});
    } else {
        var mensaje = "Solicitud " + req.params.id + " Ya fue aprobada"
        res.render("solicitudesConf2/aprobado", {mensaje: mensaje});
    }

});

router.get("/:id/confirmar", middleware.isLoggedIn, async function (req, res) {
    var dataSolicitante = await leeSolicitante(req.session.idUsuario)
                                .catch(err=>console.log(err))

    var data = await solicitudes.findByPk(req.params.id)                            
                     .catch(err=>console.log(err))

    leeMotivos()
    .then(motivos=>{
        leeCargosUsuario(req.session.idUsuario)
        .then(cargos=>{
            leePersonas(data.idCargoReemplazante)
            .then(reemplazantes=>{
                leeAreas()
                .then(areas=>{
                    leePersonas(data.idCargoReemplazado)
                    .then(reemplazados=>{
                        leeEstados()
                        .then(estados=>{
                            if (!req.session.isMobile) {
                                res.render("solicitudesConf2/confirmar", { data: data, 
                                    motivos: motivos,
                                    cargos: cargos,
                                    reemplazantes: reemplazantes, 
                                    areas: areas,
                                    reemplazados: reemplazados,
                                    estados: estados,
                                    idSolicitud: req.params.id,
                                    solicitante: dataSolicitante.nombre
                                });
                            } else {
                                res.render("solicitudesConf2/confirmarMobile", { data: data, 
                                    motivos: motivos,
                                    cargos: cargos,
                                    reemplazantes: reemplazantes, 
                                    areas: areas,
                                    reemplazados: reemplazados,
                                    estados: estados,
                                    idSolicitud: req.params.id,
                                    solicitante: dataSolicitante.nombre
                                });
                            }
                        })
                        .catch(err=>{console.log(err)})
                    })
                    .catch(err=>{console.log(err)})
                })
                .catch(err => {console.log(err)})
            })
            .catch(err=>{console.log(err)})
        })
        .catch(err=>{console.log(err)})
    })
    .catch(err=>{console.log(err)})
});

router.post("/confirmar/:id", middleware.isValidSolicitudesDelete, async function (req, res) {

    let data= await leeSolicitud(req.params.id).catch(err=>{console.log(err)})

    if (data.codigoEstado==3) {
        let correos= await leeCorreos().catch(err=>{console.log(err)})
        let empleado = await leeEmpleado(req.params.id).catch(err=>{console.log(err)})
    
        var t=""
        t += "<strong><h3>Solicitud Nro. "+ data.idSolicitud +" del "+ data.fecha + "</h3></strong>"
        t += "<strong><h3>Confirma Trabajo Realizado</h3></strong>"
        t += "<strong><h3>Confirmación efectuada por "+ req.session.usernombre +"</h3></strong>"
        t += "Solicitante: " + data.Solicitante + "<br>"
        t += "Motivo: " + data.motivo + "<br>"
        t += "Fecha Reemplazo: " + data.fechaReemplazo + "<br>"
        t += "Reemplazante: " + data.Reemplazante + "<br>"
        t += "Cargo Reemplazante: " + data.CargoReemplazante + "<br>"
        t += "Reemplazado: " + data.Reemplazado + "<br>"
        t += "Cargo Reemplazado: " + data.CargoReemplazado + "<br>"
        t += "Centro de Costos: " + data.centro + "<br>"
        t += "Valor Bruto: $" + data.valor.toLocaleString() + "<br>"
        t += "Explicación: " + data.explicacion + "<br>"
        t += "</br>"
    
        var tEmpleado=""
        tEmpleado += "<strong><h3>Solicitud Nro. "+ data.idSolicitud +" del "+ data.fecha + "</h3></strong>"
        tEmpleado += "<strong><h3>Confirma Trabajo Realizado</h3></strong>"
        tEmpleado += "Solicitante: " + data.Solicitante + "<br>"
        tEmpleado += "Motivo: Apoyo Local <br>"
        tEmpleado += "Fecha Reemplazo: " + data.fechaReemplazo + "<br>"
        tEmpleado += "Centro de Costos: " + data.centro + "<br>"
        tEmpleado += "Valor Bruto: $" + data.valor.toLocaleString() + "<br>"
        tEmpleado += "</br>"
    
    
        var destinatarios = correos.emailOperaciones + ', '
        destinatarios += correos.emailRRHH 
    
        if (correosEmpleados != '0') {
            // if (empleado.email != '') {
            //     destinatarios += ', ' + empleado.email
            // }
            if (data.emailSolicitante != '') {
                destinatarios += ', ' + data.emailSolicitante
            }
        }
    
        var texto=t
        await enviaCorreo(destinatarios, "Se ha confirmado el trabajo para la Solicitud Nro. " + data.idSolicitud, texto)
    
        destinatarios = ""
        if (correosEmpleados != '0') {
            if (empleado.email != '') {
                destinatarios += ', ' + empleado.email
            }
        }
        texto=tEmpleado
        await enviaCorreo(destinatarios, "Se ha confirmado el trabajo para la Solicitud Nro. " + data.idSolicitud, texto)
    
        await solicitudes.update({estado: 4, usuarioConfirma: req.session.username}, { where: { idSolicitud: req.params.id } })
    
        var fecha = '' + new Date()
        var dataLog = {
            idSolicitud: req.params.id,
            usuario: req.session.username,
            estado: 4,
            fecha: fecha
         }
         await solicitudesLog.create(dataLog)
    
    }

    res.redirect("/solicitudesConf2/index")
});


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
            html: texto,
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



// Rutas get ajax
router.get("/personas/:idCargo", function (req, res) {
    var cargo = req.params.idCargo;
    leePersonas(cargo)
        .then(data => {
            res.status(200).json(
                {
                    data
                }
            );

        });
});

router.get("/valor/:idBuk", function (req, res) {
    leeValorPersona(req.params.idBuk)
        .then(data => {
            if (data) {
                res.status(200).json({data})
            } else {
                var data = {Valor: 0}
                res.status(200).json({data})
            }

        });
});

var leeSolicitud = function (idSolicitud) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        var sql = ""
        sql += "select a.idSolicitud,   "
        sql += "       convert(varchar, a.fecha, 105) fecha,  "
        sql += "       i.full_name Solicitante, "
        sql += "       a.idUsuarioSolicitante,  "
        sql += "       b.nombre,  "
        sql += "       c.glosa motivo,  "
        sql += "       convert(varchar, a.fechaReemplazo, 105) fechaReemplazo,  "
        sql += "       d.full_name Reemplazante,  "
        sql += "       e.nombreDivision Centro,  "
        sql += "       f.full_name Reemplazado,  "
        sql += "       a.explicacion,  "
        sql += "       a.valor,  "
        sql += "       g.descripcion estado,  "
        sql += "       isnull(b1.email, '') emailSolicitante,  "
        sql += "       c1.nombre CargoReemplazante, "
        sql += "       c2.nombre CargoReemplazado, "
        sql += "       h.nombreDivision + ' - ' + h.nombre centro,"
        sql += "       a.estado codigoEstado"
        sql += "  from solicitudes a join  "
        sql += "       usuarios b on a.idUsuarioSolicitante = b.idUsuario join "
        sql += "       bukPersonas b1 on b.idBuk = b1.idBuk join  "
        sql += "       motivos c on a.idMotivo = c.idMotivo join  "
        sql += "       bukPersonas d on d.idBuk = a.idBukReemplazante join  "
        sql += "       bukAreas e on e.idBuk = a.idArea join  "
        sql += "       bukPersonas f on f.idBuk = a.idBukReemplazado join  "
        sql += "       solicitudesEstados g on g.codigo = a.estado join "
        sql += "       bukPersonas i on i.idBuk = b.idBuk join "
        sql += "       cargos c1 on c1.idCargo = a.idCargoReemplazante join "
        sql += "       cargos c2 on c2.idCargo = a.idCargoReemplazado join "
        sql += "       bukAreas h on h.idBuk = a.idArea "
        sql += " where a.idSolicitud = " + idSolicitud
        sequelize.query(sql)
            .then(data => {
                resolve(data[0][0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};


var leeSolicitudes = function (idUsuario) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select a.idSolicitud,  "
        sql += "       a.fecha, "
        sql += "       a.idUsuarioSolicitante, "
        sql += "       b.nombre solicitante, "
        sql += "       c.glosa motivo, "
        sql += "       a.fechaReemplazo, "
        sql += "       d.full_name Reemplazante, "
        sql += "       e.nombreDivision Centro, "
        sql += "       f.full_name Reemplazado, "
        sql += "       a.explicacion, "
        sql += "       g.descripcion estado "
        sql += "  from solicitudes a join "
        sql += "       usuarios b on a.idUsuarioSolicitante = b.idUsuario join "
        sql += "       motivos c on a.idMotivo = c.idMotivo join "
        sql += "       bukPersonas d on d.idBuk = a.idBukReemplazante join "
        sql += "       bukAreas e on e.idBuk = a.idArea join "
        sql += "       bukPersonas f on f.idBuk = a.idBukReemplazado join "
        sql += "       solicitudesEstados g on g.codigo = a.estado "
        sql += " where a.estado = 3 "
        sql += " order by a.idSolicitud desc"       
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeCorreos = function () {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select top 1 emailOperaciones, emailRRHH  "
        sql += "   from solicitudesConfigs "
        sequelize.query(sql)
            .then(data => {
                resolve(data[0][0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};


var leeSolicitante = function (idUsuario) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select isnull(b.full_name,' ') nombre "
        sql += "   from usuarios a join "
        sql += "        bukPersonas b on a.idBuk = b.idBuk "
        sql += "  where a.idUsuario = " + idUsuario
        sequelize.query(sql)
            .then(data => {
                resolve(data[0][0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};


////pendiente
var leeEmpleado = function (idSolicitud) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select isnull(b.full_name,' ') nombre, isnull(b.email, '') email  "
        sql += "   from solicitudes a join "
        sql += "        bukPersonas b on a.idBukReemplazante = b.idBuk "
        sql += "  where a.idSolicitud = " + idSolicitud
        sequelize.query(sql)
            .then(data => {
                resolve(data[0][0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeCargosUsuario = function (idUsuario) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select a.idCargo, a.nombre "
        sql += "   from cargos a join "
        sql += "        usuarioCargos b on a.idCargo = b.idCargo "
        sql += "  where b.idUsuario = " + idUsuario
        sql += "   order by a.nombre "
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leePersonas = function (idCargo) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select a.idBuk,  "
        sql += "       a.full_name  nombre,  "
        sql += "       case  "
        sql += "         when isnull([union], '0') = '0' then '0' "
        sql += "         else '1'  "
        sql += "       end sindicalizado "
        sql += "  from bukPersonas a join  "
        sql += "       cargos b on a.Name = b.nombre  "
        sql += " where b.idCargo = " + idCargo
        sql += "   and a.status = 'activo' "
                sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeAreas = function () {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select bukAreas.idBuk, bukAreas.nombreDivision + ' - ' + bukAreas.nombre nombre  "
        sql += "  from bukAreas join "
        sql += "       bukPersonas on bukPersonas.AreaId = bukAreas.idBuk and bukPersonas.status = 'activo'"
        sql += "  group by bukAreas.idBuk, bukAreas.nombreDivision, bukAreas.nombre"
        sql += " order by idBuk "        
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeEstados = function () {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select id, codigo, descripcion  "
        sql += "  from solicitudesEstados"
        sql += " order by id "        
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeMotivos = function () {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select idMotivo, codigo, glosa  "
        sql += "  from motivos "
        sql += " order by codigo "        
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeValor = function (idCargo) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select Sindicalizado, noSindicalizado  "
        sql += "  from valores "
        sql += " where idCargo = " + idCargo
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeValorPersona = function (idBuk) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select  "
        sql += "   case  "
        sql += "     when isnull(a.[union],'0')='0' then c.noSindicalizado  "
        sql += "     else c.Sindicalizado "
        sql += "   end as Valor "
        sql += " from bukPersonas a join "
        sql += "     cargos b on a.name = b.nombre join "
        sql += "     valores c on c.idCargo = b.idCargo "
        sql += "where idBuk = " + idBuk        
        sequelize.query(sql)
            .then(data => {
                resolve(data[0][0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};


var fmtNumber = function (num, largo) {
    var n= num.toString()
    var i = 1
    while (n.length < largo) {
        n = '0' + n
    }
    return n
}

module.exports = router;
