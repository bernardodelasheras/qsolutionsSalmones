var express = require("express");
var router = express.Router({ mergeParams: true });
var nodemailer = require('nodemailer');
var browser = require('browser-detect');

const usuario = require("../models/usuario");
const bukPersona = require("../models/bukPersona");
const control = require("../models/control");
var bcrypt = require("bcrypt");
require('dotenv').config({ path: 'variables.env' });
var timeZone = process.env.TIMEZONE;
var mailServer = process.env.MAIL_SERVER;
var mailUsu = process.env.MAIL_USUARIO;
var mailPwd = process.env.MAIL_CONTRASENA;
var mailPort = process.env.MAIL_SMTPPORT;

// Auth Routes
router.get("/", function (req, res) {
    const isMobile = browser(req.headers['user-agent']).mobile;
    //isMobile=true;
    //res.render(isMobile ? "inicialmobile" : "inicial");
    if (isMobile){
        res.render("inicialMobile");
    } else {
        if (req.session.isLoggedIn) {
            res.render("inicial")
        } else {
            res.redirect("/login");
        }
    }

    
});

router.get("/login", function (req, res) {
    const isMobile = browser(req.headers['user-agent']).mobile;
    req.session.isMobile=isMobile
    
    if (isMobile) {
        res.render("auth/loginMobile");
    }else{
        res.render("auth/login");
    }
});

router.post("/login", function (req, res) {
    
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
    console.log("Login usuario :" + req.body.data.username + " ip: " + ip + " a las " + new Date().toISOString() + " " + Date.now());

    req.body.data.body = req.sanitize(req.body.data.body);
    usuario.findOne({
        where: { username: req.body.data.username }
    })
        .then(data => {
            if (data) {
                bcrypt.compare(req.body.data.password, data.password, function (err, result) {
                    if (!result) {
                        req.session.isLoggedIn = false;
                        req.session.idUsuario = 0;
                        req.session.username = "";
                        req.session.useremail = "";
                        req.session.usernombre = "";
                        req.flash("success", "Usuario o contraseña inválida");
                        res.redirect("/login");
                    } else {
                        bukPersona.findOne({where: { idBuk: data.idBuk }})
                        .then(dataPersona =>{
                            if (dataPersona) {
                                if (dataPersona.status != 'activo') {
                                    req.session.isLoggedIn = false;
                                    req.session.idUsuario = 0;
                                    req.session.username = "";
                                    req.session.useremail = "";
                                    req.session.usernombre = "";
                                    req.flash("success", "Empleado Asociado a Usuario " + req.body.data.username + " Finiquitado");
                                    res.redirect("/login");
                                } else {
                                    req.session.isLoggedIn = true;
                                    req.session.idUsuario = data.idUsuario;
                                    req.session.username = data.username;
                                    req.session.useremail = data.email;
                                    req.session.usernombre = data.nombre;
                                    res.locals.usuarioActual = { username: data.username };
                                    res.redirect("/");
                                }
                            } else {
                                req.session.isLoggedIn = false;
                                req.session.idUsuario = 0;
                                req.session.username = "";
                                req.session.useremail = "";
                                req.session.usernombre = "";
                                req.flash("success", "Empleado Asociado a Usuario " + req.body.data.username + " No Existe");
                                res.redirect("/login");
                            }
                        })
                        .catch (err=>{console.log(err)}) 
                    }
                });
            } else {
                req.session.isLoggedIn = false;
                req.session.idUsuario = 0;
                req.session.username = "";
                req.session.useremail = "";
                req.session.usernombre = "";
                req.flash("success", "Usuario o contraseña inválida");
                res.redirect("/login");
            }
        })
        .catch(err => {
            console.log(err);
        })
});

router.get("/logout", function (req, res) {
    req.session.isLoggedIn = false;
    req.session.username = "";
    req.session.useremail = "";
    req.session.usernombre = "";
    req.flash("success", "Usted se ha desconectado     ");
    res.redirect("/");
});

router.get("/resetpassword", function (req, res) {
    var data = { email: '', password: '', password2: '' }
    res.render("auth/resetpassword", { data: data });
});
router.post("/resetpassword", function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    usuario.findOne({
        where: { email: req.body.data.email }
    })
        .then(data => {
            if (data) {
                if (req.body.data.password == req.body.data.password2) {

                    var codseguridad = Math.floor(Math.random() * (989034 - 913989)) + 913989;

                    req.session.codseguridad = codseguridad;

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

                    var textoPedido = "";
                    textoPedido += 'Cambio de Contraseña:' + '\r\n';
                    textoPedido += 'La cuenta ' + data.username + '\r\n';
                    textoPedido += 'ha solicitado cambio de contraseña, ' + '\r\n';
                    textoPedido += 'favor introduzca código de seguridad ' + codseguridad + ' para confirmar' + '\r\n';

                    var mailOptions = {
                        from: mailUsu,
                        to: data.email,
                        subject: 'Cambio de contraseña QSolutions',
                        text: textoPedido
                    };

                    transporter.sendMail(mailOptions, function (err, info) {
                        if (err) {
                            console.log(err);
                            res.send(500, err.message);
                        } else {
                            res.render("auth/confirmacambio", { data: data, newpass: req.body.data.password, codigo: 0 })
                        }
                    });


                } else {
                    req.session.isLoggedIn = false;
                    req.session.idUsuario = 0;
                    req.session.username = "";
                    req.session.useremail = "";
                    req.session.usernombre = "";
                    req.flash("success", "Contraseñas no coinciden");
                    res.redirect("/resetpassword");
                }
            } else {
                req.session.isLoggedIn = false;
                req.session.idUsuario = 0;
                req.session.username = "";
                req.session.useremail = "";
                req.session.usernombre = "";
                req.flash("success", "Correo no resgistrado");
                res.redirect("/resetpassword");
            }
        })
        .catch(err => {
            console.log(err);
        })
});

router.post("/confirmapassword", function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    if (req.body.codigo == req.session.codseguridad) {
        bcrypt.hash(req.body.newpass, 10, function (err, hash) {
            var newdata = {
                nombre: req.body.data.nombre, username: req.body.data.username,
                password: hash, email: req.body.data.email
            };
            usuario.update(newdata, { where: { email: req.body.data.email } })
                .then(d => {
                    req.flash("success", "Contraseña modificada");
                    res.redirect("/login");
                })
                .catch(err => {
                    console.log(err);
                })
        });
    } else {
        req.flash("success", "Codigo de seguridad no coincide");
        res.redirect("/login");

    }


});

// router.get("/", function (req, res) {
//     const isMobile = browser(req.headers['user-agent']).mobile;
//     res.render(isMobile ? "inicial_mobile" : "inicial");
// });

router.get("*", function (req, res) {
    res.send("<h1>Página no encontrada</h1>");
});

module.exports = router;
