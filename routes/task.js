var express = require("express");
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
const task = require("../models/task");
var request = require("request");
var bcrypt = require("bcrypt");
var sequelize = require('../models/sequelizeConnection');

// Index Route
router.get("/index", middleware.isLoggedIn, function (req, res) {
    var sql = "";
    sql += "select * from tasks "
    sql += "where (username = '" + req.session.username + "' or 'admin' = '" + req.session.username + "')"
    sequelize.query(sql)
        .then(data => {
            dias = [
                { dia: 0, glosa: 'Todos los días' },
                { dia: 2, glosa: 'Lunes' },
                { dia: 3, glosa: 'Martes' },
                { dia: 4, glosa: 'Miércoles' },
                { dia: 5, glosa: 'Jueves' },
                { dia: 6, glosa: 'Viernes' },
                { dia: 7, glosa: 'Sábado' },
                { dia: 1, glosa: 'Domingo' },
                { dia: 8, glosa: 'dia del mes '}
            ]
            data2 = [];
            data[0].forEach(e => {
                var t = JSON.parse(e.taskdata)
                if (t.dia == '0') {
                    t.dia = '7'
                }
                if (t.dia=='0-6') {
                    t.dia = '0'
                }
                if (t.dia=='*') {
                    t.dia = '8'
                }                
                var d = {
                    idTask: e.idTask, aplicacion: e.aplicacion, username: e.username,
                    hora: zfill(e.hora, 2), minuto: zfill(e.minuto, 2), dia: dias[t.dia].glosa  ,taskdata: e.taskdata
                }
                data2.push(d);
            });
            res.render("task/index", { data: data2, datajobs: global.tjobs });
        })
        .catch(err => {
            console.log(err);
        })
});

function zfill(number, width) {
    var numberOutput = Math.abs(number); /* Valor absoluto del número */
    var length = number.toString().length; /* Largo del número */
    var zero = "0"; /* String de cero */

    if (width <= length) {
        if (number < 0) {
            return ("-" + numberOutput.toString());
        } else {
            return numberOutput.toString();
        }
    } else {
        if (number < 0) {
            return ("-" + (zero.repeat(width - length)) + numberOutput.toString());
        } else {
            return ((zero.repeat(width - length)) + numberOutput.toString());
        }
    }
}



router.get("/:id/delete", function (req, res) {
    task.destroy({
        where: { idTask: req.params.id }
    })
        .then(data => {
            var job_element = tjobs.filter(t => t.id == req.params.id);
            job_element[0].job.destroy();

            global.tjobs = global.tjobs.filter(t => t.id !== req.params.id);
            res.redirect("/task/index");
        })
        .catch(err => {
            console.log(err);
        })
});


module.exports = router;
