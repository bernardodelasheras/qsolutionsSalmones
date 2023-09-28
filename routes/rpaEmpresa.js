var express = require("express");
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
//var request = require("request");
//var bcrypt = require("bcrypt");
const rpaEmpresa = require("../models/rpaEmpresa");
var sequelize = require('../models/sequelizeConnection');

// Index Route
router.get("/index", middleware.isLoggedIn, function (req, res) {
    var sql = "SELECT idEmpresa, nombre, urlbuk, meses, usernamebuk, emaillog ";
    sql += " FROM rpaEmpresas"
    sequelize.query(sql)
    .then (data => {
        res.render("rpaEmpresa/index", { data: data[0] });
    })
    .catch (err =>{
        console.log(err);
    })
});

// Create Route
// Restful: CREATE
router.get("/new", middleware.isLoggedIn, function (req, res) {
    var data = {
        nombre: '',
        urlbuk: '',
        usernamebuk: '',
        passwordbuk: '',
        meses: 0,
        urldt: '',
        usernamedt: '',
        passworddt: '',
        emaillog: ''
    }
    res.render("rpaEmpresa/new", { data: data });
});

//router.post("/articulos", middleware.isValidProductoNew, function (req, res) {
router.post("/rpaEmpresas", middleware.isValidrpaEmpresaNew, function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    var item = {
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
    rpaEmpresa.create(item)
        .then(datanew => {
            res.redirect("/rpaEmpresa/index");
        })
        .catch(err => {
            console.log(err);
        })
});

// Edit Route
// Restful: EDIT
router.get("/:id/edit", middleware.isLoggedIn, function (req, res) {
    rpaEmpresa.findByPk(req.params.id)
        .then(data => {
            res.render("rpaEmpresa/edit", { data: data});
        })
        .catch(err => {
            console.log(err);
        })
});

// Put Route
// Restful: PUT
// router.put("/:id", middleware.isValidProductoEdit, function (req, res) {
router.put("/:id", middleware.isValidrpaEmpresaEdit, function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    rpaEmpresa.update(req.body.data, { where: { idEmpresa: req.params.id } })
        .then(d => {
            res.redirect("/rpaEmpresa/index");
        })
        .catch(err => {
            console.log(err);
        })
});

// router.get("/:id/delete", function (req, res) {
//     notaria.destroy({
//         where: { idNotaria: req.params.id }
//     })
//         .then(data => {
//             res.redirect("/notaria/index");
//         })
//         .catch(err => {
//             console.log(err);
//         })
// });


module.exports = router;
