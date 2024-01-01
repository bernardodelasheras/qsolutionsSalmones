var express = require("express");
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
const usuario = require("../models/usuario");
var request = require("request");
var bcrypt = require("bcrypt");
var sequelize = require('../models/sequelizeConnection');

// Index Route
router.get("/index", middleware.isLoggedIn, function (req, res) {
    usuario.findAll({
        order: [['idUsuario', 'desc']]
    })
        .then(data => {
            res.render("usuario/index", { data: data });
        })
        .catch(err => {
            console.log(err);
        })
});

// Create Route
// Restful: CREATE
router.get("/new", middleware.isLoggedIn, function (req, res) {
    leePersonas()
    .then(personas=>{
        var data = { nombre: '', username: '', password: '', email: '' };
        res.render("usuario/new", { data: data, personas: personas });
    })
    .catch(err=>{console.log(err)})
});

//router.post("/articulos", middleware.isValidProductoNew, function (req, res) {
router.post("/usuarios", middleware.isValidusuarioNew, function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    var saltRounds=10;
    bcrypt.hash(req.body.data.password, saltRounds, function (err, hash) {
        var item = {
            nombre: req.body.data.nombre, username: req.body.data.username,
            password: hash, email: req.body.data.email, idBuk: 0
        };
        usuario.create(item)
            .then(datanew => {
                res.redirect("/usuario/index");
            })
            .catch(err => {
                console.log(err)
            })
    });
});


// Edit Route
// Restful: EDIT
router.get("/:id/edit", middleware.isLoggedIn, function (req, res) {

    leePersonas()
    .then(personas=>{
        usuario.findByPk(req.params.id)
        .then(data => {
            data.password="";
            res.render("usuario/edit", { data: data, personas: personas });
        })
        .catch(err => {
            console.log(err);
        })
    })
    .catch(err=>{console.log(err)})

});

// Put Route
// Restful: PUT
// router.put("/:id", middleware.isValidProductoEdit, function (req, res) {
router.put("/:id",  middleware.isValidusuarioEdit, function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    bcrypt.hash(req.body.data.password, 10, function (err, hash) {
        req.body.data.password=hash;
        usuario.update(req.body.data, { where: { idUsuario: req.params.id } })
            .then(d => {
                res.redirect("/usuario/index");
            })
            .catch(err => {
                console.log(err);
            })
    });
});

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





module.exports = router;
