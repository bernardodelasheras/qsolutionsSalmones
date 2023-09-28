var express = require("express");
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
const periodos = require("../models/periodos");
var sequelize = require('../models/sequelizeConnection');

// Index Route
router.get("/index", middleware.isLoggedIn, function (req, res) {
    leePeriodos()
        .then(data => {
            res.render("periodos/index", { data: data });
        })
        .catch(err => {
            console.log(err);
        })
});

// Create Route
// Restful: CREATE
router.get("/new", middleware.isLoggedIn, function (req, res) {
    var data = { periodo: 0};
    res.render("periodos/new", { data: data });
});

//router.post("/articulos", middleware.isValidProductoNew, function (req, res) {
router.post("/periodos", middleware.isValidPeriodosNew, function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    periodos.create(req.body.data)
        .then(datanew => {
            res.redirect("/periodos/index");
        })
        .catch(err => {console.log(err)})
});


// Edit Route
// Restful: EDIT
router.get("/:id/edit", middleware.isLoggedIn, function (req, res) {
    periodos.findByPk(req.params.id)
    .then(data => {
        res.render("periodos/edit", { data: data });
    })
    .catch(err => {
        console.log(err);
    })
});

// Put Route
// Restful: PUT
// router.put("/:id", middleware.isValidProductoEdit, function (req, res) {
router.put("/:id", middleware.isValidPeriodosEdit, function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    periodos.update(req.body.data, { where: { id: req.params.id } })
        .then(d => {
            res.redirect("/periodos/index");
        })
        .catch(err => {
            console.log(err);
        })

});

router.get("/:id/delete", middleware.isLoggedIn, function (req, res) {
    periodos.findByPk(req.params.id)
    .then(data => {
        res.render("periodos/delete", { data: data });
    })
    .catch(err => {
        console.log(err);
    })
});

//router.delete("/:id", middleware.isValidValoresDelete, function (req, res) {
router.delete("/:id", function (req, res) {
    periodos.destroy({
        where: { id: req.params.id }
    })
        .then(d => {
            res.redirect("/periodos/index");
        })
        .catch(err => {
            console.log(err);
        })
});


var leePeriodos = function () {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select id, periodo "
        sql += "   from periodos"
        sql += "   order by periodo "
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
