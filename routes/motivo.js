var express = require("express");
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
const motivo = require("../models/motivo");
var sequelize = require('../models/sequelizeConnection');

// Index Route
router.get("/index", middleware.isLoggedIn, function (req, res) {
    leeMotivos()
        .then(data => {
            res.render("motivo/index", { data: data });
        })
        .catch(err => {
            console.log(err);
        })
});

// Create Route
// Restful: CREATE
router.get("/new", middleware.isLoggedIn, function (req, res) {
    var data = { codigo: '', glosa: ''};
    res.render("motivo/new", { data: data });
});

//router.post("/articulos", middleware.isValidProductoNew, function (req, res) {
router.post("/motivos", middleware.isValidMotivoNew, function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    motivo.create(req.body.data)
        .then(datanew => {
            res.redirect("/motivo/index");
        })
        .catch(err => {console.log(err)})
});


// Edit Route
// Restful: EDIT
router.get("/:id/edit", middleware.isLoggedIn, function (req, res) {
    motivo.findByPk(req.params.id)
        .then(data => {
            res.render("motivo/edit", { data: data });
        })
        .catch(err => {
            console.log(err);
        })
});

// Put Route
// Restful: PUT
// router.put("/:id", middleware.isValidProductoEdit, function (req, res) {
router.put("/:id", middleware.isValidMotivoEdit, function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    motivo.update(req.body.data, { where: { idMotivo: req.params.id } })
        .then(d => {
            res.redirect("/motivo/index");
        })
        .catch(err => {
            console.log(err);
        })

});

router.get("/:id/delete", middleware.isLoggedIn, function (req, res) {
    motivo.findByPk(req.params.id)
        .then(data => {
            res.render("motivo/delete", { data: data });
        })
        .catch(err => {
            console.log(err);
        })
});

router.delete("/:id", middleware.isValidMotivoDelete, function (req, res) {
    motivo.destroy({
        where: { idMotivo: req.params.id }
    })
        .then(d => {
            res.redirect("/motivo/index");
        })
        .catch(err => {
            console.log(err);
        })
});

var leeMotivos = function () {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "SELECT motivos.idMotivo,  "
        sql += "       motivos.codigo,  "
        sql += "       motivos.glosa, "
        sql += "       (select isnull(count(*),0)  "
        sql += "          from solicitudes  "
        sql += "         where solicitudes.idMotivo = motivos.idMotivo) cuenta "
        sql += "  FROM motivos "        
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
