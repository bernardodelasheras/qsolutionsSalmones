var express = require("express");
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
const token = require("../models/token");
var request = require("request");
var bcrypt = require("bcrypt");

// Index Route
router.get("/index", middleware.isLoggedIn, function (req, res) {
    token.findAll({
        where: { usuario: req.session.username}
    })
        .then(data => {
            res.render("token/index", { data: data });
        })
        .catch(err => {
            console.log(err);
        })
});
// Create Route
// Restful: CREATE
router.get("/new", middleware.isLoggedIn, function (req, res) {
    var token = "";
    require('crypto').randomBytes(48, function (err, buffer) {
        if (err) {
            console.log(err)
        } else {
            token = buffer.toString('hex');
            var data = { usuario: req.session.username, token: token, api: '' };
            res.render("token/new", { data: data });
        }
    });
});

//router.post("/articulos", middleware.isValidProductoNew, function (req, res) {
router.post("/tokens", function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    var data = {usuario: req.body.data.usuario, token: req.body.data.token, api: req.body.data.api};
    token.create(data)
        .then(datanew => {
            res.redirect("/token/index");
        })
        .catch(err => {
            console.log(err);
        })
});

router.get("/:id/delete", function (req, res) {
    token.destroy({
        where: { idToken: req.params.id }
    })
        .then(data => {
            res.redirect("/token/index");
        })
        .catch(err => {
            console.log(err);
        })
});

module.exports = router;
