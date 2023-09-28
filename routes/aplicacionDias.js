var express = require("express");
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
const aplicacionDias = require("../models/aplicacionDias");

// Index Route
router.get("/index", middleware.isLoggedIn, function (req, res) {
    aplicacionDias.findAll({
        order: [['idAplicacionDias', 'asc']]
    })
        .then(data => {
            res.render("aplicacionDias/index", { data: data });
        })
        .catch(err => {
            console.log(err);
        })
});

// Create Route
// Restful: CREATE
router.get("/new", middleware.isLoggedIn, function (req, res) {
    var data = { desde: 1, hasta: 31, ruta: ''};
    res.render("aplicacionDias/new", { data: data });
});

//router.post("/articulos", middleware.isValidProductoNew, function (req, res) {
router.post("/aplicaciones", function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    var item = {desde: req.body.data.desde, hasta: req.body.data.hasta, ruta: req.body.data.ruta}
    aplicacionDias.create(item)
        .then(datanew => {
            res.redirect("/aplicacionDias/index");
        })
        .catch(err => {
            var errorList = [{ location: "create", param: "aplicacionDias", msg: err, value: "0" }]
            res.render("aplicacionDias/new", { data: item, errorList: errorList });
        })
});


// Edit Route
// Restful: EDIT
router.get("/:id/edit", middleware.isLoggedIn, function (req, res) {
    aplicacionDias.findByPk(req.params.id)
        .then(data => {
            res.render("aplicacionDias/edit", { data: data });
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
    aplicacionDias.update(req.body.data, { where: { idAplicacionDias: req.params.id } })
        .then(d => {
            res.redirect("/aplicacionDias/index");
        })
        .catch(err => {
            console.log(err);
        })

});

router.get("/:id/delete", middleware.isLoggedIn, function (req, res) {
    aplicacionDias.destroy({
        where: { idAplicacion: req.params.id }
    })
        .then(data => {
            res.redirect("/aplicacionDias/index");
        })
        .catch(err => {
            console.log(err);
        })
});



module.exports = router;
