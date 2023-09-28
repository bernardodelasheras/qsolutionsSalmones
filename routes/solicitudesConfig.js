var express = require("express");
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
const solicitudesConfig = require("../models/solicitudesConfig");

// Index Route
router.get("/index", middleware.isLoggedIn, function (req, res) {
    solicitudesConfig.findAll({ order: [['id', 'asc']] })
        .then(data => {
            res.render("solicitudesConfig/index", { data: data });
        })
        .catch(err => {
            console.log(err);
        })
});


// Edit Route
// Restful: EDIT
router.get("/:id/edit", middleware.isLoggedIn, function (req, res) {
    solicitudesConfig.findByPk(req.params.id)
        .then(data => {
            res.render("solicitudesConfig/edit", { data: data });
        })
        .catch(err => {
            console.log(err);
        })
});

// Put Route
// Restful: PUT
// router.put("/:id", middleware.isValidProductoEdit, function (req, res) {
router.put("/:id", middleware.isValidsolicitudesConfigEdit, function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    solicitudesConfig.update(req.body.data, { where: { id: req.params.id } })
        .then(d => {
            res.redirect("/solicitudesConfig/index");
        })
        .catch(err => {
            console.log(err);
        })

});



module.exports = router;
