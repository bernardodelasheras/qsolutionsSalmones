var express = require("express");
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
const valores = require("../models/valores");
var sequelize = require('../models/sequelizeConnection');

// Index Route
router.get("/index", middleware.isLoggedIn, function (req, res) {
    leeValores()
        .then(data => {
            res.render("valores/index", { data: data });
        })
        .catch(err => {
            console.log(err);
        })
});

// Create Route
// Restful: CREATE
router.get("/new", middleware.isLoggedIn, function (req, res) {
    leeCargos()
    .then(cargos=>{
        var data = { idCargo: 0, Sindicalizado: 0, noSindicalizado: 0};
        res.render("valores/new", { data: data, cargos: cargos });
    })
    .catch(err=>{console.log(err)})
});

//router.post("/articulos", middleware.isValidProductoNew, function (req, res) {
router.post("/valores", middleware.isValidValoresNew, function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    valores.create(req.body.data)
        .then(datanew => {
            res.redirect("/valores/index");
        })
        .catch(err => {console.log(err)})
});


// Edit Route
// Restful: EDIT
router.get("/:id/edit", middleware.isLoggedIn, function (req, res) {
    leeCargos()
    .then(cargos=>{
        valores.findByPk(req.params.id)
        .then(data => {
            res.render("valores/edit", { data: data, cargos: cargos });
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
router.put("/:id", middleware.isValidValoresEdit, function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    valores.update(req.body.data, { where: { idValores: req.params.id } })
        .then(d => {
            res.redirect("/valores/index");
        })
        .catch(err => {
            console.log(err);
        })

});

router.get("/:id/delete", middleware.isLoggedIn, function (req, res) {
    leeCargos()
    .then(cargos=>{
        valores.findByPk(req.params.id)
        .then(data => {
            res.render("valores/delete", { data: data, cargos: cargos });
        })
        .catch(err => {
            console.log(err);
        })
    })
    .catch(err=>{console.log(err)})
});

router.delete("/:id", middleware.isValidValoresDelete, function (req, res) {
    valores.destroy({
        where: { idValores: req.params.id }
    })
        .then(d => {
            res.redirect("/valores/index");
        })
        .catch(err => {
            console.log(err);
        })
});

var leeCargos = function () {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select idCargo, nombre "
        sql += "   from cargos "
        sql += "   order by nombre "
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeValores = function () {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select a.idValores, a.idCargo, b.nombre, a.Sindicalizado, a.noSindicalizado "
        sql += "   from valores a join"
        sql += "        cargos b on a.idCargo = b.idCargo"
        sql += "   order by b.nombre "
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
