var express = require("express");
var aplicacion = require("../models/aplicacion");
var aplicacionDias = require("../models/aplicacionDias");
var privilegio = require("../models/privilegio");
var usuario = require("../models/usuario");
var sequelize = require('../models/sequelizeConnection');
var wf_hito = require("../models/wf_hito");
var wf_movimiento = require("../models/wf_movimiento");
var sequelizeFin700 = require('../models/sequelizeConnectionFin700');
var sequelize = require('../models/sequelizeConnection');
var browser = require('browser-detect');
var middlewareOject = {};


middlewareOject.isLoggedIn = function (req, res, next) {
    if (req.session.isLoggedIn) {

        let d = new Date()
        f = d.toLocaleString().split(' ')[0].split('-')
        let dia = Number(f[0])
        let mes = Number(f[1])
        let ano = Number(f[2])
  

        var idUsuario = req.session.idUsuario;
        var ruta = req.originalUrl;

        var i = ruta.indexOf("edit")
        if (i > -1) {
            var id = ruta.replace(/\D/g, "");
            ruta = ruta.replace(id, ":id");
        }
        var i = ruta.indexOf("delete")
        if (i > -1) {
            var id = ruta.replace(/\D/g, "");
            ruta = ruta.replace(id, ":id");
        }

        aplicacion.findOne({ where: { ruta: ruta } })
            .then(d => {
                if (d) {
                    var idAplicacion = d.idAplicacion;

                    privilegio.findOne({ where: { idUsuario: idUsuario, idAplicacion: idAplicacion } })
                        .then(data => {
                            if (!data) {
                                req.flash("success", "No tiene Privilegios para esta opción");
                                res.redirect("/");
                            } else {
                                aplicacionDias.findOne({where: { ruta: ruta }})
                                    .then(data2 => {
                                        if (!data2) {
                                            return next();            
                                        } else {
                                            if (dia >= data2.desde && dia <= data2.hasta) {
                                                return next();            
                                            } else {
                                                req.flash("success", "No tiene Privilegios para esta opción, fuera del rango de fecha");
                                                res.redirect("/");
                                            }
                                        }
                                    })
                            }
                        })
                } else {
                    return next();
                }

            })
            .catch(e => {
                console.log(e);
            })
    } else {
        req.flash("success", "Conéctese por favor");

        const isMobile = browser(req.headers['user-agent']).mobile;
        if (isMobile) {
            res.redirect("/loginMobile");
        } else {
            res.redirect("/login");
        }

    }
}

middlewareOject.isLoggedInAprobar = function (req, res, next) {
    if (req.session.isLoggedIn) {

        let d = new Date()
        f = d.toLocaleString().split(' ')[0].split('-')
        let dia = Number(f[0])
        let mes = Number(f[1])
        let ano = Number(f[2])
  

        var idUsuario = req.session.idUsuario;
        var ruta = req.originalUrl;

        var i = ruta.indexOf("edit")
        if (i > -1) {
            var id = ruta.replace(/\D/g, "");
            ruta = ruta.replace(id, ":id");
        }
        var i = ruta.indexOf("delete")
        if (i > -1) {
            var id = ruta.replace(/\D/g, "");
            ruta = ruta.replace(id, ":id");
        }

        aplicacion.findOne({ where: { ruta: ruta } })
            .then(d => {
                if (d) {
                    var idAplicacion = d.idAplicacion;

                    privilegio.findOne({ where: { idUsuario: idUsuario, idAplicacion: idAplicacion } })
                        .then(data => {
                            if (!data) {
                                req.flash("success", "No tiene Privilegios para esta opción");
                                res.redirect("/");
                            } else {
                                aplicacionDias.findOne({where: { ruta: ruta }})
                                    .then(data2 => {
                                        if (!data2) {
                                            return next();            
                                        } else {
                                            if (dia >= data2.desde && dia <= data2.hasta) {
                                                return next();            
                                            } else {
                                                req.flash("success", "No tiene Privilegios para esta opción, fuera del rango de fecha");
                                                res.redirect("/");
                                            }
                                        }
                                    })
                            }
                        })
                } else {
                    return next();
                }

            })
            .catch(e => {
                console.log(e);
            })
    } else {
        req.flash("success", "Conéctese por favor");

        const isMobile = browser(req.headers['user-agent']).mobile;
        if (isMobile) {
            res.redirect("/loginMobile");
        } else {
            res.redirect("/login");
        }

    }
}


middlewareOject.isLoggedInMail = function (req, res, next) {
    if (req.session.isLoggedIn) {

        var idUsuario = req.session.idUsuario;
        var ruta = req.originalUrl;

        var i = ruta.indexOf("edit")
        if (i > -1) {
            var id = ruta.replace(/\D/g, "");
            ruta = ruta.replace(id, ":id");
        }
        var i = ruta.indexOf("delete")
        if (i > -1) {
            var id = ruta.replace(/\D/g, "");
            ruta = ruta.replace(id, ":id");
        }

        aplicacion.findOne({ where: { ruta: ruta } })
            .then(d => {
                if (d) {
                    var idAplicacion = d.idAplicacion;

                    privilegio.findOne({ where: { idUsuario: idUsuario, idAplicacion: idAplicacion } })
                        .then(data => {
                            if (!data) {
                                req.flash("success", "No tiene Privilegios para esta opción");
                                //res.redirect("/");
                            } else {
                                return next();
                            }
                        })
                } else {
                    return next();
                }

            })
            .catch(e => {
                console.log(e);
            })
    } else {
        req.flash("success", "Conéctese por favor");

        const isMobile = browser(req.headers['user-agent']).mobile;
        if (isMobile) {
            res.redirect("/loginMobile");
        } else {
            res.redirect("/login");
        }

    }
}


//Valida Notaria new
middlewareOject.isValidrpaEmpresaNew = function (req, res, next) {
    DatarpaEmpresa(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = {
            nombre: req.body.data.nombre,
            urlbuk: req.body.data.urlbuk,
            usernamebuk: req.body.data.usernamebuk,
            passwordbuk: req.body.data.passwordbuk,
            meses: req.body.data.meses,
            urldt: req.body.data.urldt,
            usernamedt: req.body.data.usernamedt,
            passworddt: req.body.data.passworddt,
            emaillog: req.body.data.emaillog
        };
        res.render("rpaEmpresa/new", { data: data, errorList: errors });        
    } else {
        return next();
    }
}
//Valida Notaria edit
middlewareOject.isValidrpaEmpresaEdit = function (req, res, next) {
    DatarpaEmpresa(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = {
            nombre: req.body.data.nombre,
            urlbuk: req.body.data.urlbuk,
            usernamebuk: req.body.data.usernamebuk,
            passwordbuk: req.body.data.passwordbuk,
            meses: req.body.data.meses,
            urldt: req.body.data.urldt,
            usernamedt: req.body.data.usernamedt,
            passworddt: req.body.data.passworddt,
            emaillog: req.body.data.emaillog,
            _id: req.params.id,
            idEmpresa: req.params.id
        };
        res.render("rpaEmpresa/edit", { data: data, errorList: errors });
    } else {
        return next();
    }
}
//Valida Notaria
function DatarpaEmpresa(req) {
    req.check('data.nombre', 'Nombre es obligatorio').isLength({ min: 1 });
    req.check('data.urlbuk', 'Url BUK es obligatorio').isLength({ min: 1 });
    req.check('data.usernamebuk', 'Nombre de usuario BUK es obligatorio').isLength({ min: 1 });
    req.check('data.passwordbuk', 'Contraseña BUK obligatorio').isLength({ min: 1 });
    req.check('data.meses', 'Meses inválido').isInt({ min: -1, max: 999 });    
    req.check('data.urldt', 'Url DT es obligatorio').isLength({ min: 1 });
    req.check('data.usernamedt', 'Nombre de usuario DT es obligatorio').isLength({ min: 1 });
    req.check('data.passworddt', 'Contraseña DT obligatorio').isLength({ min: 1 });
    req.check('data.emaillog', 'Email es obligatorio').isLength({ min: 1 });

}


//Valida Notaria new
middlewareOject.isValidNotariaNew = function (req, res, next) {
    DataNotaria(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = {
            nombre: req.body.data.nombre,
            url: req.body.data.url,
            meses: req.body.data.meses,
            username: req.body.data.username,
            password: req.body.data.password,
            emaillog: req.body.data.emaillog
        };
        leeRobots()
            .then(r => {
                res.render("notaria/new", { data: data, robots: r, errorList: errors });
            })
            .catch(e => { console.log(e) });
    } else {
        return next();
    }
}
//Valida Notaria edit
middlewareOject.isValidNotariaEdit = function (req, res, next) {
    DataNotaria(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = {
            nombre: req.body.data.nombre,
            url: req.body.data.url,
            meses: req.body.data.meses,
            username: req.body.data.username,
            password: req.body.data.password,
            emaillog: req.body.data.emaillog,
            _id: req.params.id,
            idNotaria: req.params.id
        };
        leeRobots()
            .then(r => {
                res.render("notaria/edit", { data: data, robots: r, errorList: errors });
            })
            .catch(e => { console.log(e) });

    } else {
        return next();
    }
}
//Valida Notaria
function DataNotaria(req) {
    req.check('data.nombre', 'Nombre es obligatorio').isLength({ min: 1 });
    req.check('data.url', 'Nombre es obligatorio').isLength({ min: 1 });
    req.check('data.emaillog', 'Email del Log es obligatorio').isLength({ min: 1 });
    req.check('data.meses', 'Meses inválido').isInt({ min: 0, max: 999 });
    req.check('data.username', 'Nombre de usuario es obligatorio').isLength({ min: 1 });
    req.check('data.password', 'Contraseña obligatorio').isLength({ min: 1 });
}

//Valida Fase new
middlewareOject.isValidFaseNew = function (req, res, next) {
    DataFase(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = {
            nombre: req.body.data.nombre,
        };
        res.render("wf_fase/new", { data: data, errorList: errors });
    } else {
        return next();
    }
}
//Valida Fase edit
middlewareOject.isValidFaseEdit = function (req, res, next) {
    DataFase(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = {
            nombre: req.body.data.nombre,
            _id: req.params.id,
            idFase: req.params.id
        };
        res.render("wf_fase/edit", { data: data, errorList: errors });
    } else {
        return next();
    }
}
//Valida Fase
function DataFase(req) {
    req.check('data.nombre', 'Nombre es obligatorio').isLength({ min: 1 });
}


middlewareOject.isValidPeriodosNew = function (req, res, next) {
    DataPeriodos(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = {
            periodo: req.body.data.periodo,
        };
        res.render("periodos/new", { data: data, errorList: errors });
    } else {
        return next();
    }
}
//Valida Fase edit
middlewareOject.isValidPeriodosEdit = function (req, res, next) {
    DataPeriodos(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = {
            periodo: req.body.data.periodo,
            _id: req.params.id,
            id: req.params.id
        };
        res.render("periodos/edit", { data: data, errorList: errors });
    } else {
        return next();
    }
}
//Valida Fase
function DataPeriodos(req) {
    req.check('data.periodo', 'Periodo es obligatorio').isLength({ min: 1 });
}




//Valida Hito new
middlewareOject.isValidHitoNew = async function (req, res, next) {
    DataHito(req);
    var errors = req.validationErrors() || [];
    

    var d = await wf_hito.findOne({ where: { idTipoProceso: req.body.data.idTipoProceso, 
                                             secuencia: req.body.data.secuencia } })
            .catch(err => { console.log(err) });
    if (d) {
            errors.push({ location: "create", param: "hito", msg: 'No se puede crear, secuencia duplicada', value: "0" })
    }

    if (errors) {
        leeFases()
            .then(fases => {
                var data = {
                    idTipoProceso: req.body.data.idTipoProceso,
                    _idTipoProceso: req.body.data.idTipoProceso,
                    secuencia: req.body.data.secuencia,
                    diasDuracion: req.body.data.diasDuracion,
                    diasvencidan1: req.body.data.diasvencidan1,
                    diasvencidan2: req.body.data.diasvencidan2,
                    nombre: req.body.data.nombre, fases: fases
                };
                res.render("wf_hito/new", { data: data, errorList: errors });
            })
            .catch(err => {
                console.log(err);
            })
    } else {
        return next();
    }


}
//Valida Hito edit
middlewareOject.isValidHitoEdit = async function (req, res, next) {
    DataHito(req);
    var errors = req.validationErrors();
    if (errors) {
        leeFases()
            .then(fases => {
                wf_hito.findByPk(req.params.id)
                    .then(data => {
                        data.secuencia = req.body.data.secuencia;
                        data.diasDuracion = req.body.data.diasDuracion;
                        data.diasvencidan1 = req.body.data.diasvencidan1;
                        data.diasvencidan2 = req.body.data.diasvencidan2;
                        data.nombre = req.body.data.nombre;
                        data.idFase = req.body.data.idFase;
                        res.render("wf_hito/editDetalle", { data: data, fases: fases, errorList: errors });
                    })
                    .catch(err => { console.log(err) })
            })
            .catch(err => {
                console.log(err);
            })

    } else {
        return next();
    }
}

middlewareOject.isValidHitoDelete = function (req, res, next) {
    var idHito = req.params.id
    wf_hito.findByPk(idHito)
        .then(h => {
            wf_movimiento.findOne({ where: { IdHito: idHito } })
                .then(d => {
                    if (d) {
                        var errors = [{ location: "delete", param: "hito", msg: 'No se puede eliminar, en uso', value: "0" }]
                        res.redirect("/wf_hito/" + h.idTipoProceso + "/edit");
                    } else {
                        return next();
                    }
                })
                .catch(err => { console.log(err) })

        })
        .catch(err => { console.log(err) })
}

//Valida Hito
function DataHito(req) {
    req.check('data.nombre', 'Nombre es obligatorio').isLength({ min: 1 });
    req.check('data.secuencia', 'Secuencia inválida').isInt({ min: 1, max: 999 });
    req.check('data.diasDuracion', 'Días inválido').isInt({ min: 1, max: 999 });
    req.check('data.diasvencidan1', 'Días inválido').isInt({ min: 1, max: 999 });
    req.check('data.diasvencidan2', 'Días inválido').isInt({ min: 1, max: 999 });


    // wf_hito.findOne({ where: { idTipoProceso: req.body.data.idTipoProceso, secuencia: req.body.data.secuencia } })
    //     .then(d => {
    //         if (d) {
    //             var errors = [{ location: "create", param: "hito", msg: 'No se puede crear, secuencia duplicada', value: "0" }]

}

//Valida Proyecto new
middlewareOject.isValidProyectoNew = function (req, res, next) {
    DataProyecto(req);
    var errors = req.validationErrors();
    if (errors) {
        leeProcesos()
            .then(procesos => {
                leeProyectos(3, 'COPAZO')
                    .then(proyectos => {
                        var data = {
                            pTprId: req.body.data.pTprId,
                            idTipoProceso: req.body.data.idTipoProceso,
                            emailResponsable: req.body.data.emailResponsable,
                            emailSupervisor1: req.body.data.emailSupervisor1,
                            emailSupervisor2: req.body.data.emailSupervisor2,
                        }
                        res.render("wf_proyecto/new", {
                            data: data,
                            proyectos: proyectos,
                            procesos: procesos,
                            errorList: errors
                        })
                    })
                    .catch(err => { console.log(err) })
            })
            .catch(err => { console.log(err) })




    } else {
        return next();
    }
}
//Valida Proyecto edit
middlewareOject.isValidProyectoEdit = function (req, res, next) {
    DataProyecto(req);
    var errors = req.validationErrors();
    if (errors) {
        leeProyectos(3, 'COPAZO')
            .then(proyectos => {
                leeProcesos()
                    .then(procesos => {
                        var data = {
                            pTprId: req.body.data.pTprId,
                            idTipoProceso: req.body.data.idTipoProceso,
                            emailResponsable: req.body.data.emailResponsable,
                            emailSupervisor1: req.body.data.emailSupervisor1,
                            emailSupervisor2: req.body.data.emailSupervisor2,
                            _id: req.params.id,
                            idProyecto: req.params.id
                        };
                        res.render("wf_proyecto/edit", {
                            data: data,
                            proyectos: proyectos,
                            procesos: procesos,
                            errorList: errors
                        })
                    })
                    .catch (err => { console.log(err) })
            .catch(err => { console.log(err) })
            })
    } else {
        return next();
    }
}
//Valida Proyecto delete
middlewareOject.isValidProyectoDelete = function (req, res, next) {

    wf_movimiento.findOne({ where: { idProyecto: req.params.id } })
        .then(d => {
            if (d) {
                var errors = [{ location: "delete", param: "Proyecto", msg: 'No se puede eliminar, en uso', value: "0" }]
                leeProyectos(3, 'COPAZO')
                    .then(proyectos => {
                        leeProcesos()
                            .then(procesos => {
                                var data = {
                                    pTprId: req.body.data.pTprId,
                                    idTipoProceso: req.body.data.idTipoProceso,
                                    emailResponsable: req.body.data.emailResponsable,
                                    emailSupervisor1: req.body.data.emailSupervisor1,
                                    emailSupervisor2: req.body.data.emailSupervisor2,
                                    _id: req.params.id,
                                    idProyecto: req.params.id
                                };
                                res.render("wf_proyecto/delete", {
                                    data: data,
                                    proyectos: proyectos,
                                    procesos: procesos,
                                    errorList: errors
                                })
                            })
                            .catch(err => { console.log(err) })
                            .catch(err => { console.log(err) })
                    })
            } else {
                return next();
            }
        })
}


//Valida Proyecto
function DataProyecto(req) {
    req.check('data.emailResponsable', 'Email Responsable es obligatorio').isLength({ min: 1 });
    req.check('data.emailSupervisor1', 'Email 1 es obligatorio').isLength({ min: 1 });
    req.check('data.emailSupervisor2', 'Email 2 es obligatorio').isLength({ min: 1 });
}


//Valida Observacion new
middlewareOject.isValidObservacionNew = function (req, res, next) {
    DataObservacion(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = {
            glosa: req.body.data.glosa
        };
        res.render("wf_observacion/new", { data: data, errorList: errors });
    } else {
        return next();
    }
}
//Valida Observacion edit
middlewareOject.isValidObservacionEdit = function (req, res, next) {
    DataObservacion(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = {
            glosa: req.body.data.glosa,
            _id: req.params.id,
            idObservacion: req.params.id
        };
        res.render("wf_observacion/edit", { data: data, errorList: errors });

    } else {
        return next();
    }
}
//Valida Observacion delete
middlewareOject.isValidObservacionDelete = function (req, res, next) {

    wf_movimiento.findOne({ where: { idObservacion: req.params.id } })
        .then(d => {
            if (d) {
                var errors = [{ location: "delete", param: "Observacion", msg: 'No se puede eliminar, en uso', value: "0" }]
                var data = {
                    glosa: req.body.data.glosa,
                    _id: req.params.id,
                    idObservacion: req.params.id
                };
                res.render("wf_observacion/delete", { data: data, errorList: errors });
            } else {
                return next();
            }
        })
        .catch(err => { console.log(err) })

}
//Valida Observacion
function DataObservacion(req) {
    req.check('data.glosa', 'Glosa es obligatorio').isLength({ min: 1 });
}



//Valida Estado new
middlewareOject.isValidEstadoNew = function (req, res, next) {
    DataEstado(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = {
            glosa: req.body.data.glosa
        };
        res.render("wf_estado/new", { data: data, errorList: errors });
    } else {
        return next();
    }
}
//Valida Estado edit
middlewareOject.isValidEstadoEdit = function (req, res, next) {
    DataEstado(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = {
            glosa: req.body.data.glosa,
            _id: req.params.id,
            idEstado: req.params.id
        };
        res.render("wf_estado/edit", { data: data, errorList: errors });

    } else {
        return next();
    }
}
//Valida Estado edit
middlewareOject.isValidEstadoDelete = function (req, res, next) {

    wf_movimiento.findOne({ where: { idEstado: req.params.id } })
        .then(d => {
            if (d) {
                var errors = [{ location: "delete", param: "Estado", msg: 'No se puede eliminar, en uso', value: "0" }]
                var data = {
                    glosa: req.body.data.glosa,
                    _id: req.params.id,
                    idEstado: req.params.id
                }
                res.render("wf_estado/delete", { data: data, errorList: errors });
            } else {
                return next();
            }
        })
}
//Valida Estado
function DataEstado(req) {
    req.check('data.glosa', 'Estado es obligatorio').isLength({ min: 1 });
    req.check('data.codigo', 'Código inválido').isInt({ min: 1, max: 10 });
}


//Valida Movimiento edit
middlewareOject.isValidMovimientoEdit = function (req, res, next) {
    DataMovimiento(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = req.body.data;
        data._id = req.params.id;
        data.idMovimiento = req.params.id;
        res.render("wf_movimiento/edit", { data: data, errorList: errors });

    } else {
        return next();
    }
}
//Valida Movimiento
function DataMovimiento(req) {
    req.check('data.fechaVencimiento', 'Fecha Inválida').isLength({ min: 1 });
}



var leeFases = function () {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select idFase, nombre from wf_fases "
        sql += " order by idFase "
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};



var leeRobots = function () {
    return new Promise(function (resolve, reject) {
        var sql = "select idRobot, descripcion from robots";
        sequelize.query(sql)
            .then(r => {
                resolve(r[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};
//------------------------------------------------------------------------------------




// //Valida Emocion edit
// middlewareOject.isValidConfiguracionEdit = function (req, res, next) {
//     DataConfiguracion(req);
//     var errors = req.validationErrors();
//     if (errors) {
//         var data = { 
//             nombretienda: req.body.data.nombretienda,
//             email: req.body.data.email,
//             emailpwd: req.body.data.emailpwd,
//             rut: req.body.data.rut,
//             nombredeposito: req.body.data.nombredeposito,
//             banco: req.body.data.banco,
//             tipocuenta: req.body.data.tipocuenta,
//             cuenta: req.body.data.cuenta,
//             _id: req.params.id };
//         res.render("configuracion/edit", { data: data, errorList: errors });
//     } else {
//         return next();
//     }
// }
// //Valida Emocion
// function DataConfiguracion(req) {
//     req.check('data.nombretienda', 'Nombre de Tienda es obligatorio').isLength({ min: 1 });
//     req.check('data.email', 'EMail es obligatorio').isLength({ min: 1 });
//     req.check('data.emailpwd', 'Password es obligatorio').isLength({ min: 1 });
//     req.check('data.rut', 'RUT es obligatorio').isLength({ min: 1 });
//     req.check('data.nombredeposito', 'Nombre depósito es obligatorio').isLength({ min: 1 });
//     req.check('data.banco', 'Banco es obligatorio').isLength({ min: 1 });
//     req.check('data.tipocuenta', 'Tipo Cuenta es obligatorio').isLength({ min: 1 });
//     req.check('data.cuenta', 'Cuenta es obligatorio').isLength({ min: 1 });
// }
// //------------------------------------------------------------------------------------


// //-------------------------------------------------------------------------------------------
// //Valida Creencia new
// middlewareOject.isValidProductoNew = function (req, res, next) {
//     DataProducto(req);
//     var errors = req.validationErrors();
//     if (errors) {
//         var data = {codigo: req.body.data.codigo, descripcion: req.body.data.descripcion,
//                     especificacion: req.body.data.especificacion, imagen: req.body.data.imagen,
//                     precioCompra: req.body.data.precioCompra, precioVenta: req.body.data.precioVenta } ;
//         res.render("producto/new", { data: data, errorList: errors });
//     } else {
//         return next();
//     }
// }
// //Valida Creencia edit
// middlewareOject.isValidProductoEdit = function (req, res, next) {
//     DataProducto(req);
//     var errors = req.validationErrors();
//     if (errors) {
//         var data = {codigo: req.body.data.codigo, descripcion: req.body.data.descripcion,
//                     especificacion: req.body.data.especificacion, imagen: req.body.data.imagen,
//                     precioCompra: req.body.data.precioCompra, precioVenta: req.body.data.precioVenta, 
//                     _id: req.params.id };
//         res.render("producto/edit", { data: data, errorList: errors });
//     } else {
//         return next();
//     }
// }
// //Valida Emocion
// function DataProducto(req) {
//     req.check('data.codigo', 'Código es obligatorio').isLength({ min: 1 });
//     req.check('data.descripcion', 'Descripción es obligatorio').isLength({ min: 1 });
//     req.check('data.especificacion', 'Especificación es obligatorio').isLength({ min: 1 });
//     req.check('data.imagen', 'Imágen es obligatorio').isLength({ min: 1 });
//     req.check('data.precioCompra', 'Precio Compra es obligatorio').isLength({ min: 1 });
//     req.check('data.precioCompra', 'Precio Venta es obligatorio').isLength({ min: 1 });
// }
// //------------------------------------------------------------------------------------



// function valRut(rut) {
//     var rutc = String(rut);
//     rutc = rutc.substring(0, 10);
//     while (rutc.length < 10) {
//         rutc = "0" + rutc;
//     }
//     var f = 2;
//     var acum = 0;
//     var i = 9;
//     for (i = 9; i >= 0; i--) {
//         var m = f * parseInt(rutc.charAt(i));
//         acum += m;
//         f++;
//         if (f > 7) {
//             f = 2;
//         }
//     }
//     var resto = acum % 11;
//     var dn = 11 - resto;
//     var digito = "";
//     if (dn == 10) {
//         digito = "K";
//     } else {
//         if (dn == 11) {
//             digito = "0";
//         } else {
//             digito = String(dn);
//         }
//     }
//     return digito;
// }
//------------------------------------------------------------------------------------


//Valida Fase new
middlewareOject.isValidTipoProcesoNew = function (req, res, next) {
    DataTipoProceso(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = {
            nombre: req.body.data.nombre,
        };
        res.render("wf_tipoproceso/new", { data: data, errorList: errors });
    } else {
        return next();
    }
}
//Valida Fase edit
middlewareOject.isValidTipoProcesoEdit = function (req, res, next) {
    DataTipoProceso(req);
    var errors = req.validationErrors();
    if (errors) {
        var data = {
            nombre: req.body.data.nombre,
            _id: req.params.id,
            idTipoProceso: req.params.id
        };
        res.render("wf_tipoproceso/edit", { data: data, errorList: errors });
    } else {
        return next();
    }
}
//Valida Fase
function DataTipoProceso(req) {
    req.check('data.nombre', 'Tipo es obligatorio').isLength({ min: 1 });
}

middlewareOject.isValidusuarioNew = function (req, res, next) {
    Datausuario(req);
    var errors = req.validationErrors();
    if (errors) {
        leePersonas()
            .then(personas=>{
                var data =  req.body.data
                data["idUsuario"] =  req.params.id
                data["_id"] =  req.params.id
                res.render("usuario/new", { data: data, errorList: errors, personas: personas });
            })
            .catch(err=>console.log(err))
    } else {
        return next();
    }
}
middlewareOject.isValidusuarioEdit = function (req, res, next) {
    Datausuario(req);
    var errors = req.validationErrors();
    if (errors) {
        leePersonas()
            .then(personas=>{
                var data =  req.body.data
                data["idUsuario"] =  req.params.id
                data["_id"] =  req.params.id
                res.render("usuario/edit", { data: data, errorList: errors, personas: personas });
            })
            .catch(err=>console.log(err))
    } else {
        return next();
    }
}
function Datausuario(req) {
    req.check('data.username', 'Usuario es obligatorio').isLength({ min: 1 });
    req.check('data.nombre', 'Nombre es obligatorio').isLength({ min: 1 });
    req.check('data.password', 'Contraseña es obligatorio').isLength({ min: 1 });
    req.check('data.email', 'Mail es obligatorio').isLength({ min: 1 });
}

middlewareOject.isValidMotivoNew = function (req, res, next) {
    DataMotivo(req);
    var errors = req.validationErrors();
    if (errors) {
        var data =  req.body.data
        data["idMotivo"] =  req.params.id
        data["_id"] =  req.params.id
        res.render("motivo/new", { data: data, errorList: errors });
    } else {
        return next();
    }
}
middlewareOject.isValidMotivoEdit = function (req, res, next) {
    DataMotivo(req);
    var errors = req.validationErrors();
    if (errors) {
        var data =  req.body.data
        data["idMotivo"] =  req.params.id
        data["_id"] =  req.params.id
        res.render("motivo/edit", { data: data, errorList: errors });
    } else {
        return next();
    }
}
middlewareOject.isValidMotivoDelete = function (req, res, next) {
    return next();
}
function DataMotivo(req) {
    req.check('data.codigo', 'Codigo es obligatorio').isLength({ min: 1 });
    req.check('data.glosa', 'Glosa es obligatorio').isLength({ min: 1 });
}

middlewareOject.isValidValoresNew = function (req, res, next) {
    return next();
}
middlewareOject.isValidValoresEdit = function (req, res, next) {
    return next();
}
middlewareOject.isValidValoresDelete = function (req, res, next) {
    return next();
}

middlewareOject.isValidsolicitudesConfigEdit = function (req, res, next) {
    return next();
}

middlewareOject.isValidSolicitudesNew = function (req, res, next) {
    return next();
}

middlewareOject.isValidSolicitudesEdit = function (req, res, next) {
    return next();
}

middlewareOject.isValidSolicitudesDelete = function (req, res, next) {
    return next();
}


var leePersonas = function (empid, usuario) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select idBuk, rut,  upper(full_name) nombre "
        sql += "   from bukPersonas"
        sql += "  where status = 'activo' union "
        sql += "select 0, '' rut,  '' nombre "
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};


var leeProyectos = function (empid, usuario) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select d.tprid, rtrim(d.tprglosa) tprglosa from glbt_tiposproyectos d inner join"
        sql += "   InmT_InmuebleProyecto p on p.ptprid = d.tprid inner join"
        sql += "   GlbT_UsuEmpDiv e on e.pempid = p.pempid and"
        sql += "                       e.DivCodigo = p.DivCodigo and"
        sql += "                       e.fld_UserCode ='" + usuario + "'"
        sql += "  where p.pEmpId =" + empid
        sql += "  group by d.tprid, d.tprglosa"
        sql += "  order by tprid desc"
        sequelizeFin700.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeProcesos = function () {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select idTipoProceso, rtrim(nombre) Nombre from wf_TipoProcesos "
        sql += "  order by idTipoProceso"
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};


module.exports = middlewareOject;