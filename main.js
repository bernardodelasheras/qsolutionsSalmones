var express = require("express")
var bodyParser = require("body-parser")
var methodOverride = require("method-override")
var passport = require("passport")
var expressSanitizer = require("express-sanitizer")
var app = express()
var expressValidator = require("express-validator")
var flash = require("connect-flash")
var task = require("./models/task")
var { promiseImpl } = require("ejs")


// const sequelize = new Sequelize('testdb', 'bdelasheras', 'b2rn1rd4$$##', {
//     host: 'testdbbdd.database.windows.net',
//     dialect: 'mssql',
//     dialectOptions: {
//         encrypt: true
//     }
// });

// sequelize
//     .authenticate()
//     .then(() => {
//         console.log('Connection has been established successfully.');
//     })
//     .catch(err => {
//         console.error('Unable to connect to the database:', err);
//     });

require('dotenv').config({ path: 'variables.env' });

var rutEmpresa = process.env.RUTEMPRESA;

app.use(require("express-session")({
    secret: "zp7777",
    resave: false,
    saveUninitialized: false

}));

// Models

// var password="123456";
// var saltRounds=10;
// bcrypt.hash(password,saltRounds, function (err, hash) { 
//     var usuario = require("./models/usuario");
//     usuario.create(
//         {
//             nombre: 'Bernardo de las Heras',
//             username: 'bdelasheras',
//             password: hash,
//             email: 'bernardodelasheras@gmail.com'
//         }).then((r) => {
//             console.log("created: " + r);
//         }).catch((err) => {
//             console.log(err);
//         });
// });

var usuario = require("./models/usuario");
var bukPersona = require("./models/bukPersona");
var valores = require("./models/valores");
var solicitudes = require("./models/solicitudes");
var solicitudesEstado = require("./models/solicitudesEstado");
var solicitudesConfig = require("./models/solicitudesConfig");
var aplicacionDias = require("./models/aplicacionDias");

var wf_fase = require("./models/wf_fase");
var wf_hito = require("./models/wf_hito");
var wf_proyecto = require("./models/wf_proyecto");
var wf_movimiento = require("./models/wf_movimiento");
var wf_observacion = require("./models/wf_observacion");
var wf_tipoProceso = require("./models/wf_tipoProceso");
var wf_estadosCarOfeExcluir = require("./models/wf_estadosCarOfeExcluir");
var wf_hitoNotaria = require("./models/wf_hitoNotaria");
var wf_cartaRepertorio = require("./models/wf_cartaRepertorio");
var wf_smaforo = require("./models/wf_semaforo");
var notariaEstado = require("./models/notariaEstado");
var rpaEmpresa = require("./models/rpaEmpresa");
var bukPersona = require("./models/bukPersona");
var dominio = require("./models/dominio");
// dominio.create({
//     nombre:'ROOT'
// })
// wf_estadosCarOfeExcluir.create({
//     DocEstado: 6
// })
// wf_estadosCarOfeExcluir.create({
//     DocEstado: 7
// })

// var robot = require("./models/robot");        
// robot.create(
//     {
//         codigo: 1,
//         descripcion: 'gesnotpro'
//     }).then((r)=>{
//        console.log("created: "+r); 
//     }).catch((err)=>{
//        console.log(err);
//     });

// var unimed = require("./models/unimed");        
// unimed.create(
//     {
//         descripcion: 'unidad'
//     }).then((r)=>{
//        console.log("created: "+r); 
//     }).catch((err)=>{
//        console.log(err);
//     });

// unimed.create(
//     {
//         descripcion: 'kilo'
//     }).then((r) => {
//         console.log("created: " + r);
//     }).catch((err) => {
//         console.log(err);
//     });

var rpaEmpleadosNoVigente = require("./models/rpaEmpleadosNoVigente");


app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.locals.moment = require('moment');
app.locals.moment = require('moment-timezone');
app.locals.moment.tz.setDefault('UTC');

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator());


var timeOut = 240 * 60 * 1000;
app.use(function (req, res, next) {
    if (req.session.username) {
        res.locals.usuarioActual = { username: req.session.username };
    } else {
        res.locals.usuarioActual = req.user;
    }

    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.errorList = req.flash("errorList");

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");

    req.setTimeout(timeOut, () => {
        var err = "Time Out";
        console.log(err);
        next(err);
    });

    res.setTimeout(timeOut, () => {
        var err = "Time Out";
        console.log(err);
        next(err);
    });

    next();
});




// var configuracionRoutes = require("./routes/configuracion");
// app.use("/configuracion", configuracionRoutes);

var comprobanteIngresoRoutes = require("./routes/comprobanteIngreso");
app.use("/comprobanteIngreso", comprobanteIngresoRoutes);


var usuarioRoutes = require("./routes/usuario");
app.use("/usuario", usuarioRoutes);

var aplicacionRoutes = require("./routes/aplicacion");
app.use("/aplicacion", aplicacionRoutes);

var aplicacionDiasRoutes = require("./routes/aplicacionDias");
app.use("/aplicacionDias", aplicacionDiasRoutes);

var privilegioRoutes = require("./routes/privilegio");
app.use("/privilegio", privilegioRoutes);

var usuarioCargoRoutes = require("./routes/usuarioCargo");
app.use("/usuarioCargo", usuarioCargoRoutes);

var motivoRoutes = require("./routes/motivo");
app.use("/motivo", motivoRoutes);

var valoresRoutes = require("./routes/valores");
app.use("/valores", valoresRoutes);

var periodosRoutes = require("./routes/periodos");
app.use("/periodos", periodosRoutes);


var solicitudesConfigRoutes = require("./routes/solicitudesConfig");
app.use("/solicitudesConfig", solicitudesConfigRoutes);

var solicitudesRoutes = require("./routes/solicitudes");
app.use("/solicitudes", solicitudesRoutes);

var solicitudesConf2Routes = require("./routes/solicitudesConf2");
app.use("/solicitudesConf2", solicitudesConf2Routes);

var solicitudesRptRoutes = require("./routes/solicitudesRpt");
app.use("/solicitudesRpt", solicitudesRptRoutes);

var { agendaAPIBukRoutes, reprogramaAgendaAPIBuk } = require("./routes/agendaAPIBuk");
app.use("/agendaAPIBuk", agendaAPIBukRoutes);

var { agendaAPILiquidacionRoutes, reprogramaAgendaAPILiquidacion } = require("./routes/agendaAPILiquidacion");
app.use("/agendaAPILiquidacion", agendaAPILiquidacionRoutes);

var { agendaCargaRoutes, reprogramaAgendaCarga } = require("./routes/agendaCarga");
app.use("/agendaCarga", agendaCargaRoutes);

var { agendaRPAbukRoutes, reprogramaAgendaRPAbuk } = require("./routes/agendaRPAbuk");
app.use("/agendaRPAbuk", agendaRPAbukRoutes);

var { agendaMyAreasRoutes, reprogramaagendaMyAreas } = require("./routes/agendaMyAreas");
app.use("/agendaMyAreas", agendaMyAreasRoutes);

var { agendaRPAbukFiniquitosRoutes, reprogramaAgendaRPAbukFiniquitos } = require("./routes/agendaRPAbukFiniquitos");
app.use("/agendaRPAbukFiniquitos", agendaRPAbukFiniquitosRoutes);

var { agendaRPAdtRoutes, reprogramaAgendaRPAdt } = require("./routes/agendaRPAdt");
app.use("/agendaRPAdt", agendaRPAdtRoutes);

var { agendaRPAdtFiniquitosRoutes, reprogramaAgendaRPAdtFiniquitos } = require("./routes/agendaRPAdtFiniquitos");
app.use("/agendaRPAdtFiniquitos", agendaRPAdtFiniquitosRoutes);

var olapEmpresaRoutes = require("./routes/olapEmpresa");
app.use("/olapEmpresa", olapEmpresaRoutes);

var tokenRoutes = require("./routes/token");
app.use("/token", tokenRoutes);

var taskRoutes = require("./routes/task");
app.use("/task", taskRoutes);

var rpaEmpresaRoutes = require("./routes/rpaEmpresa");
app.use("/rpaEmpresa", rpaEmpresaRoutes);

var indexRoutes = require("./routes/index");
const { session } = require("passport");
app.use(indexRoutes);

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});


//******************************************************
app.get("*", function (req, res) {
    res.send("<h1>Mensaje por defecto desde Node</h1>");
});

var Port = process.env.PORT || "9999";
var Ip = process.env.HOST || '0.0.0.0';

app.listen(Port, Ip, function () {
    console.log("Servidor ha Iniciado...");
    console.log("Port..." + Port);
    console.log("IP..." + Ip);

    global.tjobs = [];
    procesaTareas()
        .then(d => {
            console.log(global.tjobs.length)
        })
        .catch(err => {
            console.log(err)
        })
});

var procesaTareas = function () {
    return new Promise(function (resolve, reject) {
        task.findAll({
            order: [['idTask', 'asc']]
        })
            .then(data => {
                data.forEach(e => {
                    if (e.aplicacion === 'APIBuk') {
                        reprogramaAgendaAPIBuk(JSON.parse(e.taskdata), e.idTask);
                    }
                    if (e.aplicacion === 'APILiquidacion') {
                        reprogramaAgendaAPILiquidacion(JSON.parse(e.taskdata), e.idTask);
                    }
                    if (e.aplicacion === 'RPAbuk') {
                        reprogramaAgendaRPAbuk(JSON.parse(e.taskdata), e.idTask);
                    }
                    if (e.aplicacion === 'RPAbukFiniquitos') {
                        reprogramaAgendaRPAbukFiniquitos(JSON.parse(e.taskdata), e.idTask);
                    }
                    if (e.aplicacion === 'RPAdt') {
                        reprogramaAgendaRPAdt(JSON.parse(e.taskdata), e.idTask);
                    }
                    if (e.aplicacion === 'RPAdtFiniquitos') {
                        reprogramaAgendaRPAdtFiniquitos(JSON.parse(e.taskdata), e.idTask);
                    }
                    if (e.aplicacion === "CargaSolicitudes"){
                        reprogramaAgendaCarga(JSON.parse(e.taskdata), e.idTask)
                    }
                    if (e.aplicacion === "MyAreas"){
                        reprogramaagendaMyAreas(JSON.parse(e.taskdata), e.idTask)
                    }
                })
                resolve(data);
            })
            .catch(err => {
                reject(err);
            });
    });
};







