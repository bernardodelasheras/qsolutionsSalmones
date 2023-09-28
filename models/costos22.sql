declare @inmu table (
         inmuprynumero                  char(20) NOT NULL ,
         inmucartaofertaid       numeric(9,0) , 
         inmuprimario            numeric(9,0)
         primary key clustered( inmuprynumero asc ))
  
  insert into @inmu
  select InmT_CarOfeProductoAdi.prynumero  
       , InmT_CarOfeProductoAdi.pcartaofertaid 
           , 0
  from InmT_CarOfeProductoAdi , InmT_Cartaoferta 
  where InmT_CarOfeProductoAdi.ptprid in (@proyectos) and InmT_Cartaoferta.pempid = @empresa 
     and InmT_Cartaoferta.cartaofertaid = InmT_CarOfeProductoAdi.pcartaofertaid
         and InmT_Cartaoferta.docestado not in (6,7);
                
  insert into @inmu
  select InmT_cartaoferta.prynumero  
       , InmT_cartaoferta.cartaofertaid 
           , 1
  from  InmT_Cartaoferta 
  where InmT_Cartaoferta.ptprid in (@proyectos) and InmT_Cartaoferta.pempid = @empresa 
        and InmT_Cartaoferta.docestado not in (6,7);

   insert into @inmu
           select InmT_InmuebleProyecto.prynumero  
       , 0 
           , 2
  from  InmT_InmuebleProyecto 
  where InmT_InmuebleProyecto.ptprid in (@proyectos) and InmT_InmuebleProyecto.pEmpId = @empresa
       and InmT_InmuebleProyecto.prynumero  not in 
           (select inmuprynumero from @inmu a where a.inmuprynumero = InmT_InmuebleProyecto.prynumero )
	   and (InmT_InmuebleProyecto.prynumero <> ''
	   and  isnull(InmT_InmuebleProyecto.prynumero,'null') <> 'null')

        


select 
        
           isnull(InmT_CartaOferta.carofenuminterno,0)                           as CartaOferta
          ,inmt_inmuebleproyecto.pempid                                                              as EmpId
          
          , (select glbt_entidad.entrazonsocial  from glbt_entidad , glbt_empresas
                where glbt_entidad.entid = glbt_empresas.pentid
                and   glbt_empresas.empid =  inmt_inmuebleproyecto.pempid) as Empresa


      , InmT_InmuebleProyecto.PryNumero                                   as PryNumero
      , InmT_InmuebleProyecto.ptprid                                      as TPrId
          , glbt_tiposproyectos.tprglosa                                      as TipoProyecto
          , isnull(glbt_entidad.entrut,'')                                    as Rut
          , isnull(glbt_entidad.entrazonsocial,'')                            as RazonSocial
          , isnull(InmT_Estados.descripcion,'Sin Estado')                               as DescricpcionEstado
      , InmT_InmuebleProyecto.inmueblecodigo                              as CodigoInmueble
          , isnull(convert(varchar, inmt_cartaoferta.carofefecha, 103),'01/01/1900') as FechaCartaOferta
      , isnull(convert(varchar, inmt_cartaoferta.fechaescrit, 103),'01/01/1900') as FechaCartaOfertaEscritura
      , isnull(convert(varchar, inmt_cartaoferta.fechapromesa, 103),'01/01/1900')  as FechaCartaOfertaFechaPromesa
          , inmt_clasificacion.descripcion                                                                              as DescripcionInmueble
          , InmT_InmuebleProyecto.PrecioVenta                                                                       as PrecioVenta
          , inmt_inmuebleproyecto.mtmunicipales                                      as MtMunicipales
      , inmt_inmuebleproyecto.m2legales                                                                                 as MtLegales
          , glbt_comunas.cmunombre                                                   as Comuna
          , glbt_regiones.regnombre                                                  as Region 
          , isnull(dlgt_doctolegalcab.dlcfoliodocto,0)                                                          as NumFactura
          ,  inmt_inmuebleproyecto.valorcosto                                        as ValorCosto
          , isnull(ConT_Estados.CONESTGLOSA,'NO')                                                                       as Contabilizado
          , isnull(ConT_CabeceraCom.ComNumero,0)                                                                        as NComprobante 
      , isnull(inmt_inmuebleproyecto.codigorol,0)                                                               as CodigoRol
      , isnull(dlgt_doctolegalcab.dlcmtoafectoconv,0)                                                   as Afecto
      , isnull(dlgt_doctolegalcab.dlcmtoexento,0)                                                               as Exento
      , isnull(dlgt_doctolegalcab.dlcmtoiva,0)                                                                  as IVA
      , isnull(dlgt_doctolegalcab.dlcmtototal,0)                                                                        as Total
      , isnull(convert(varchar, dlgt_doctolegalcab.dlcfecparidad, 103),'01/01/1900') as FechaParidad
      , isnull(InmT_AuditoriaEscrituracion.cottasacambio,0)                          as TasaCambio


from 

           @inmu a
                         inner join InmT_InmuebleProyecto  on InmT_InmuebleProyecto.prynumero = a.inmuprynumero
              and a.inmuprimario = 1

           left join  InmT_CartaOferta on InmT_InmuebleProyecto.ptprid = InmT_CartaOferta.ptprid 
           AND InmT_InmuebleProyecto.PryNumero = InmT_CartaOferta.PryNumero
                   AND InmT_CartaOferta.docestado not in (6,7)
                   left join glbt_tiposproyectos on InmT_InmuebleProyecto.ptprid = glbt_tiposproyectos.tprid 
           left join glbt_entidad on InmT_CartaOferta.pentid = glbt_entidad.entid 
                   LEFT JOIN InmT_Estados ON InmT_InmuebleProyecto.DocEstado = InmT_Estados.DocEstado
                   AND InmT_Estados.tipoestado=2
                   LEFT JOIN InmT_Clasificacion ON InmT_InmuebleProyecto.ClasificaId = InmT_Clasificacion.ClasificaId
                   LEFT JOIN InmT_Proyecto ON inmt_InmuebleProyecto.pTprId = InmT_Proyecto.pTprId
                   LEFT JOIN GlbT_Comunas  ON InmT_Proyecto.CmuCodigo = GlbT_Comunas.CmuCodigo
               LEFT JOIN GlbT_Regiones ON GlbT_Comunas.RegCodigo = GlbT_Regiones.RegCodigo
           LEFT JOIN InmT_AuditoriaEscrituracion ON InmT_CartaOferta.CartaOfertaId = InmT_AuditoriaEscrituracion.pCartaOfertaId
                   LEFT JOIN DlgT_DoctoLegalCab ON InmT_AuditoriaEscrituracion.FolioFactElec = DlgT_DoctoLegalCab.DoctoLegalCabId
                   LEFT JOIN ConT_CabeceraOpe ON InmT_CartaOferta.pCabOpeIdProVen = ConT_CabeceraOpe.CabOpeId
           LEFT JOIN ConT_CabeceraCom ON ConT_CabeceraOpe.pCabCompId = ConT_CabeceraCom.CabCompId
                   LEFT JOIN ConT_Estados ON ConT_CabeceraCom.ComEstadoCod = ConT_Estados.ConEstCod
                    AND ConT_Estados.ConEstTipoEstado='CBTE'
           left join glbt_empresas on InmT_InmuebleProyecto.pempid = glbt_empresas.empid
                

 where  InmT_InmuebleProyecto.pEmpId = @empresa and
        InmT_InmuebleProyecto.ptprid in (@proyectos)
 
 
 union 



select 
       isnull(InmT_CartaOferta.carofenuminterno,0)         as carta_oferta
           ,inmt_inmuebleproyecto.pempid                                                  as Emp
          
          , (select glbt_entidad.entrazonsocial  from glbt_entidad , glbt_empresas
                where glbt_entidad.entid = glbt_empresas.pentid
                and   glbt_empresas.empid =  inmt_inmuebleproyecto.pempid)
      , InmT_InmuebleProyecto.PryNumero
      , InmT_InmuebleProyecto.ptprid               
          , glbt_tiposproyectos.tprglosa
          , isnull(glbt_entidad.entrut,'')
          , isnull(glbt_entidad.entrazonsocial,'')
          , isnull(InmT_Estados.descripcion,'Sin Estado')                        as descricpcion_estado
      , InmT_InmuebleProyecto.inmueblecodigo            as inmueblecodigo
          , isnull(convert(varchar, inmt_cartaoferta.carofefecha, 103),'01/01/1900')  as fecha_carta_oferta
      , isnull(convert(varchar, inmt_cartaoferta.fechaescrit, 103),'01/01/1900')  as fecha_carta_oferta_escritura
      , isnull(convert(varchar, inmt_cartaoferta.fechapromesa, 103),'01/01/1900') as fecha_carta_oferta_fechapromesa
          , inmt_clasificacion.descripcion                                                                              as descripcion_inmueble
          , InmT_InmuebleProyecto.PrecioVenta                                                                       as precio_venta
          , inmt_inmuebleproyecto.mtmunicipales
      , inmt_inmuebleproyecto.m2legales                                                                                 as Mtlegales
          , glbt_comunas.cmunombre
          , glbt_regiones.regnombre
          , isnull(dlgt_doctolegalcab.dlcfoliodocto,0)                                                          as num_factura
          ,  inmt_inmuebleproyecto.valorcosto
          , isnull(ConT_Estados.CONESTGLOSA,'NO')                                                                           as contabilizado
          , isnull(ConT_CabeceraCom.ComNumero,0)                                                                        as ncomprobante 
      , isnull(inmt_inmuebleproyecto.codigorol,0)                                                               as codigo_rol
      , 0                                                       as afecto
      , 0                                                               as exento
      , 0                                                                       as iva
      , 0                                                                       as total
      , '01/01/1900' as fecha_paridad
      , 0 as tasa_cambio


from 
             @inmu a
                         inner join InmT_InmuebleProyecto  on InmT_InmuebleProyecto.prynumero = a.inmuprynumero
              and a.inmuprimario = 0
           
                   left join  InmT_CartaOferta on a.inmucartaofertaid = InmT_CartaOferta.cartaofertaid 
                   AND InmT_CartaOferta.docestado not in (6,7)
                   
                   left join glbt_tiposproyectos on InmT_InmuebleProyecto.ptprid = glbt_tiposproyectos.tprid 
           left join glbt_entidad on InmT_CartaOferta.pentid = glbt_entidad.entid 
                   LEFT JOIN InmT_Estados ON InmT_InmuebleProyecto.DocEstado = InmT_Estados.DocEstado
                   AND InmT_Estados.tipoestado=2
                   LEFT JOIN InmT_Clasificacion ON InmT_InmuebleProyecto.ClasificaId = InmT_Clasificacion.ClasificaId
                   LEFT JOIN InmT_Proyecto ON inmt_InmuebleProyecto.pTprId = InmT_Proyecto.pTprId
                   LEFT JOIN GlbT_Comunas  ON InmT_Proyecto.CmuCodigo = GlbT_Comunas.CmuCodigo
               LEFT JOIN GlbT_Regiones ON GlbT_Comunas.RegCodigo = GlbT_Regiones.RegCodigo
           LEFT JOIN InmT_AuditoriaEscrituracion ON InmT_CartaOferta.CartaOfertaId = InmT_AuditoriaEscrituracion.pCartaOfertaId
                   LEFT JOIN DlgT_DoctoLegalCab ON InmT_AuditoriaEscrituracion.FolioFactElec = DlgT_DoctoLegalCab.DoctoLegalCabId
                   LEFT JOIN ConT_CabeceraOpe ON InmT_CartaOferta.pCabOpeIdProVen = ConT_CabeceraOpe.CabOpeId
           LEFT JOIN ConT_CabeceraCom ON ConT_CabeceraOpe.pCabCompId = ConT_CabeceraCom.CabCompId
                   LEFT JOIN ConT_Estados ON ConT_CabeceraCom.ComEstadoCod = ConT_Estados.ConEstCod
                    AND ConT_Estados.ConEstTipoEstado='CBTE'
          left join glbt_empresas on InmT_InmuebleProyecto.pempid = glbt_empresas.empid
 where  InmT_InmuebleProyecto.pEmpId = @empresa and
        InmT_InmuebleProyecto.ptprid in (@proyectos)
 

 union 

 select 
       isnull(InmT_CartaOferta.carofenuminterno,0)         as carta_oferta
       ,inmt_inmuebleproyecto.pempid                                              as Emp
          
          , (select glbt_entidad.entrazonsocial  from glbt_entidad , glbt_empresas
                where glbt_entidad.entid = glbt_empresas.pentid
                and   glbt_empresas.empid =  inmt_inmuebleproyecto.pempid)
          
          , InmT_InmuebleProyecto.PryNumero
      , InmT_InmuebleProyecto.ptprid               
          , glbt_tiposproyectos.tprglosa
          , isnull(glbt_entidad.entrut,'')
          , isnull(glbt_entidad.entrazonsocial,'')
          , isnull(InmT_Estados.descripcion,'Sin Estado')                        as descricpcion_estado
      , InmT_InmuebleProyecto.inmueblecodigo            as inmueblecodigo
          , isnull(convert(varchar, inmt_cartaoferta.carofefecha, 103),'01/01/1900')  as fecha_carta_oferta
      , isnull(convert(varchar, inmt_cartaoferta.fechaescrit, 103),'01/01/1900')  as fecha_carta_oferta_escritura
      , isnull(convert(varchar, inmt_cartaoferta.fechapromesa, 103),'01/01/1900') as fecha_carta_oferta_fechapromesa
          , inmt_clasificacion.descripcion                                                                              as descripcion_inmueble
          , InmT_InmuebleProyecto.PrecioVenta                                                                       as precio_venta
          , inmt_inmuebleproyecto.mtmunicipales
      , inmt_inmuebleproyecto.m2legales                                                                                 as Mtlegales
          , glbt_comunas.cmunombre
          , glbt_regiones.regnombre
          , isnull(dlgt_doctolegalcab.dlcfoliodocto,0)                                                          as num_factura
          ,  inmt_inmuebleproyecto.valorcosto
          , isnull(ConT_Estados.CONESTGLOSA,'NO')                                                                           as contabilizado
          , isnull(ConT_CabeceraCom.ComNumero,0)                                                                        as ncomprobante 
      , isnull(inmt_inmuebleproyecto.codigorol,0)                                                               as codigo_rol
      , isnull(dlgt_doctolegalcab.dlcmtoafectoconv,0)                                                   as afecto
      , isnull(dlgt_doctolegalcab.dlcmtoexento,0)                                                               as exento
      , isnull(dlgt_doctolegalcab.dlcmtoiva,0)                                                                  as iva
      , isnull(dlgt_doctolegalcab.dlcmtototal,0)                                                                        as total
      , isnull(convert(varchar, dlgt_doctolegalcab.dlcfecparidad, 103),'01/01/1900') as fecha_paridad
      , isnull(InmT_AuditoriaEscrituracion.cottasacambio,0) as tasa_cambio


from 
  
            @inmu a
                         inner join InmT_InmuebleProyecto  on InmT_InmuebleProyecto.prynumero = a.inmuprynumero
              and a.inmuprimario = 2
  
  
           left join  InmT_CartaOferta on InmT_InmuebleProyecto.ptprid = InmT_CartaOferta.ptprid 
           AND InmT_InmuebleProyecto.PryNumero = InmT_CartaOferta.PryNumero
                   AND InmT_CartaOferta.docestado not in (6,7)
                   left join glbt_tiposproyectos on InmT_InmuebleProyecto.ptprid = glbt_tiposproyectos.tprid 
           left join glbt_entidad on InmT_CartaOferta.pentid = glbt_entidad.entid 
                   LEFT JOIN InmT_Estados ON InmT_InmuebleProyecto.DocEstado = InmT_Estados.DocEstado
                   AND InmT_Estados.tipoestado=2
                   LEFT JOIN InmT_Clasificacion ON InmT_InmuebleProyecto.ClasificaId = InmT_Clasificacion.ClasificaId
                   LEFT JOIN InmT_Proyecto ON inmt_InmuebleProyecto.pTprId = InmT_Proyecto.pTprId
                   LEFT JOIN GlbT_Comunas  ON InmT_Proyecto.CmuCodigo = GlbT_Comunas.CmuCodigo
               LEFT JOIN GlbT_Regiones ON GlbT_Comunas.RegCodigo = GlbT_Regiones.RegCodigo
           LEFT JOIN InmT_AuditoriaEscrituracion ON InmT_CartaOferta.CartaOfertaId = InmT_AuditoriaEscrituracion.pCartaOfertaId
                   LEFT JOIN DlgT_DoctoLegalCab ON InmT_AuditoriaEscrituracion.FolioFactElec = DlgT_DoctoLegalCab.DoctoLegalCabId
                   LEFT JOIN ConT_CabeceraOpe ON InmT_CartaOferta.pCabOpeIdProVen = ConT_CabeceraOpe.CabOpeId
           LEFT JOIN ConT_CabeceraCom ON ConT_CabeceraOpe.pCabCompId = ConT_CabeceraCom.CabCompId
                   LEFT JOIN ConT_Estados ON ConT_CabeceraCom.ComEstadoCod = ConT_Estados.ConEstCod
                    AND ConT_Estados.ConEstTipoEstado='CBTE'
           
            left join glbt_empresas on InmT_InmuebleProyecto.pempid = glbt_empresas.empid
 where   InmT_InmuebleProyecto.pEmpId = @empresa and
         InmT_InmuebleProyecto.ptprid in (@proyectos)
 

delete from @inmu
