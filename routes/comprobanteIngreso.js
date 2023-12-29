const { promiseImpl } = require("ejs");
var express = require("express");
const cron = require('node-cron');
var moment = require("moment");
var nodemailer = require('nodemailer');
var router = express.Router({ mergeParams: true });
var middleware = require("../middleware");
var sequelizeFin700 = require('../models/sequelizeConnectionFin700');
var sequelize = require('../models/sequelizeConnection');
var task = require('../models/task');
const compressing = require('compressing');
const Excel = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: 'variables.env' });
var timeZone = process.env.TIMEZONE;
var mailServer = process.env.MAIL_SERVER;
var mailUsu = process.env.MAIL_USUARIO;
var mailPwd = process.env.MAIL_CONTRASENA;
var mailPort = process.env.MAIL_SMTPPORT;

//router.get("/index", middleware.isLoggedIn, function (req, res) {
router.get("/index", function (req, res) {
    let dIni = new Date()
    dIni.setDate(dIni.getDate()-30)
    fIni = dIni.toLocaleString().split(' ')[0].split('-')
    dia = '16'
    mes = fIni[1]
    ano = fIni[2]
    let fechaDesde = ano + '-' + mes + '-' + dia

    let dFin = new Date()
    dFin.setDate(dIni.getDate())
    fFin = dFin.toLocaleString().split(' ')[0].split('-')
    dia = '15'
    mes = fFin[1]
    ano = fFin[2]
    let fechaHasta = ano + '-' + mes + '-' + dia



    let data = {fechadesde: fechaDesde, fechahasta: fechaHasta}

    let isMobile = req.session.isMobile
    if (!isMobile) {
        res.render("solicitudesRpt/index", { data: data })
    } else {
        res.render("solicitudesRpt/indexMobile", { data: data })
    }
    
});

router.post("/index", function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    var taskdata = {
        fechadesde: req.body.data.fechadesde, 
        fechahasta: req.body.data.fechahasta, 
        sessionID: req.sessionID
    }
    procesaConsulta('grilla', req, res, taskdata);
});

var printHeader = async function (doc) {


}


router.post("/indexPdf", middleware.isLoggedIn, async function (req, res) {
    var doc = new PDFDocument({ size: 'LETTER', margin: 50 });
    // Stream the PDF to a file
    const outputPath = 'tmp/invoice.pdf';
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);
  
  
      // Page Header
  
      // Add content to the PDF
      doc.image('public/Salmones.jpeg', 50, 50, { width: 100, height: 50 });
      doc.fontSize(8).text('NOTIFICACION DE PAGO', { align: 'center', underline: 1 });
    
      // Header Information
      doc.fontSize(6);
      doc.lineGap(3).text('Número: 10125',500);
      doc.lineGap(3).text('Fecha: 24/07/2023');
    
      doc.lineGap(3).text('Empresa: Salmones Pacific Star S.A. / Trusal S.A. / ComSur Ltda.',50);
      doc.lineGap(3).text(' ')
      doc.lineGap(3).text('Para: Tesorería, Contabilidad, Gerencia Comercial')
      doc.lineGap(3).text('Emitida Por: MARIA JOSE ASTUDILLO PEREZ')
      doc.lineGap(3).text(' ')
      doc.fontSize(7).lineGap(3).text('FACTURAS QUE PAGA', { align: 'center'})
    
      // Table Header
      const tableHeaders = ['Nº Factura','Fecha Factura','Flete','RUT','Cliente','Moneda','Monto Factura','Monto Pago'];
    
       // Table setup
       var tableTop = 190;
       var tableLeft = 50;
       var rowHeight = 20;
       var colWidth = 65;
       var cellPadding = 10;
     
       // Draw table headers
       doc.lineWidth(0.5).rect(tableLeft, tableTop, (colWidth * tableHeaders.length)+10, rowHeight).stroke();
       doc.fontSize(5);
       tableHeaders.forEach((header, index) => {
         doc.fontSize(7).text(header, tableLeft + index * colWidth, tableTop + cellPadding, { width: colWidth, align: 'center' });
       });
    
  
      // Page Header
    
      
    // Sample Table Data (you can replace this with your actual data)
    var totFactura=0.0
    var totPago=0.0
    var tableData = []

    var valorFactura = 180695
    var valorPago = 180540
    var fila = ['6712', 
                '05/06/2023', 
                '0', 
                '5393-7', 
                'MIDA FOODS', 
                'dólar', 
                '$ '+formatNumber(valorFactura), 
                '$ '+formatNumber(valorPago)]
    for (var i = 0;i < 19; i++) {
          tableData.push(fila)
          totFactura += 180695
          totPago += 180540
    }

    var valorFactura = 8069
    var valorPago = 8054
    totFactura += valorFactura
    totPago += valorPago
var fila = ['6712', 
                '05/06/2023', 
                '0', 
                '5393-7', 
                'MIDA FOODS', 
                'dólar', 
                '$ '+formatNumber(valorFactura), 
                '$ '+formatNumber(valorPago)]
    tableData.push(fila)
    
    var lineas=0
    // Draw table rows
    doc.fontSize(5);
    tableData.forEach(async (rowData, rowIndex) => {
  
      if (lineas >= 20) {
  
          // Page Header
          doc.addPage({ size: 'LETTER', margin: 50 });
          // Add content to the PDF
          doc.image('public/Salmones.jpeg', 50, 50, { width: 100, height: 50 });
          doc.fontSize(8).text('NOTIFICACION DE PAGO', { align: 'center', underline: 1 });
      
          // Header Information
          doc.fontSize(6);
          doc.lineGap(3).text('Número: 10125',500);
          doc.lineGap(3).text('Fecha: 24/07/2023');
      
          doc.lineGap(3).text('Empresa: Salmones Pacific Star S.A. / Trusal S.A. / ComSur Ltda.',50);
          doc.lineGap(3).text(' ')
          doc.lineGap(3).text('Para: Tesorería, Contabilidad, Gerencia Comercial')
          doc.lineGap(3).text('Emitida Por: MARIA JOSE ASTUDILLO PEREZ')
          doc.lineGap(3).text(' ')
          doc.fontSize(7).lineGap(3).text('FACTURAS QUE PAGA', { align: 'center'})
      
          // Table Header
          const tableHeaders = ['Nº Factura','Fecha Factura','Flete','RUT','Cliente','Moneda','Monto Factura','Monto Pago'];
      
          // Table setup
          tableTop = 190;
          tableLeft = 50;
          rowHeight = 20;
          colWidth = 65;
          cellPadding = 10;
      
          // Draw table headers
          doc.lineWidth(0.5).rect(tableLeft, tableTop, (colWidth * tableHeaders.length)+10, rowHeight).stroke();
          doc.fontSize(5);
          tableHeaders.forEach((header, index) => {
             doc.fontSize(7).text(header, tableLeft + index * colWidth, tableTop + cellPadding, { width: colWidth, align: 'center' });
          });
      
  
          // Page Header
          lineas = 0
      }
      const yPos = tableTop + rowHeight + lineas * rowHeight;
      posyL = 0
      lineas++
      doc.lineWidth(0.2).rect(tableLeft, yPos, (colWidth * tableHeaders.length) + 10, rowHeight).stroke();
      rowData.forEach((cellData, colIndex) => {
        if (colIndex > 5) {
            doc.fontSize(6).text(cellData, tableLeft + colIndex * colWidth, yPos + cellPadding, { width: colWidth, align: 'right'});
        } else {
            doc.fontSize(6).text(cellData, tableLeft + colIndex * colWidth, yPos + cellPadding, { width: colWidth, align: 'center' });
        }
      });
    });
  
    // Footer Information
    doc.fontSize(5);
    
    const tableFooter = ['', '', '', '', '', '', '$ '+formatNumber(totFactura), '$ '+formatNumber(totPago)];
    
    var yPos = tableTop + rowHeight + lineas * rowHeight
    cellPadding=10
    tableFooter.forEach((header, index) => {
        if (index<5) {
           doc.fontSize(6).text(header, tableLeft + index * colWidth, yPos + cellPadding, { width: colWidth, align: 'center' });
        } else {
           doc.fontSize(6).text(header, tableLeft + index * colWidth, yPos + cellPadding, { width: colWidth, align: 'right' });
        }
    });
    lineas=lineas+2
    
    doc.text(' ',50)
    doc.fontSize(7).lineGap(3).text('Datos del Pago', { align: 'center'})

    yPos = tableTop + rowHeight + lineas * rowHeight
    rowHeight=60
    doc.lineWidth(0.2).rect(tableLeft, yPos, (colWidth * tableHeaders.length) + 10, rowHeight).stroke();

    yPos += 5
    doc.text('Fecha Recepción: 24/07/2023',80, yPos, {lineBreak: false})
    doc.text('Fecha Documento: Detalle',400)
    yPos += 10
    doc.text('Tipo de Pago: Depósito',80, yPos, {lineBreak: false})
    doc.text('Nº Documento: Detalle',400)
    yPos += 10
    doc.text('Banco: BCI',80, yPos, {lineBreak: false})
    doc.text('Moneda Pago: DOLAR',400)
    yPos += 10
    doc.text(' ',80, yPos, {lineBreak: false})
    doc.text('Monto Recibido: '+'US$ '+formatNumber(totPago),400)
    yPos += 10
    doc.text(' ',80, yPos, {lineBreak: false})
    doc.text('GTO: -155,00',400)

    doc.text(' ',50)
    doc.fontSize(7).lineGap(3).text('Observaciones', { align: 'center'})

    
    yPos += 30
    rowHeight=40
    doc.lineWidth(0.2).rect(tableLeft, yPos, (colWidth * tableHeaders.length) + 10, rowHeight).stroke();


    // Finalize the PDF and end the stream
    doc.end();
  
    console.log('PDF generated successfully at', outputPath);
    res.redirect("/solicitudesRpt/index")

  });

const formatNumber = (num, decimals) => num.toLocaleString('de-DE', {
    maximunSignificantDigits: 14,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fijaLargo = function (n,largo) {
    var faltan = largo - n.length
    var partes = n.split(' ')
    for (var i=0; i<faltan; i++) {
        partes[0] += ' '
    }
    return partes.join(' ')
}    

router.post("/generaexcel", function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);

    var empid = req.body.data.empid;
    var empid = req.body.data.empid;
    var proyectos = "";
    if (typeof (req.body.data.proyectos) === 'object') {
        req.body.data.proyectos.forEach(function (p) {
            proyectos += p + ','
        });
        proyectos = proyectos.substr(0, proyectos.length - 1);
    } else {
        proyectos = req.body.data.proyectos;
    }

    dias = [
        { dia: 0, glosa: 'Todos los días' },
        { dia: 2, glosa: 'Lunes' },
        { dia: 3, glosa: 'Martes' },
        { dia: 4, glosa: 'Miércoles' },
        { dia: 5, glosa: 'Jueves' },
        { dia: 6, glosa: 'Viernes' },
        { dia: 7, glosa: 'Sábado' },
        { dia: 1, glosa: 'Domingo' }
    ]

    data = {
        empid: empid, proyectos:proyectos, 
        destinatarios: req.session.useremail, hora: 1, minuto: 0, dias: dias
    }
    res.render("wf_reporteDetallado/indexPrograma", { data: data });

});

router.post("/programa", function (req, res) {
    
    req.body.data.body = req.sanitize(req.body.data.body);
    var diaCron = "";
    if (req.body.data.dia == 0) {
        diaCron = "0-6";
    } else {
        diaCron = (Number(req.body.data.dia) - 1).toString();
    }

    var taskdata = {
        dia: diaCron,
        fecha: req.body.data.fecha, 
        sessionID: req.sessionID
    }
    var cronTime = req.body.data.minuto + ' ' + req.body.data.hora + ' * * ' + diaCron
    var job = cron.schedule(cronTime, function () {
        console.log('Inicio Ejecución Programada ReporteDetallado Workflow todos los días a las ' + taskdata.hora + ':' + taskdata.minuto);
        console.log('req.body.data.empid ' + taskdata.empid);
        procesaConsulta('excel', req, res, taskdata);
    }, {
        scheduled: true,
        timezone: timeZone
    });


    var item = {
        aplicacion: 'wf_reporteDetallado', username: req.session.username,
        hora: req.body.data.hora, minuto: req.body.data.minuto,
        taskdata: JSON.stringify(taskdata), res: ''
    }
    task.create(item)
        .then(datanew => {
            global.tjobs.push({id: datanew.idTask, job: job});
            console.log('tarea guardada');
        })
        .catch(err => {
            console.log(err);
        })
    res.redirect("/wf_reporteDetallado/index");
})


var reprograma = function (taskdata, idTask) {
    var job = cron.schedule(taskdata.minuto + ' ' + taskdata.hora + ' * * ' + taskdata.dia, function () {
        console.log('Inicio Ejecución Programada ReporteDetallado Workflow todos los días a las ' + taskdata.hora + ':' + taskdata.minuto);
        console.log('req.body.data.empid ' + taskdata.empid);
        procesaConsulta('excel', null, null, taskdata);
    }, {
        scheduled: true,
        timezone: timeZone
    });
    global.tjobs.push({ id: idTask, job: job });
}


function procesaConsulta(tipoConulta, req, res, taskdata) {

    var returnMessage = "";
    sequelize.query('solicitudesRptv2 :param1, :param2, :param3',
        {
            replacements: { param1: taskdata.fechadesde, param2: taskdata.fechahasta, param3: returnMessage },
            type: sequelize.QueryTypes.SELECT
        })
        .then(data => {
            console.log("Procedimiento Procesado");
            if (tipoConulta == 'excel') {
                generaExcel(data, req, res, taskdata);
            } else {
                var headers = "";
                if (data.length > 0) {
                    Object.getOwnPropertyNames(data[0]).forEach(function (n) {
                        headers += '<th>' + n + '</th>';
                    });
                } else {
                    headers = "No hay Datos Para Mostrar"
                }
                let isMobile = req.session.isMobile
                if (!isMobile) {
                    res.render("solicitudesRpt/indexReporte", { data: data, headers: headers });
                } else {
                    res.render("solicitudesRpt/indexReporteMobile", { data: data, headers: headers });
                }
                
            }

        })
        .catch(err => {
            console.log(err);
        });

}

function generaExcel(data, req, res, taskdata) {
    var ses = Date.now();
    var nombreArchivo = 'tmp/ReporteDetalladoWorkflow_' + ses + '.csv'
    const fs = require('fs');

    let writeStream = fs.createWriteStream(nombreArchivo);
    var headers = "";
    Object.getOwnPropertyNames(data[0]).forEach(function (n) {
        headers += '"' + n + '";';
    });
    writeStream.write(headers + "\n", "ascii");

    data.forEach(function (d) {

        var linea = "";
        Object.getOwnPropertyNames(d).forEach(function (val, idx, array) {
            if (typeof d[val] === 'number') {
                valor = d[val].toString().replace('.', ',');
            } else {
                if (d[val] != null) {
                    valor = d[val].toString();
                } else {
                    valor = ' ';
                }
            }
            linea += '"' + valor + '";';
        });
        writeStream.write(linea + "\n", "ascii");
    });

    writeStream.end();

    writeStream.on("finish", () => {
        var nombrecomprimido = nombreArchivo + ".zip"
        compressing.gzip.compressFile(nombreArchivo, nombrecomprimido)
            .then(() => {
                console.log('Archivo excel generado en ' + nombreArchivo);
                enviaCorreo(nombrecomprimido, req, res, taskdata);
            })
            .catch((err) => { console.log("error compresion " + err) });
    })
}

function enviaCorreo(nombreArchivo, req, res, taskdata) {

    const transporter = nodemailer.createTransport({
        host: mailServer,
        port: mailPort,
        ignoreTLS: false,
        secure: true,
        auth: {
            user: mailUsu,
            pass: mailPwd
        }
    });

    var mailOptions = {
        from: mailUsu,
        to: taskdata.destinatarios,
        subject: 'ReporteDetallado Workflow',
        text: 'ReporteDetallado Workflow',
        attachments: [{
            filename: 'ReporteWorkflow.csv.zip',
            path: nombreArchivo,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }]
    };

    transporter.sendMail(mailOptions, function (err, info) {
        if (err) {
            console.log(err);

        } else {
            console.log('correo enviado');
        }
    });

}

router.get("/proyectos/:empid/:user", function (req, res) {
    var empid = req.params.empid;
    var user = req.params.user;
    leeProyectos(empid, user)
        .then(data => {
            res.status(200).json(
                {
                    data
                }
            );

        });
});


var leeProyectos = function (empid, usuario) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select d.tprid, rtrim(d.tprglosa) tprglosa from glbt_tiposproyectos d inner join"
        sql += "   InmT_InmuebleProyecto p on p.ptprid = d.tprid inner join"
        sql += "   GlbT_UsuEmpDiv e on e.pempid = p.pempid and"
        sql += "                       e.DivCodigo = p.DivCodigo and"
        sql += "                       e.fld_UserCode ='" + usuario + "'"
        sql += "  where p.pEmpId =" + empid
        sql += "  group by d.tprid, d.tprglosa"
        sql += "  order by tprid desc"
        sequelizeFin700.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeEmpresas = function () {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select b.empid, a.EntRazonSocial, a.EntRut from glbt_entidad a, glbt_empresas b"
        sql += " where a.entid = b.pentid "
        sequelizeFin700.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var fmtNumber = function (num, largo) {
    var n= num.toString()
    var i = 1
    while (n.length < largo) {
        n = '0' + n
    }
    return n
}


module.exports = router;