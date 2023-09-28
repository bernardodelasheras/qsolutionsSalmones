SELECT GlbT_TiposProyectos.TprId
      ,GlbT_TiposProyectos.TprGlosa
      ,GlbT_Entidad.EntRut RutCliente
      ,GlbT_Entidad.EntRazonSocial Cliente
          ,GlbT_Entidad.EntNomFantasia NombreFantasia
          ,InmT_Estados.Descripcion EstadoInmueble
          ,Replace(InmT_HojaAntecedentes.DireccionTitular, char(9), '') Direccion
          ,GlbT_Regiones.RegNombre
          ,GlbT_Comunas.CmuNombre
          ,InmT_Vendedores.VenNombre
          ,rtrim(InmT_InmuebleProyecto.InmuebleCodigo) Inmueble
          ,
                (SELECT STUFF((
                
                Select ','+RTRIM(InmT_InmuebleProyecto3.InmuebleCodigo) 
                from InmT_CarOfeProductoAdi inner join 
                        InmT_CartaOferta carta on carta.CartaOfertaId = InmT_CarOfeProductoAdi.pCartaOfertaId inner join
                        InmT_InmuebleProyecto InmT_InmuebleProyecto3 on InmT_CarOfeProductoAdi.pTprId = InmT_InmuebleProyecto3.pTprId and
                                                                        InmT_CarOfeProductoAdi.PryNumero = InmT_InmuebleProyecto3.PryNumero
                where carta.CartaOfertaId = InmT_CartaOferta.CartaOfertaId

                FOR XML PATH('')),1,1,'')) InmueblesRelacionados

          ,InmT_Afluencia.AfluGlosa
          ,InmT_TipoVenta.TVentaGlosa
          ,InmT_TipoCliente.TcliGlosa
          ,InmT_CategoriaCliente.CategoriaGlosa
          ,InmT_ModoContacto.ModoGlosa
          ,isnull(convert(varchar, InmT_HojaAntecedentes.FechaNacTitular, 111),'1900/01/01') FechaNacTitular
          ,InmT_HojaAntecedentes.TelefonoTitular
          ,InmT_HojaAntecedentes.EmailTitular
          ,InmT_EstadoCivil.GlosaEstCivil
          ,InmT_HojaAntecedentes.ProfesionTitular
          ,InmT_RegimenConyugal.GlosaRegConyugal
          ,InmT_HojaAntecedentes.Nacionalidad
          ,isnull(InmT_HojaAntecedentes.RentaLiquidaTitular,0) RentaLiquidaTitular
          ,InmT_Notaria.GlosaNotaria
          ,Case isnull(GlbT_Entidad2.EntRazonSocial, ' ')
			       when ' ' then GlbT_Entidad3.EntRazonSocial
			       else GlbT_Entidad2.EntRazonSocial
		       end EntBancaria
          ,isnull(convert(varchar, InmT_CartaOferta.CarOfeFecha, 111),'1900/01/01') CarOfeFecha
          ,isnull(convert(varchar,InmT_Escrituracion.FechaEscrit, 111),'1900/01/01') FechaEscrit
          ,isnull(convert(varchar,InmT_CartaOferta.FechaPromesa, 111),'1900/01/01') FechaPromesa
          ,(
                select top 1 GlbT_FormaPago.FormaPagoGlosa from InmT_PagosCartaOferta inner join
                       GlbT_FormaPagoDet on InmT_PagosCartaOferta.pFormaPagoDetId = GlbT_FormaPagoDet.FormaPagoDetId inner join
               GlbT_FormaPago on GlbT_FormaPagoDet.pFormaPagoId = GlbT_FormaPago.FormaPagoId
                 where InmT_PagosCartaOferta.pCabOpeId = (Select max(InmT_PagosCartaOferta.pCabOpeId) ope from InmT_PagosCartaOferta 
                                                           where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId) 
          ) FPago
          ,
          (
                SELECT STUFF((

                select ',' + rtrim(InmT_ItemFinanciamiento.ItemFinGlosa) + ' (' + rtrim(convert(char,MontoItem)) + ' UF)' from InmT_CarOfeItemFinan inner join
                              InmT_ItemFinanciamiento on InmT_ItemFinanciamiento.ItemFinId = InmT_CarOfeItemFinan.ItemFinId
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                FOR XML PATH('')),1,1,'')

          ) ItemsFinanciamiento
          ,
          (
            select top 1 max(NodoId) from InmT_ProyectoEtapa
                 where InmT_ProyectoEtapa.pTprId = InmT_CartaOferta.pTprId
          ) Etapa
          ,InmT_InmuebleProyecto.Piso Nivel
          ,InmT_InmuebleProyecto.Piso
          ,InmT_InmuebleProyecto.CodOrientacion
          ,InmT_Clasificacion.Descripcion
          ,InmT_TipoInmueble.TInmGlosaLarga
          ,(
            Select count(*) from InmT_Cotizacion
                 where CliRut = GlbT_Entidad.EntRut
          ) NumCotizaciones
          ,(
            Select count(*) from InmT_CartaOferta
                 where pEntId = GlbT_Entidad.EntId
                   and DocEstado=4
          ) Promesas
          ,(
            Select count(*) from InmT_CartaOferta
                 where pEntId = GlbT_Entidad.EntId
                   and DocEstado=8
          ) Escrituras
          ,(
            Select count(*) from InmT_CartaOferta
                 where pEntId = GlbT_Entidad.EntId
          ) CartasOfertas
          ,(
                select sum(MontoItemOr) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
          ) UFItemsFinanciamiento
          ,(
                select isnull(sum(MontoItemDet),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
          ) UFPagadoItemsFinanciamiento
          , 0 UFPagadoEnExceso
          ,(
                select sum(PrecioVenta) from inmt_inmuebleproyecto i
                        where i.pTprId = InmT_CartaOferta.pTprId 
                          and i.pEmpId = InmT_CartaOferta.pEmpId
                          and ((i.InmuebleId in (
                                        Select Iproy.InmuebleId 
                                        from InmT_CarOfeProductoAdi inner join 
                                                 InmT_CartaOferta carta on carta.CartaOfertaId = InmT_CarOfeProductoAdi.pCartaOfertaId inner join
                                                 InmT_InmuebleProyecto Iproy on InmT_CarOfeProductoAdi.pTprId = Iproy.pTprId and
                                                                                                                InmT_CarOfeProductoAdi.PryNumero = Iproy.PryNumero
                                        where carta.CartaOfertaId = InmT_CartaOferta.CartaOfertaId ))
                                or (i.InmuebleId=InmT_InmuebleProyecto.InmuebleId))
          ) PrecioVenta
          ,(
                select sum(PrecioLista) from inmt_inmuebleproyecto i
                        where i.pTprId = InmT_CartaOferta.pTprId 
                          and i.pEmpId = InmT_CartaOferta.pEmpId
                          and ((i.InmuebleId in (
                                        Select Iproy.InmuebleId 
                                        from InmT_CarOfeProductoAdi inner join 
                                                 InmT_CartaOferta carta on carta.CartaOfertaId = InmT_CarOfeProductoAdi.pCartaOfertaId inner join
                                                 InmT_InmuebleProyecto Iproy on InmT_CarOfeProductoAdi.pTprId = Iproy.pTprId and
                                                                                                                InmT_CarOfeProductoAdi.PryNumero = Iproy.PryNumero
                                        where carta.CartaOfertaId = InmT_CartaOferta.CartaOfertaId ))
                                or (i.InmuebleId=InmT_InmuebleProyecto.InmuebleId))
          ) PrecioLista
      ,0 PorcentajeVariacion
          ,0 MontoVariacion
          ,(
                select sum(PrecioVenta) from (
                select cof.PrecioVenta from inmt_cartaoferta cof 
                        where cof.CartaOfertaId = InmT_CartaOferta.CartaOfertaId
                union
                select adi.PrecioVenta from inmt_cartaoferta cof inner join
                           InmT_CarOfeProductoAdi adi on cof.CartaOfertaId = adi.pCartaOfertaId
                        where cof.CartaOfertaId = InmT_CartaOferta.CartaOfertaId) Relacionados
          ) PrecioVentaCartaOferta

          ,(select sum(PrecioVenta) from (
                select cot.PrecioVenta from inmt_cotizacion cot 
                        where cot.CotizacionId = InmT_CartaOferta.pCotizacionId
                union
                select adi.PrecioVenta from inmt_cotizacion cot inner join
                                InmT_CotProductoAdi adi on cot.CotizacionId = adi.pCotizacionId
                        where cot.CotizacionId = InmT_CartaOferta.pCotizacionId) Relacionados
           ) PrecioVentaCotizacion

          ,(
                select sum(PrecioVenta) from (
                select cof.PrecioFinalCO PrecioVenta from inmt_cartaoferta cof 
                        where cof.CartaOfertaId = InmT_CartaOferta.CartaOfertaId
                union
                select adi.PrecioFinalRel PrecioVenta from inmt_cartaoferta cof inner join
                           InmT_CarOfeProductoAdi adi on cof.CartaOfertaId = adi.pCartaOfertaId
                        where cof.CartaOfertaId = InmT_CartaOferta.CartaOfertaId) Relacionados
          ) UFPactado_PrecioFinal
          ,(
                select isnull(sum(MontoItemDet),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
          ) UFMontoRecibido
          , 0 UFSaldoPorCobrar
          , InmT_InmuebleProyecto.MtTotales
          , InmT_InmuebleProyecto.SupUtil
          , InmT_InmuebleProyecto.SupTerraza
          , InmT_InmuebleProyecto.IndLogia
          , InmT_InmuebleProyecto.SupLogia
          , InmT_InmuebleProyecto.CantDormitorios
          , InmT_InmuebleProyecto.CantDormServ
          , InmT_InmuebleProyecto.IndBanoV
          , InmT_InmuebleProyecto.CantBanos
          , InmT_InmuebleProyecto.MtTerreno
          , InmT_InmuebleProyecto.MtConstruidos
          , InmT_InmuebleProyecto.MtMunicipales
          ,(
                select isnull(max(MovDocCuota),0) from InmT_CarOfeDetItemFinan det
                 where det.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
          ) CuotasPactadas
      , '' EstadoCuotas
      , InmT_CartaOferta.CartaOfertaId
      , InmT_CartaOferta.CarOfeNumInterno
      ,GlbT_ComunasProyecto.CmuNombre ComunaProyecto
      ,GlbT_RegionesProyecto.RegNombre RegionProyecto

  FROM InmT_CartaOferta inner join 
       InmT_Cotizacion on InmT_CartaOferta.pCotizacionId = InmT_Cotizacion.CotizacionId inner join
           InmT_Afluencia on InmT_Cotizacion.AfluId = InmT_Afluencia.AfluId inner join
           InmT_TipoVenta on InmT_Cotizacion.TVentaId = InmT_TipoVenta.TVentaId inner join
           InmT_TipoCliente on InmT_Cotizacion.TcliId = InmT_TipoCliente.TcliId inner join
(select VenId, VenNombre from inmt_vendedores 
union
select 13, 'INDEFINIDO' from inmt_vendedores 
group by VenId, VenNombre) inmt_vendedores on InmT_Vendedores.VenId = InmT_CartaOferta.VenIdResp inner join
           InmT_Estados on InmT_CartaOferta.DocEstado = InmT_Estados.DocEstado and InmT_Estados.TipoEstado = 2 inner join
           GlbT_Entidad on InmT_CartaOferta.pEntId = GlbT_Entidad.EntId inner join
           GlbT_TiposProyectos on GlbT_TiposProyectos.TprId = InmT_CartaOferta.pTprId inner join

           InmT_Proyecto on GlbT_TiposProyectos.TprId = InmT_Proyecto.pTprId and InmT_Proyecto.pEmpId = InmT_CartaOferta.pEmpId inner join
           GlbT_Comunas GlbT_ComunasProyecto on InmT_Proyecto.CmuCodigo = GlbT_ComunasProyecto.CmuCodigo inner join
           GlbT_Regiones GlbT_RegionesProyecto on GlbT_ComunasProyecto.RegCodigo = GlbT_RegionesProyecto.RegCodigo inner join

           InmT_InmuebleProyecto on InmT_CartaOferta.pTprId = InmT_InmuebleProyecto.pTprId and InmT_CartaOferta.PryNumero = InmT_InmuebleProyecto.PryNumero left outer join
           InmT_ModoContacto on InmT_Cotizacion.ModoId = InmT_ModoContacto.ModoId left outer join
           InmT_CategoriaCliente on InmT_Cotizacion.pCategoriaId = InmT_CategoriaCliente.CategoriaId left outer join
           InmT_Estados e on InmT_InmuebleProyecto.DocEstado = e.DocEstado and e.TipoEstado = 1 left outer join
           InmT_HojaAntecedentes on InmT_CartaOferta.pEntId = InmT_HojaAntecedentes.pEntId left outer join
           GlbT_Comunas on InmT_HojaAntecedentes.CmuCodigoTitular = GlbT_Comunas.CmuCodigo left outer join
           GlbT_Regiones on GlbT_Comunas.RegCodigo = GlbT_Regiones.RegCodigo left outer join
           InmT_EstadoCivil on InmT_HojaAntecedentes.CodEstCivilTitular = InmT_EstadoCivil.CodEstCivil left outer join
           InmT_RegimenConyugal on InmT_HojaAntecedentes.CodRegConyugalTitular = InmT_RegimenConyugal.CodRegConyugal left outer join
           InmT_Escrituracion on InmT_CartaOferta.CartaOfertaId = InmT_Escrituracion.pCartaOfertaId left outer join
           InmT_Notaria on InmT_Escrituracion.CodNotaria = InmT_Notaria.CodNotaria left outer join
           Test_InstiFinan on InmT_Escrituracion.InstCod = Test_InstiFinan.InstCod left outer join
           GlbT_Entidad GlbT_Entidad2 on Test_InstiFinan.pEntId = GlbT_Entidad2.EntId left outer join
           InmT_Clasificacion on InmT_InmuebleProyecto.ClasificaId = InmT_Clasificacion.ClasificaId left outer join
       InmT_TipoInmueble on InmT_InmuebleProyecto.TInmId = InmT_TipoInmueble.TInmId and
                                                        InmT_InmuebleProyecto.pTprId = InmT_TipoInmueble.pTprId left join
		   InmT_CarOfeItemFinan on InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId and InmT_CarOfeItemFinan.ItemFinId=4 left join
           TesT_InstiFinan TesT_InstiFinan2 on InmT_CarOfeItemFinan.RefInstId = TesT_InstiFinan2.InstCod left join
           GlbT_Entidad GlbT_Entidad3 on TesT_InstiFinan2.pEntId = GlbT_Entidad3.EntId
  where InmT_CartaOferta.pEmpId = $empid
    and InmT_CartaOferta.pTprId in ($proyectos)
    and convert(int,left(convert(varchar,InmT_CartaOferta.CarOfeFecha,112),6)) between $periodoini and $periodofin
        and InmT_CartaOferta.DocEstado not in (6, 7)
union
SELECT GlbT_TiposProyectos.TprId
      ,GlbT_TiposProyectos.TprGlosa
      ,'' EntRut 
      ,'' EntRazonSocial 
          ,''EntNomFantasia
          ,e.Descripcion EstadoInmueble
          ,'' Direccion
          ,'' RegNombre
          ,'' CmuNombre
          ,'' VenNombre
          ,rtrim(InmT_InmuebleProyecto.InmuebleCodigo) Inmueble
          ,''  InmueblesRelacionados
          ,''  AfluGlosa
          ,'' TVentaGlosa
          ,'' TcliGlosa
          ,'' CategoriaGlosa
          ,'' ModoGlosa
          ,'1900/01/01' FechaNacTitular
          ,' ' TelefonoTitular
          ,'' EmailTitular
          ,'' GlosaEstCivil
          ,'' ProfesionTitular
          ,'' GlosaRegConyugal
          ,'' Nacionalidad
          ,'' RentaLiquidaTitular
          ,'' GlosaNotaria
          ,'' EntBancaria
          ,'1900/01/01' CarOfeFecha
          ,'1900/01/01' FechaEscrit
          ,'1900/01/01' FechaPromesa
          ,'' FPago
          ,'' ItemsFinanciamiento
          ,
          (
            select top 1 max(NodoId) from InmT_ProyectoEtapa
                 where InmT_ProyectoEtapa.pTprId = InmT_InmuebleProyecto.pTprId
          ) Etapa
          ,InmT_InmuebleProyecto.Piso Nivel
          ,InmT_InmuebleProyecto.Piso
          ,InmT_InmuebleProyecto.CodOrientacion
          ,InmT_Clasificacion.Descripcion
          ,InmT_TipoInmueble.TInmGlosaLarga
          ,0 NumCotizaciones
          ,0 Promesas
          ,0 Escrituras
          ,0 CartasOfertas
          ,0 UFItemsFinanciamiento
          ,0 UFPagadoItemsFinanciamiento
          ,0 UFPagadoEnExceso
          , inmt_inmuebleproyecto.PrecioVenta
          , inmt_inmuebleproyecto.PrecioLista
      ,0 PorcentajeVariacion
          ,0 MontoVariacion
          ,0  PrecioVentaCartaOferta
          ,0 PrecioVentaCotizacion
          ,0 UFPactado_PrecioFinal
          ,0 UFMontoRecibido
          ,0 UFSaldoPorCobrar
          , InmT_InmuebleProyecto.MtTotales
          , InmT_InmuebleProyecto.SupUtil
          , InmT_InmuebleProyecto.SupTerraza
          , InmT_InmuebleProyecto.IndLogia
          , InmT_InmuebleProyecto.SupLogia
          , InmT_InmuebleProyecto.CantDormitorios
          , InmT_InmuebleProyecto.CantDormServ
          , InmT_InmuebleProyecto.IndBanoV
          , InmT_InmuebleProyecto.CantBanos
          , InmT_InmuebleProyecto.MtTerreno
          , InmT_InmuebleProyecto.MtConstruidos
          , InmT_InmuebleProyecto.MtMunicipales
          ,0 CuotasPactadas
          , '' EstadoCuotas
      ,0 CartaOfertaId
      ,0 CarOfeNumInterno
      ,GlbT_ComunasProyecto.CmuNombre ComunaProyecto
      ,GlbT_RegionesProyecto.RegNombre RegionProyecto

  FROM InmT_InmuebleProyecto left outer join
           GlbT_TiposProyectos on GlbT_TiposProyectos.TprId = InmT_InmuebleProyecto.pTprId inner join

           InmT_Proyecto on GlbT_TiposProyectos.TprId = InmT_Proyecto.pTprId and InmT_Proyecto.pEmpId = InmT_InmuebleProyecto.pEmpId inner join
           GlbT_Comunas GlbT_ComunasProyecto on InmT_Proyecto.CmuCodigo = GlbT_ComunasProyecto.CmuCodigo inner join
           GlbT_Regiones GlbT_RegionesProyecto on GlbT_ComunasProyecto.RegCodigo = GlbT_RegionesProyecto.RegCodigo left outer join

           InmT_Estados e on InmT_InmuebleProyecto.DocEstado = e.DocEstado and e.TipoEstado = 1 left outer join
           InmT_Clasificacion on InmT_InmuebleProyecto.ClasificaId = InmT_Clasificacion.ClasificaId left outer join
       InmT_TipoInmueble on InmT_InmuebleProyecto.TInmId = InmT_TipoInmueble.TInmId and
                                                        InmT_InmuebleProyecto.pTprId = InmT_TipoInmueble.pTprId
  where InmT_InmuebleProyecto.pEmpId = $empid
    and InmT_InmuebleProyecto.pTprId in ($proyectos)
        and InmT_InmuebleProyecto.InmuebleCodigo not in (
                                        Select d.InmuebleCodigo from InmT_CartaOferta inner join
                                                   InmT_InmuebleProyecto d on InmT_CartaOferta.pTprId = d.pTprId 
                                           and InmT_CartaOferta.PryNumero = d.PryNumero
                                         where InmT_CartaOferta.pEmpId= InmT_InmuebleProyecto.pEmpId
                                           and InmT_CartaOferta.DivCodigo= InmT_InmuebleProyecto.DivCodigo
                                           and InmT_CartaOferta.pTprId= InmT_InmuebleProyecto.pTprId
                                           and InmT_CartaOferta.DocEstado not in (6,7))
   and InmT_InmuebleProyecto.InmuebleCodigo not in (
                                        Select d.InmuebleCodigo from InmT_CartaOferta inner join
                                                   InmT_CarOfeProductoAdi on InmT_CartaOferta.CartaOfertaId = InmT_CarOfeProductoAdi.pCartaOfertaId inner join
                                                   InmT_InmuebleProyecto d on InmT_CarOfeProductoAdi.pTprId = d.pTprId 
                                                                    and InmT_CarOfeProductoAdi.PryNumero = d.PryNumero
                                         where InmT_CartaOferta.pEmpId= InmT_InmuebleProyecto.pEmpId
                                           and InmT_CartaOferta.DivCodigo= InmT_InmuebleProyecto.DivCodigo
                                           and InmT_CartaOferta.pTprId= InmT_InmuebleProyecto.pTprId
                                           and InmT_CartaOferta.DocEstado not in (6,7))