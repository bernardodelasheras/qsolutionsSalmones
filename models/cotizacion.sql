SELECT 
fin700.dbo.InmT_Cotizacion.CotizacionId AS interno
, rtrim(fin700.dbo.GlbT_TiposProyectos.TprGlosa) AS proyecto
, fin700.dbo.InmT_Cotizacion.CliRut AS rut
, fin700.dbo.InmT_Cotizacion.CotDocNumInterno AS num_doc
, rtrim(fin700.dbo.InmT_Cotizacion.CliRazonSocial) AS nombre
, isnull(convert(varchar, fin700.dbo.InmT_Cotizacion.CotFecha, 111),'1900/01/01') AS fecha_cotizacion
, rtrim(fin700.dbo.InmT_HojaAntecedentes.EMailTitular) AS correo
, isnull(fin700.dbo.InmT_HojaAntecedentes.TelefonoTitular,0) AS telefono
, isnull(convert(varchar, fin700.dbo.InmT_HojaAntecedentes.FechaNacTitular, 111),'1900/01/01') AS fecha_nac
, 0 AS edad
, isnull(fin700.dbo.InmT_EstadoCivil.GlosaEstCivil,0) AS estado_civil
, rtrim(ltrim(fin700.dbo.InmT_InmuebleProyecto.InmuebleCodigo)) AS inmueble
, fin700.dbo.InmT_Cotizacion.PrecioVenta AS precioventa
, fin700.dbo.InmT_Cotizacion.PrecioFinalCot AS preciofinalcot
, isnull( fin700.dbo.InmT_CartaOferta.CartaOfertaId , 0 ) as Carta_Oferta
, isnull( fin700.dbo.InmT_CartaOferta.CarOfeNumInterno ,0 ) as Numero_Carta_Oferta
, isnull  ((select fin700.dbo.InmT_estados.descripcion 
            from fin700.dbo.InmT_estados 
            where (fin700.dbo.InmT_estados.tipoestado = 2 
            and fin700.dbo.InmT_estados.docestado = fin700.dbo.InmT_CartaOferta.docestado)) ,0) as estado_cartaoferta
, ( select fin700.dbo.inmt_clasificacion.descripcion 
            from   fin700.dbo.inmt_clasificacion 
             where fin700.dbo.inmt_clasificacion.clasificaid = fin700.dbo.InmT_InmuebleProyecto.clasificaid) as clasificacion
,fin700.dbo.InmT_Cotizacion.pEmpId
,fin700.dbo.InmT_Cotizacion.DivCodigo
,fin700.dbo.GlbT_Comunas.CmuNombre 
,fin700.dbo.GlbT_Regiones.RegNombre
FROM 
   ((((((((fin700.dbo.InmT_Cotizacion 
        LEFT JOIN fin700.dbo.GlbT_Entidad ON fin700.dbo.InmT_Cotizacion.CliRut = fin700.dbo.GlbT_Entidad.EntRut) 
        LEFT JOIN fin700.dbo.InmT_HojaAntecedentes ON fin700.dbo.GlbT_Entidad.EntId = fin700.dbo.InmT_HojaAntecedentes.pEntId) 
        LEFT JOIN fin700.dbo.InmT_EstadoCivil ON fin700.dbo.InmT_HojaAntecedentes.CodEstCivilTitular = fin700.dbo.InmT_EstadoCivil.CodEstCivil) 
        LEFT JOIN fin700.dbo.GlbT_TiposProyectos ON fin700.dbo.InmT_Cotizacion.pTprId = fin700.dbo.GlbT_TiposProyectos.TprId) 
        LEFT JOIN fin700.dbo.InmT_InmuebleProyecto ON (fin700.dbo.InmT_Cotizacion.PryNumero = fin700.dbo.InmT_InmuebleProyecto.PryNumero) AND (fin700.dbo.InmT_Cotizacion.pTprId = fin700.dbo.InmT_InmuebleProyecto.pTprId)) 
        LEFT JOIN fin700.dbo.InmT_CartaOferta ON fin700.dbo.InmT_Cotizacion.CotizacionId = fin700.dbo.InmT_CartaOferta.pCotizacionId)
        LEFT JOIN fin700.dbo.InmT_Proyecto ON fin700.dbo.InmT_InmuebleProyecto.pTprId = fin700.dbo.InmT_Proyecto.pTprId)
        LEFT JOIN fin700.dbo.GlbT_Comunas ON  fin700.dbo.InmT_Proyecto.CmuCodigo = fin700.dbo.GlbT_Comunas.CmuCodigo)
        LEFT JOIN fin700.dbo.GlbT_Regiones ON fin700.dbo.GlbT_Comunas.RegCodigo = fin700.dbo.GlbT_Regiones.RegCodigo
WHERE
                fin700.dbo.InmT_Cotizacion.CotizacionId Is Not Null 
                AND fin700.dbo.InmT_Cotizacion.pEmpId = $empid
                AND fin700.dbo.InmT_Cotizacion.pTprId in ($proyectos)
                AND convert(int,left(convert(varchar,fin700.dbo.InmT_Cotizacion.CotFecha,112),6)) between $periodoini and $periodofin
                
union

 SELECT
   fin700.dbo.InmT_CotProductoAdi.pCotizacionId
 , rtrim(fin700.dbo.GlbT_TiposProyectos.TprGlosa)
 , fin700.dbo.InmT_Cotizacion.CliRut
 , fin700.dbo.InmT_Cotizacion.CotDocNumInterno
 , rtrim(fin700.dbo.GlbT_Entidad.EntRazonSocial)
 , isnull(convert(varchar, fin700.dbo.InmT_Cotizacion.CotFecha, 111),'1900/01/01')
 , rtrim(fin700.dbo.InmT_HojaAntecedentes.EMailTitular)
 , isnull(fin700.dbo.InmT_HojaAntecedentes.TelefonoTitular,0)
 , isnull(convert(varchar, fin700.dbo.InmT_HojaAntecedentes.FechaNacTitular, 111),'1900/01/01')
 , 0 AS edad
 , isnull(fin700.dbo.InmT_EstadoCivil.GlosaEstCivil,0)
 , rtrim(ltrim(fin700.dbo.InmT_InmuebleProyecto.InmuebleCodigo))
 , fin700.dbo.InmT_CotProductoAdi.PrecioVenta
 , fin700.dbo.InmT_CotProductoAdi.PrecioFinalRel
 , isnull(fin700.dbo.InmT_CartaOferta.CartaOfertaId,0)
 , isnull(fin700.dbo.InmT_CartaOferta.CarOfeNumInterno,0)
 , isnull ((select fin700.dbo.InmT_estados.descripcion 
            from   fin700.dbo.InmT_estados 
            where (fin700.dbo.InmT_estados.tipoestado = 2 
            and    fin700.dbo.InmT_estados.docestado = fin700.dbo.InmT_CartaOferta.docestado))  ,0) 
,( select fin700.dbo.inmt_clasificacion.descripcion 
            from   fin700.dbo.inmt_clasificacion 
            where  fin700.dbo.inmt_clasificacion.clasificaid = fin700.dbo.InmT_InmuebleProyecto.clasificaid) 
,fin700.dbo.InmT_Cotizacion.pEmpId
,fin700.dbo.InmT_Cotizacion.DivCodigo
,fin700.dbo.GlbT_Comunas.CmuNombre 
,fin700.dbo.GlbT_Regiones.RegNombre

 FROM 
(((((((((fin700.dbo.InmT_Cotizacion RIGHT JOIN fin700.dbo.InmT_CotProductoAdi  ON fin700.dbo.InmT_Cotizacion.CotizacionId = fin700.dbo.InmT_CotProductoAdi.pCotizacionId)
      LEFT JOIN fin700.dbo.GlbT_Entidad ON fin700.dbo.InmT_Cotizacion.CliRut = fin700.dbo.GlbT_Entidad.EntRut) 
      LEFT JOIN fin700.dbo.InmT_HojaAntecedentes ON fin700.dbo.GlbT_Entidad.EntId = fin700.dbo.InmT_HojaAntecedentes.pEntId) 
      LEFT JOIN fin700.dbo.InmT_EstadoCivil ON fin700.dbo.InmT_HojaAntecedentes.CodEstCivilTitular = fin700.dbo.InmT_EstadoCivil.CodEstCivil) 
      LEFT JOIN fin700.dbo.GlbT_TiposProyectos ON fin700.dbo.InmT_CotProductoAdi.pTprId = fin700.dbo.GlbT_TiposProyectos.TprId) 
      LEFT JOIN fin700.dbo.InmT_InmuebleProyecto ON (fin700.dbo.InmT_CotProductoAdi.pTprId = fin700.dbo.InmT_InmuebleProyecto.pTprId) 
           AND (fin700.dbo.InmT_CotProductoAdi.PryNumero = fin700.dbo.InmT_InmuebleProyecto.PryNumero)) 
      LEFT JOIN fin700.dbo.InmT_CartaOferta ON fin700.dbo.InmT_Cotizacion.CotizacionId = fin700.dbo.InmT_CartaOferta.pCotizacionId)
      LEFT JOIN fin700.dbo.InmT_Proyecto ON fin700.dbo.InmT_InmuebleProyecto.pTprId = fin700.dbo.InmT_Proyecto.pTprId)
      LEFT JOIN fin700.dbo.GlbT_Comunas ON  fin700.dbo.InmT_Proyecto.CmuCodigo = fin700.dbo.GlbT_Comunas.CmuCodigo)
      LEFT JOIN fin700.dbo.GlbT_Regiones ON fin700.dbo.GlbT_Comunas.RegCodigo = fin700.dbo.GlbT_Regiones.RegCodigo
WHERE 
      fin700.dbo.InmT_CotProductoAdi.pCotizacionId Is Not Null 
      AND fin700.dbo.InmT_Cotizacion.pEmpId= $empid
      AND fin700.dbo.InmT_Cotizacion.pTprId in ($proyectos)
      and convert(int,left(convert(varchar,fin700.dbo.InmT_Cotizacion.CotFecha,112),6)) between $periodoini and $periodofin
order by 
                 rtrim(fin700.dbo.GlbT_TiposProyectos.TprGlosa)
                ,fin700.dbo.InmT_Cotizacion.CotDocNumInterno
                ,fin700.dbo.InmT_Cotizacion.PrecioVenta desc