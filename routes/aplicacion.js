var express = require("express");
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
const aplicacion = require("../models/aplicacion");

// Index Route
router.get("/index", middleware.isLoggedIn, function (req, res) {
    aplicacion.findAll({
        order: [['idAplicacion', 'asc']]
    })
        .then(data => {
            res.render("aplicacion/index", { data: data });
        })
        .catch(err => {
            console.log(err);
        })
});

// Create Route
// Restful: CREATE
router.get("/new", middleware.isLoggedIn, function (req, res) {
    var data = { descripcion: '', ruta: ''};
    res.render("aplicacion/new", { data: data });
});

//router.post("/articulos", middleware.isValidProductoNew, function (req, res) {
router.post("/aplicaciones", function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    var item = {descripcion: req.body.data.descripcion, ruta: req.body.data.ruta}
    aplicacion.create(item)
        .then(datanew => {
            res.redirect("/aplicacion/index");
        })
        .catch(err => {
            var errorList = [{ location: "create", param: "aplicacion", msg: err, value: "0" }]
            res.render("aplicacion/new", { data: item, errorList: errorList });
        })
});


// Edit Route
// Restful: EDIT
router.get("/:id/edit", middleware.isLoggedIn, function (req, res) {
    aplicacion.findByPk(req.params.id)
        .then(data => {
            data.password="";
            res.render("aplicacion/edit", { data: data });
        })
        .catch(err => {
            console.log(err);
        })
});

// Put Route
// Restful: PUT
// router.put("/:id", middleware.isValidProductoEdit, function (req, res) {
router.put("/:id", function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    aplicacion.update(req.body.data, { where: { idAplicacion: req.params.id } })
        .then(d => {
            res.redirect("/aplicacion/index");
        })
        .catch(err => {
            console.log(err);
        })

});

router.get("/:id/delete", middleware.isLoggedIn, function (req, res) {
    aplicacion.destroy({
        where: { idAplicacion: req.params.id }
    })
        .then(data => {
            res.redirect("/aplicacion/index");
        })
        .catch(err => {
            console.log(err);
        })
});



module.exports = router;
