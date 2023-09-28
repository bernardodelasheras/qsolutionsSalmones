var express = require("express");
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
var privilegio = require("../models/privilegio");
var usuario = require("../models/usuario");
var aplicacion = require("../models/aplicacion");
var privilegio = require("../models/privilegio");
var bodyParser = require("body-parser");


var jsonParser = bodyParser.json();

// Index Route
router.get("/index", middleware.isLoggedIn, function (req, res) {
    usuario.findAll({
        order: [['username', 'asc']]
    })
        .then(data => {
            res.render("privilegio/index", { data: data });
        })
        .catch(err => {
            console.log(err);
        })
});

router.post("/index2", function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    var idUsuario = req.body.data.idUsuario;
    var privilegios = [];
    aplicacion.findAll({ order: [['idAplicacion', 'asc']] })
        .then(dataAplicacion => {
            privilegio.findAll({ where: { idUsuario: idUsuario } })
                .then(dataPrivilegio => {
                    dataAplicacion.forEach(e => {

                        var enabled = false;
                        dataPrivilegio.forEach(epriv => {
                            if (epriv.idAplicacion === e.idAplicacion) {
                                enabled = true;
                            }
                        });

                        var p = {
                            idAplicacion: e.idAplicacion,
                            descripcion: e.descripcion,
                            ruta: e.ruta,
                            enabled: enabled
                        }
                        privilegios.push(p);
                    });
                    usuario.findOne({ where: { idUsuario: idUsuario } })
                        .then(dataUsuario => {
                            res.render("privilegio/index3", { data: privilegios, dataUsuario: dataUsuario });
                        })
                        .catch(err => {
                            console.log(err);
                        })
                })
                .catch(err => {
                    console.log(err);
                })
        })
        .catch(err => {
            console.log(err);
        })
});



router.post("/send", jsonParser, function (req, res) {
    var datos = req.body;
    datos.forEach(e => {
        if (e.enabled) {
            privilegio.findOne({where: {idUsuario: e.idUsuario, idAplicacion: e.idAplicacion}})
            .then (data =>{
                if (!data) {
                    data = { idUsuario: e.idUsuario, idAplicacion: e.idAplicacion }
                    privilegio.create(data)
                    // .then (datanew => {
                    //     var ok=tr;
                    // })
                    .catch (err => {
                        console.log(err);
                    })
                }
            })
            .catch (err => {
                console.log(err);
            })
        } else {
            privilegio.destroy({ where: { idUsuario: e.idUsuario, idAplicacion: e.idAplicacion } })
            // .then (d => {
            //     console.log(d);
            // })
            .catch (err => {
                console.log(err);
            })
        }
    });
    res.json("Privilegios Registrados");
})


module.exports = router;
