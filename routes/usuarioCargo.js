var express = require("express");
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
var privilegio = require("../models/privilegio");
var usuario = require("../models/usuario");
var cargo = require("../models/cargo");
var usuarioCargo = require("../models/usuarioCargo");
var bodyParser = require("body-parser");


var jsonParser = bodyParser.json();

// Index Route
router.get("/index", middleware.isLoggedIn, function (req, res) {
    usuario.findAll({
        order: [['username', 'asc']]
    })
        .then(data => {
            res.render("usuarioCargo/index", { data: data });
        })
        .catch(err => {
            console.log(err);
        })
});

router.post("/index2", function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    var idUsuario = req.body.data.idUsuario;
    var privilegios = [];
    cargo.findAll({ order: [['idCargo', 'asc']] })
        .then(dataCargo => {
            usuarioCargo.findAll({ where: { idUsuario: idUsuario } })
                .then(datausuarioCargo => {
                    dataCargo.forEach(e => {

                        var enabled = false;
                        datausuarioCargo.forEach(epriv => {
                            if (epriv.idCargo === e.idCargo) {
                                enabled = true;
                            }
                        });

                        var p = {
                            idCargo: e.idCargo,
                            nombre: e.nombre,
                            enabled: enabled
                        }
                        privilegios.push(p);
                    });
                    usuario.findOne({ where: { idUsuario: idUsuario } })
                        .then(dataUsuario => {
                            res.render("usuarioCargo/index3", { data: privilegios, dataUsuario: dataUsuario });
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
            usuarioCargo.findOne({where: {idUsuario: e.idUsuario, idCargo: e.idCargo}})
            .then (data =>{
                if (!data) {
                    data = { idUsuario: e.idUsuario, idCargo: e.idCargo }
                    usuarioCargo.create(data)
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
            usuarioCargo.destroy({ where: { idUsuario: e.idUsuario, idCargo: e.idCargo } })
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
