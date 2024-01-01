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
router.get("/index", middleware.isLoggedIn, function (req, res) {
    let dIni = new Date()
    dIni.setDate(dIni.getDate()-30)
    fIni = dIni.toLocaleString().split(' ')[0].split('-')
    dia = '01'
    mes = fIni[1]
    ano = fIni[2]
    let fechaDesde = ano + '-' + mes + '-' + dia

    let dFin = new Date()
    dFin.setDate(dIni.getDate())
    fFin = dFin.toLocaleString().split(' ')[0].split('-')
    dia = fFin[0]
    mes = fFin[1]
    ano = fFin[2]
    let fechaHasta = ano + '-' + mes + '-' + dia

    leeEmpresas()
        .then(empresas => {
    
            let data = {fechadesde: fechaDesde, fechahasta: fechaHasta, 
                        CabOpeNumeroDesde: 0, CabOpeNumeroHasta: 0, empid: 14, 
                        empresas: empresas}

            let isMobile = req.session.isMobile
            if (!isMobile) {
                res.render("comprobanteIngreso/index", { data: data })
            } else {
                res.render("solicitudesRpt/indexMobile", { data: data })
            }
        
        })
        .catch(err => {
            console.log(err);
        })

});

router.post("/indexdetalle", middleware.isLoggedIn, function (req, res) {
    req.body.data.body = req.sanitize(req.body.data.body);
    var parametros = {
        empid: req.body.data.empid, 
        fechadesde: req.body.data.fechadesde, 
        fechahasta: req.body.data.fechahasta, 
        CabOpeNumeroDesde: req.body.data.CabOpeNumeroDesde, 
        CabOpeNumeroHasta: req.body.data.CabOpeNumeroHasta, 
        sessionID: req.sessionID
    }

    leeCabeceras(parametros)
        .then(data=>{
            res.render("comprobanteIngreso/indexdetalle", { data: data });
        })
        .catch(err=>{
            console.log(err)
        })    


});

var printHeader = async function (doc) {


}


router.get("/:id/imprime", middleware.isLoggedIn, async function (req, res) {

    var CabOpeId = req.params.id
    var datDocOri = await leeDocIngreso(CabOpeId).catch(err=>{console.log(err.message)})


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
      doc.lineGap(3).text('Número: '+datDocOri[0].CabOpeNumero,500);
      doc.lineGap(3).text('Fecha: ' + datDocOri[0].CabOpeFecha);
    
      doc.lineGap(3).text('Empresa: Salmones Pacific Star S.A. / Trusal S.A. / ComSur Ltda.',50);
      doc.lineGap(3).text(' ')
      doc.lineGap(3).text('Para: Tesorería, Contabilidad, Gerencia Comercial')
      doc.lineGap(3).text('Emitida Por: '+req.session.usernombre)
      doc.lineGap(3).text(' ')
      doc.fontSize(7).lineGap(3).text('FACTURAS QUE PAGA', { align: 'center'})
    
      // Table Header
      const tableHeaders = ['Nº Factura','Fecha Factura','Flete','RUT','Cliente','Moneda','Monto Factura','Monto Pago'];
    
       // Table setup
       var tableTop = 200;
       var tableLeft = 50;
       var rowHeight = 40;
       var colWidth = 65;
       var cellPadding = 10;

       var ancho=[]
       ancho[0]=50 //Nro
       ancho[1]=50 //Fecha
       ancho[2]=50 //Flete
       ancho[3]=50 //Rut
       ancho[4]=95
       ancho[5]=65 //Rut
       ancho[6]=65 //Rut
       ancho[7]=65 //Rut       
       

       // Draw table headers
       doc.lineWidth(0.5).rect(tableLeft, tableTop, (colWidth * tableHeaders.length)+10, rowHeight).stroke();
       doc.fontSize(5);
        tableHeaders.forEach((header, index) => {

         //colWidth=ancho[index]

         

         if (index > 5) {
            doc.fontSize(7).text(header, tableLeft + index * colWidth, tableTop + cellPadding, { width: colWidth, align: 'right' });
        } else if (index == 5) {
            doc.fontSize(7).text(header, tableLeft + index * colWidth, tableTop + cellPadding, { width: colWidth, align: 'center' });
        } else if (index == 4) {
            doc.fontSize(7).text(header, tableLeft + index * colWidth, tableTop + cellPadding, { width: colWidth, align: 'left' });
        } else  {
            doc.fontSize(7).text(header, tableLeft + index * colWidth, tableTop + cellPadding, { width: colWidth, align: 'center' });
        }



        });
    
  
      // Page Header
    

    var monedaDoc = datDocOri[0].MonGlosa
    var MonSimbolo = datDocOri[0].MonSimbolo
    var CabOpeFecha = datDocOri[0].CabOpeFecha

    var docBanco = " "
    var Banco = " "
    var datBco = await leeDatosBanco(CabOpeId).catch(e=>{console.log(e.message)})
    if (datBco.length>0){
        docBanco=datBco[0].TdoGlosa
        Banco=datBco[0].Banco
    }

    console.log("CabOpeId: "+CabOpeId)
      
    // Sample Table Data (you can replace this with your actual data)
    var totFactura=0.0
    var totPago=0.0
    var tableData = []
    for (var data of datDocOri) {


        var datFactura = await leeValorFactura(data.pEmpId, data.TdoId, data.DocCceNumero).catch(e=>{console.log(e)})
        var valorFactura=0
        if (datFactura.length>0) {
            valorFactura=datFactura[0].MovCceMontoImpuDebe
        }

        var fila = [
            data.DocCceNumero, 
            data.DocCceFecEmi, 
            '0', 
            data.EntRut, 
            data.EntRazonSocial.slice(0,48), 
            data.MonGlosa, 
        '$ '+formatNumber(valorFactura), 
        '$ '+formatNumber(data.MovCceMontoImpuHaber)]

        totFactura += valorFactura
        totPago += data.MovCceMontoImpuHaber

        tableData.push(fila)

    }

    var gto = totPago-totFactura 
    
    var lineas=0
    // Draw table rows
    doc.fontSize(5);
    tableData.forEach(async (rowData, rowIndex) => {
  
      if (lineas >= 10) {
  
          // Page Header
          doc.addPage({ size: 'LETTER', margin: 50 });
          // Add content to the PDF
          doc.image('public/Salmones.jpeg', 50, 50, { width: 100, height: 50 });
          doc.fontSize(8).text('NOTIFICACION DE PAGO', { align: 'center', underline: 1 });
      
          // Header Information
          doc.fontSize(6);
          doc.lineGap(3).text('Número: '+datDocOri[0].CabOpeNumero,500);
          doc.lineGap(3).text('Fecha: ' + datDocOri[0].CabOpeFecha);
          
          doc.lineGap(3).text('Empresa: Salmones Pacific Star S.A. / Trusal S.A. / ComSur Ltda.',50);
          doc.lineGap(3).text(' ')
          doc.lineGap(3).text('Para: Tesorería, Contabilidad, Gerencia Comercial')
          doc.lineGap(3).text('Emitida Por: '+req.session.usernombre)
          doc.lineGap(3).text(' ')
          doc.fontSize(7).lineGap(3).text('FACTURAS QUE PAGA', { align: 'center'})
      
          // Table Header
          const tableHeaders = ['Nº Factura','Fecha Factura','Flete','RUT','Cliente','Moneda','Monto Factura','Monto Pago'];
      
          // Table setup
          tableTop = 200;
          tableLeft = 50;
          rowHeight = 40;
          colWidth = 65;
          cellPadding = 10;
      
          // Draw table headers
          doc.lineWidth(0.5).rect(tableLeft, tableTop, (colWidth * tableHeaders.length)+10, rowHeight).stroke();
          doc.fontSize(5);
          tableHeaders.forEach((header, index) => {
             //colWidth=ancho[index]
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
        //colWidth=ancho[colIndex]
        if (colIndex > 5) {
            doc.fontSize(6).text(cellData, tableLeft + colIndex * colWidth, yPos + cellPadding, { width: colWidth, align: 'right'});
        } else if (colIndex == 5) {
            doc.fontSize(6).text(cellData, 15 + tableLeft + colIndex * colWidth, yPos + cellPadding, { width: colWidth, align: 'center'});
        } else if (colIndex == 4) {
            doc.fontSize(6).text(cellData, tableLeft + colIndex * colWidth, yPos + cellPadding, { width: colWidth, align: 'left'});
        } else  {
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
           doc.fontSize(6).text(header, tableLeft + index * colWidth, yPos + cellPadding, { width: colWidth, align: 'left' });
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
    doc.text('Fecha Recepción: '+CabOpeFecha, 80, yPos, {lineBreak: false})
    doc.text('Fecha Documento: Detalle',400)
    yPos += 10
    doc.text('Tipo de Pago: '+docBanco,80, yPos, {lineBreak: false})
    doc.text('Nº Documento: Detalle',400)
    yPos += 10
    doc.text(Banco,80, yPos, {lineBreak: false})
    doc.text('Moneda Pago: '+monedaDoc,400)
    yPos += 10
    doc.text(' ',80, yPos, {lineBreak: false})
    doc.text('Monto Recibido: '+MonSimbolo+' '+formatNumber(totPago),400)
    yPos += 10
    doc.text(' ',80, yPos, {lineBreak: false})
    doc.text('GTO: '+'$ '+formatNumber(gto), 400)

    doc.text(' ',50)
    doc.fontSize(7).lineGap(3).text('Observaciones', { align: 'center'})

    
    yPos += 30
    rowHeight=40
    doc.lineWidth(0.2).rect(tableLeft, yPos, (colWidth * tableHeaders.length) + 10, rowHeight).stroke();


    // Finalize the PDF and end the stream
    doc.end();
  
    console.log('PDF generated successfully at', outputPath);
    res.redirect("/comprobanteIngreso/index")

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

var leeCabeceras = function (p) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select ConT_CabeceraCom.pEmpId, "
        sql += "       ConT_CabeceraCom.TcoId, "
        sql += "       rtrim(ConT_TipoComprobante.TcoGlosa) TcoGlosa, "
        sql += "       ConT_CabeceraCom.ComNumero, "
        sql += "       rtrim(ConT_CabeceraCom.ComGlosa) ComGlosa, "
        sql += "       ConT_CabeceraOpe.CabOpeNumero, "
        sql += "       convert(varchar, ConT_CabeceraOpe.CabOpeFecha, 23) CabOpeFecha, "
        sql += "       rtrim(ConT_CabeceraOpe.CabOpeGlosa) CabOpeGlosa, "
        sql += "       ConT_CabeceraCom.CabCompId, "
        sql += "       ConT_CabeceraOpe.CabOpeId "
        sql += "  from ConT_CabeceraOpe left join "
        sql += "       ConT_CabeceraCom on ConT_CabeceraCom.CabCompId = ConT_CabeceraOpe.pCabCompId left join "
        sql += "       ConT_TipoComprobante on ConT_CabeceraCom.TcoId = ConT_TipoComprobante.TcoId  "
        sql += "                           and ConT_CabeceraCom.pEmpId = ConT_TipoComprobante.pEmpId "
        sql += " where ConT_CabeceraCom.pEmpId = " + p.empid
        sql += "   and ConT_CabeceraCom.TcoId = 1 "
        sql += "   and convert(varchar, ConT_CabeceraOpe.CabOpeFecha, 23) between '"+ p.fechadesde + "' and '"+ p.fechahasta +"'"

        if (p.CabOpeNumeroDesde != 0 || p.CabOpeNumeroHasta != 0) {
            sql += "   and ConT_CabeceraOpe.CabOpeNumero between "+ p.CabOpeNumeroDesde + " and "+ p.CabOpeNumeroHasta
        }

        
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeDocIngreso = function (CabOpeId) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select CceT_Documentos.pEmpId, "
        sql += "       ConT_CabeceraCom.TcoId, "
        sql += "       convert(varchar, ConT_CabeceraOpe.CabOpeFecha, 103) CabOpeFecha, "
        sql += "       ConT_TipoComprobante.TcoGlosa, "
        sql += "       ConT_CabeceraCom.ComNumero, "
        sql += "       ConT_CabeceraCom.ComGlosa, "
        sql += "       ConT_CabeceraOpe.CabOpeNumero, "
        sql += "       ConT_CabeceraOpe.CabOpeGlosa, "
        sql += "       CceT_Documentos.TdoId, "
        sql += "       Glbt_Documentos.TdoGlosa, "
        sql += "       CceT_Documentos.DocCceNumero, "
        sql += "       convert(varchar, CceT_Documentos.DocCceFecEmi, 103) DocCceFecEmi,"
        sql += "       GlbT_Entidad.EntRut, "
        sql += "       GlbT_Entidad.EntRazonSocial, "
        sql += "       GlbT_Monedas.MonGlosa, "
        sql += "       rtrim(GlbT_Monedas.MonSimbolo) MonSimbolo, "
        sql += "       CceT_Movimientos.MovCCeGlosa, "
        sql += "       CceT_Movimientos.MovCceMontoLocalDebe, "
        sql += "       CceT_Movimientos.MovCceMontoLocalHaber, "
        sql += "       CceT_Movimientos.MovCceMontoImpuDebe, "
        sql += "       CceT_Movimientos.MovCceMontoImpuHaber "
        sql += "  from ConT_CabeceraOpe left join "
        sql += "       CceT_Movimientos on CceT_Movimientos.pCabOpeId = ConT_CabeceraOpe.CabOpeId left join "
        sql += "       CceT_Documentos on CceT_Documentos.DocCceId = CceT_Movimientos.pDocCceId  left join "
        sql += "       GlbT_Entidad on GlbT_Entidad.EntId = CceT_Documentos.pEntId left join "
        sql += "       GlbT_Monedas on GlbT_Monedas.MonedaId =  CceT_Documentos.pMonedaId left join "
        sql += "       GlbT_Documentos on CceT_Documentos.TdoId = GlbT_Documentos.TdoId left join "
        sql += "       ConT_CabeceraCom on ConT_CabeceraCom.CabCompId = ConT_CabeceraOpe.pCabCompId left join "
        sql += "       ConT_Cuentas on ccet_Movimientos.pCtaId = cont_Cuentas.CtaId and cont_cuentas.tauid = 5 left join "
        sql += "       ConT_TipoComprobante on ConT_CabeceraCom.TcoId = ConT_TipoComprobante.TcoId  "
        sql += "                           and ConT_CabeceraCom.pEmpId = ConT_TipoComprobante.pEmpId "
        sql += " where ConT_CabeceraOpe.CabOpeId = " + CabOpeId
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};


var leeValorFactura = function (Empid, TdoId, DocCceNumero) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += "select CceT_Documentos.pEmpId, "
        sql += "       ConT_CabeceraOpe.CabOpeId, "
        sql += "       ConT_CabeceraCom.TcoId, "
        sql += "       ConT_TipoComprobante.TcoGlosa, "
        sql += "       ConT_CabeceraCom.ComNumero, "
        sql += "       ConT_CabeceraCom.ComGlosa, "
        sql += "       ConT_CabeceraOpe.CabOpeNumero, "
        sql += "       ConT_CabeceraOpe.CabOpeFecha, "
        sql += "       ConT_CabeceraOpe.pTipoOpeId, "
        sql += "       ConT_CabeceraOpe.CabOpeGlosa, "
        sql += "       CceT_Documentos.TdoId, "
        sql += "       Glbt_Documentos.TdoGlosa, "
        sql += "       CceT_Documentos.DocCceNumero, "
        sql += "       CceT_Documentos.DocCceFecEmi, "
        sql += "       GlbT_Entidad.EntRut, "
        sql += "       GlbT_Entidad.EntRazonSocial, "
        sql += "       GlbT_Monedas.MonGlosa, "
        sql += "       CceT_Movimientos.MovCCeGlosa, "
        sql += "       CceT_Movimientos.MovCceMontoLocalDebe, "
        sql += "       CceT_Movimientos.MovCceMontoLocalHaber, "
        sql += "       CceT_Movimientos.MovCceMontoImpuDebe, "
        sql += "       CceT_Movimientos.MovCceMontoImpuHaber "
        sql += "  from ConT_CabeceraOpe left join "
        sql += "       CceT_Movimientos on CceT_Movimientos.pCabOpeId = ConT_CabeceraOpe.CabOpeId left join "
        sql += "       CceT_Documentos on CceT_Documentos.DocCceId = CceT_Movimientos.pDocCceId  left join "
        sql += "       GlbT_Entidad on GlbT_Entidad.EntId = CceT_Documentos.pEntId left join "
        sql += "       GlbT_Monedas on GlbT_Monedas.MonedaId =  CceT_Documentos.pMonedaId left join "
        sql += "       GlbT_Documentos on CceT_Documentos.TdoId = GlbT_Documentos.TdoId left join "
        sql += "       ConT_CabeceraCom on ConT_CabeceraCom.CabCompId = ConT_CabeceraOpe.pCabCompId left join "
        sql += "       ConT_TipoComprobante on ConT_CabeceraCom.TcoId = ConT_TipoComprobante.TcoId  "
        sql += "                           and ConT_CabeceraCom.pEmpId = ConT_TipoComprobante.pEmpId "
        sql += " where CceT_Documentos.DocCceNumero = '"+DocCceNumero+"'"
        sql += "   and CceT_Documentos.TdoId = "+TdoId
        sql += "   and ConT_CabeceraCom.TcoId = 3 "
        sql += "   and ConT_CabeceraOpe.pTipoOpeId = 421 "
        sql += "   and CceT_Documentos.pEmpId = "+Empid
        sequelize.query(sql)
            .then(data => {
                resolve(data[0]);
            })
            .catch(err => {
                reject(err);
            });
    });
};

var leeDatosBanco = function (CabOpeId) {
    return new Promise(function (resolve, reject) {
        var sql = ""
        sql += " select TesT_Movimientos.pEmpId, "
        sql += "        ConT_CabeceraCom.TcoId, "
        sql += "        ConT_TipoComprobante.TcoGlosa, "
        sql += "        ConT_CabeceraCom.ComNumero, "
        sql += "        ConT_CabeceraCom.ComGlosa, "
        sql += "        ConT_CabeceraOpe.CabOpeNumero, "
        sql += "        convert(varchar, ConT_CabeceraOpe.CabOpeFecha, 103) CabOpeFecha, "
        sql += "        ConT_CabeceraOpe.CabOpeGlosa, "
        sql += "        Test_Movimientos.TdoId, "
        sql += "        rtrim(GlbT_Documentos.TdoGlosa) TdoGlosa, "
        sql += "        Test_Movimientos.pCtaCteBcoId, "
        sql += "        rtrim(GlbT_Entidad.EntRazonSocial) Banco, "
        sql += "        TesT_Movimientos.MovTesGlosa, "
        sql += "        TesT_Movimientos.MovTesMontoLocalDebe, "
        sql += "        TesT_Movimientos.MovTesMontoLocalHaber, "
        sql += "        TesT_Movimientos.MovTesMontoImpuDebe, "
        sql += "        TesT_Movimientos.MovTesMontoImpuHaber "
        sql += "  from ConT_CabeceraOpe left join "
        sql += "       TesT_Movimientos on TesT_Movimientos.pCabOpeId = ConT_CabeceraOpe.CabOpeId left join "
        sql += "       GlbT_Documentos on TesT_Movimientos.TdoId = GlbT_Documentos.TdoId left join "
        sql += "       GlbT_Monedas on GlbT_Monedas.MonedaId =  TesT_Movimientos.pMonedaId left join "
        sql += "       test_ctactesbancarias on test_ctactesbancarias.ctactebcoid = TesT_Movimientos.pctactebcoid left join "
        sql += "       test_instifinan on test_instifinan.instcod = test_ctactesbancarias.instcod left join "
        sql += "       glbt_entidad on glbt_entidad.entid = test_instifinan.pentid left join "
        sql += "       ConT_CabeceraCom on ConT_CabeceraCom.CabCompId = ConT_CabeceraOpe.pCabCompId left join "
        sql += "       ConT_TipoComprobante on ConT_CabeceraCom.TcoId = ConT_TipoComprobante.TcoId  "
        sql += "                           and ConT_CabeceraCom.pEmpId = ConT_TipoComprobante.pEmpId "
        sql += " where ConT_CabeceraOpe.CabOpeId = "+CabOpeId
        sequelize.query(sql)
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
        sequelize.query(sql)
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