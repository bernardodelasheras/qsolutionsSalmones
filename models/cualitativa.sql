Select GlbT_TiposProyectos.TprId TipoProyecto
      ,GlbT_TiposProyectos.TprGlosa Proyecto
      ,GlbT_Entidad.EntRut RutCliente
      ,GlbT_Entidad.EntRazonSocial NombreCliente
          ,GlbT_Entidad.EntNomFantasia NombreFantasia
          ,InmT_Estados.Descripcion EstadoCartaOferta
          ,Replace(GlbT_EntidadDireccion.EntDirDireccion, char(9), '') Direccion
          ,GlbT_Regiones.RegNombre Region
          ,GlbT_Comunas.CmuNombre Comuna
          ,InmT_Vendedores.VenNombre Vendedor
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
          ,InmT_Afluencia.AfluGlosa Afluencia
          ,InmT_TipoVenta.TVentaGlosa TipoVenta
          ,InmT_TipoCliente.TcliGlosa TipoCliente
          ,InmT_CategoriaCliente.CategoriaGlosa Categoria
          ,InmT_ModoContacto.ModoGlosa ModoContacto
          ,isnull(convert(varchar, InmT_HojaAntecedentes.FechaNacTitular, 111),'1900/01/01') FechaNacTitular          
          ,isnull(InmT_HojaAntecedentes.TelefonoTitular, ' ') TelefonoTitular
          ,isnull(InmT_HojaAntecedentes.EmailTitular, ' ') EmailTitular
          ,isnull(InmT_EstadoCivil.GlosaEstCivil, ' ') GlosaEstCivil
          ,isnull(InmT_HojaAntecedentes.ProfesionTitular, ' ') ProfesionTitular
          ,InmT_RegimenConyugal.GlosaRegConyugal
          ,isnull(InmT_HojaAntecedentes.Nacionalidad, ' ') Nacionalidad
          ,isnull(InmT_HojaAntecedentes.RentaLiquidaTitular,0) RentaLiquidaTitular
          ,InmT_Notaria.GlosaNotaria
          ,case isnull(GlbT_Entidad2.EntRazonSocial, ' ')
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
      ,InmT_CartaOferta.CartaOfertaId IdCartaOferta
      ,InmT_CartaOferta.CarOfeNumInterno NumeroCartaOferta
      ,GlbT_ComunasProyecto.CmuNombre ComunaProyecto
      ,GlbT_RegionesProyecto.RegNombre RegionProyecto
      
  FROM InmT_CartaOferta inner join 
       InmT_Cotizacion on InmT_CartaOferta.pCotizacionId = InmT_Cotizacion.CotizacionId inner join
           InmT_Afluencia on InmT_Cotizacion.AfluId = InmT_Afluencia.AfluId inner join
           InmT_TipoVenta on InmT_Cotizacion.TVentaId = InmT_TipoVenta.TVentaId inner join
           InmT_TipoCliente on InmT_Cotizacion.TcliId = InmT_TipoCliente.TcliId inner join

           InmT_ModoContacto on InmT_Cotizacion.ModoId = InmT_ModoContacto.ModoId inner join
           InmT_Vendedores on InmT_Vendedores.VenId = InmT_CartaOferta.VenIdResp inner join
           InmT_Estados on InmT_CartaOferta.DocEstado = InmT_Estados.DocEstado and InmT_Estados.TipoEstado = 2 inner join
           GlbT_Entidad on InmT_CartaOferta.pEntId = GlbT_Entidad.EntId inner join
           GlbT_EntidadDireccion on InmT_CartaOferta.pEntId = GlbT_EntidadDireccion.pEntId inner join
           GlbT_Comunas on GlbT_EntidadDireccion.CmuCodigo = GlbT_Comunas.CmuCodigo inner join
           GlbT_Regiones on GlbT_Comunas.RegCodigo = GlbT_Regiones.RegCodigo inner join
           GlbT_TiposProyectos on GlbT_TiposProyectos.TprId = InmT_CartaOferta.pTprId inner join

           InmT_Proyecto on GlbT_TiposProyectos.TprId = InmT_Proyecto.pTprId and InmT_Proyecto.pEmpId = InmT_CartaOferta.pEmpId inner join
           GlbT_Comunas GlbT_ComunasProyecto on InmT_Proyecto.CmuCodigo = GlbT_ComunasProyecto.CmuCodigo inner join
           GlbT_Regiones GlbT_RegionesProyecto on GlbT_ComunasProyecto.RegCodigo = GlbT_RegionesProyecto.RegCodigo inner join

           InmT_InmuebleProyecto on InmT_CartaOferta.pTprId = InmT_InmuebleProyecto.pTprId and InmT_CartaOferta.PryNumero = InmT_InmuebleProyecto.PryNumero left outer join
           InmT_CategoriaCliente on InmT_Cotizacion.pCategoriaId = InmT_CategoriaCliente.CategoriaId left outer join
           InmT_Estados e on InmT_InmuebleProyecto.DocEstado = e.DocEstado and e.TipoEstado = 1 left outer join
           InmT_HojaAntecedentes on InmT_CartaOferta.pEntId = InmT_HojaAntecedentes.pEntId left outer join
           InmT_EstadoCivil on InmT_HojaAntecedentes.CodEstCivilTitular = InmT_EstadoCivil.CodEstCivil left outer join
           InmT_RegimenConyugal on InmT_HojaAntecedentes.CodRegConyugalTitular = InmT_RegimenConyugal.CodRegConyugal left outer join
           InmT_Escrituracion on InmT_CartaOferta.CartaOfertaId = InmT_Escrituracion.pCartaOfertaId left outer join
           InmT_Notaria on InmT_Escrituracion.CodNotaria = InmT_Notaria.CodNotaria left outer join
           Test_InstiFinan on InmT_Escrituracion.InstCod = Test_InstiFinan.InstCod left outer join
           GlbT_Entidad GlbT_Entidad2 on Test_InstiFinan.pEntId = GlbT_Entidad2.EntId left outer join
           InmT_Clasificacion on InmT_InmuebleProyecto.ClasificaId = InmT_Clasificacion.ClasificaId left outer join
       InmT_TipoInmueble on InmT_InmuebleProyecto.TInmId = InmT_TipoInmueble.TInmId and
                                                        InmT_InmuebleProyecto.pTprId = InmT_TipoInmueble.pTprId left join
		   InmT_CarOfeItemFinan on InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId left join
           TesT_InstiFinan TesT_InstiFinan2 on InmT_CarOfeItemFinan.RefInstId = TesT_InstiFinan2.InstCod left join
           GlbT_Entidad GlbT_Entidad3 on TesT_InstiFinan2.pEntId = GlbT_Entidad3.EntId
  where InmT_CartaOferta.pEmpId = $empid
    and InmT_CartaOferta.pTprId in ($proyectos)
    and convert(int,left(convert(varchar,InmT_CartaOferta.CarOfeFecha,112),6)) between $periodoini and $periodofin
        and InmT_CartaOferta.DocEstado not in (6, 7)
        and InmT_CarOfeItemFinan.ItemFinId=4
order by InmT_InmuebleProyecto.pTprId desc,InmT_InmuebleProyecto.InmuebleCodigo