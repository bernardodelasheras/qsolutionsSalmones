SELECT InmT_CartaOferta.pEntId EntId 
      ,InmT_CartaOferta.CarOfeNumInterno
      ,GlbT_TiposProyectos.TprGlosa Proyecto
          ,GlbT_TiposProyectos.TprId idProyecto
          ,InmT_CartaOferta.CartaOfertaId
          ,InmT_CartaOferta.pEntId pEntId
          ,InmT_InmuebleProyecto.DivCodigo Division
          ,InmT_InmuebleProyecto.pTprId NroProyecto
          ,GlbT_Entidad.EntRut RutCliente
          ,GlbT_Entidad.EntRazonSocial NombreCliente
          ,GlbT_Entidad.EntNomFantasia NombreFantasia
          ,InmT_Estados.Descripcion EstadoInmueble
          ,Replace(InmT_HojaAntecedentes.DireccionTitular, char(9), '') Direccion
          ,GlbT_Regiones.RegNombre
          ,GlbT_Comunas.CmuNombre
          ,InmT_Vendedores.VenNombre
          ,rtrim(InmT_InmuebleProyecto.InmuebleCodigo) Inmueble

      , (select rtrim(i3.InmuebleCodigo)
                        from (select pTprId, PryNumero, row_number() over(order by prynumero) fila from InmT_CarOfeProductoAdi
                                  where pCartaOfertaId=InmT_CartaOferta.CartaOfertaId) adic
                                 inner join InmT_InmuebleProyecto i3 on i3.pTprId = adic.pTprId and i3.PryNumero = adic.PryNumero
                        where adic.fila = 1) InmuebleRelacionado1
      , (select rtrim(i3.InmuebleCodigo)
                        from (select pTprId, PryNumero, row_number() over(order by prynumero) fila from InmT_CarOfeProductoAdi
                                  where pCartaOfertaId=InmT_CartaOferta.CartaOfertaId) adic
                                 inner join InmT_InmuebleProyecto i3 on i3.pTprId = adic.pTprId and i3.PryNumero = adic.PryNumero
                        where adic.fila = 2) InmuebleRelacionado2
      , (select rtrim(i3.InmuebleCodigo)
                        from (select pTprId, PryNumero, row_number() over(order by prynumero) fila from InmT_CarOfeProductoAdi
                                  where pCartaOfertaId=InmT_CartaOferta.CartaOfertaId) adic
                                 inner join InmT_InmuebleProyecto i3 on i3.pTprId = adic.pTprId and i3.PryNumero = adic.PryNumero
                        where adic.fila = 3) InmuebleRelacionado3
      , (select rtrim(i3.InmuebleCodigo)
                        from (select pTprId, PryNumero, row_number() over(order by prynumero) fila from InmT_CarOfeProductoAdi
                                  where pCartaOfertaId=InmT_CartaOferta.CartaOfertaId) adic
                                 inner join InmT_InmuebleProyecto i3 on i3.pTprId = adic.pTprId and i3.PryNumero = adic.PryNumero
                        where adic.fila = 4) InmuebleRelacionado4

          ,InmT_Afluencia.AfluGlosa
          ,InmT_TipoVenta.TVentaGlosa
          ,InmT_TipoCliente.TcliGlosa
          ,InmT_CategoriaCliente.CategoriaGlosa
          ,InmT_ModoContacto.ModoGlosa
          ,isnull(convert(varchar, InmT_HojaAntecedentes.FechaNacTitular, 111),'1900/01/01') FechaNacimientoTitular
          ,InmT_HojaAntecedentes.TelefonoTitular
          ,InmT_HojaAntecedentes.EmailTitular
          ,InmT_EstadoCivil.GlosaEstCivil
          ,InmT_HojaAntecedentes.ProfesionTitular
          ,InmT_RegimenConyugal.GlosaRegConyugal
          ,InmT_HojaAntecedentes.Nacionalidad
          ,isnull(InmT_HojaAntecedentes.RentaLiquidaTitular,0) RentaLiquidaTitular
          ,InmT_Notaria.GlosaNotaria
          ,case isnull(GlbT_Entidad2.EntRazonSocial, ' ')
  			   when ' ' then GlbT_Entidad3.EntRazonSocial
			     else GlbT_Entidad2.EntRazonSocial
		      end EntidadFinanciera
          ,isnull(convert(varchar, InmT_CartaOferta.CarOfeFecha, 111),'1900/01/01') FechaCartaOferta
          ,isnull(convert(varchar,InmT_Escrituracion.FechaEscrit, 111),'1900/01/01') FechaEscritura
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
          ,
          InmT_CartaOferta.PryNumero
          ,(
                select isnull(sum(MontoItemDet),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
          ) UFPagadoItemsFinanciamiento
          , 0 UFPagadoEnExceso
          , inmt_inmuebleproyecto.PrecioLista
      , isnull((select isnull(i3.PrecioLista,0)
                        from (select pTprId, PryNumero, row_number() over(order by prynumero) fila from InmT_CarOfeProductoAdi
                                  where pCartaOfertaId=InmT_CartaOferta.CartaOfertaId) adic
                                 inner join InmT_InmuebleProyecto i3 on i3.pTprId = adic.pTprId and i3.PryNumero = adic.PryNumero
                        where adic.fila = 1),0) PrecioListaInmuebleRelacionado1
      , isnull((select isnull(i3.PrecioLista,0)
                        from (select pTprId, PryNumero, row_number() over(order by prynumero) fila from InmT_CarOfeProductoAdi
                                  where pCartaOfertaId=InmT_CartaOferta.CartaOfertaId) adic
                                 inner join InmT_InmuebleProyecto i3 on i3.pTprId = adic.pTprId and i3.PryNumero = adic.PryNumero
                        where adic.fila = 2),0) PrecioListaInmuebleRelacionado2
      , isnull((select isnull(i3.PrecioLista,0)
                        from (select pTprId, PryNumero, row_number() over(order by prynumero) fila from InmT_CarOfeProductoAdi
                                  where pCartaOfertaId=InmT_CartaOferta.CartaOfertaId) adic
                                 inner join InmT_InmuebleProyecto i3 on i3.pTprId = adic.pTprId and i3.PryNumero = adic.PryNumero
                        where adic.fila = 3),0) PrecioListaInmuebleRelacionado3
      , isnull((select isnull(i3.PrecioLista,0)
                        from (select pTprId, PryNumero, row_number() over(order by prynumero) fila from InmT_CarOfeProductoAdi
                                  where pCartaOfertaId=InmT_CartaOferta.CartaOfertaId) adic
                                 inner join InmT_InmuebleProyecto i3 on i3.pTprId = adic.pTprId and i3.PryNumero = adic.PryNumero
                        where adic.fila = 4),0) PrecioListaInmuebleRelacionado4

          , inmt_inmuebleproyecto.PrecioVenta
      , isnull((select isnull(i3.PrecioVenta,0)
                        from (select pTprId, PryNumero, row_number() over(order by prynumero) fila from InmT_CarOfeProductoAdi
                                  where pCartaOfertaId=InmT_CartaOferta.CartaOfertaId) adic
                                 inner join InmT_InmuebleProyecto i3 on i3.pTprId = adic.pTprId and i3.PryNumero = adic.PryNumero
                        where adic.fila = 1),0) PrecioVentaInmuebleRelacionado1
      , isnull((select isnull(i3.PrecioVenta,0)
                        from (select pTprId, PryNumero, row_number() over(order by prynumero) fila from InmT_CarOfeProductoAdi
                                  where pCartaOfertaId=InmT_CartaOferta.CartaOfertaId) adic
                                 inner join InmT_InmuebleProyecto i3 on i3.pTprId = adic.pTprId and i3.PryNumero = adic.PryNumero
                        where adic.fila = 2),0) PrecioVentaInmuebleRelacionado2
      , isnull((select isnull(i3.PrecioVenta,0)
                        from (select pTprId, PryNumero, row_number() over(order by prynumero) fila from InmT_CarOfeProductoAdi
                                  where pCartaOfertaId=InmT_CartaOferta.CartaOfertaId) adic
                                 inner join InmT_InmuebleProyecto i3 on i3.pTprId = adic.pTprId and i3.PryNumero = adic.PryNumero
                        where adic.fila = 3),0) PrecioVentaInmuebleRelacionado3
      , isnull((select isnull(i3.PrecioVenta,0)
                        from (select pTprId, PryNumero, row_number() over(order by prynumero) fila from InmT_CarOfeProductoAdi
                                  where pCartaOfertaId=InmT_CartaOferta.CartaOfertaId) adic
                                 inner join InmT_InmuebleProyecto i3 on i3.pTprId = adic.pTprId and i3.PryNumero = adic.PryNumero
                        where adic.fila = 4),0) PrecioVentaInmuebleRelacionado4

          ,0 PorcentajeVariacion
          ,0 MontoVariacion

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 1
          ),0) UFPactado_Ahorro

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 2
          ),0) UFPactado_CuotaContado                 

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 3
          ),0) UFPactado_Subsidio                      

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 4
          ),0) UFPactado_CreditoHipotecario           

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 5
          ),0) UFPactado_CreditoComplementario        

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 6
          ),0) UFPactado_LeasingHabitacional          

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 7
          ),0) UFPactado_CréditoDirecto               

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 8
          ),0) UFPactado_GastosOperacionales          

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 9
          ),0) UFPactado_Mutualidad                    

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 10
          ),0) UFPactado_Capredena                    

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 11
          ),0) UFPactado_BeneficioMinero              

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 12
          ),0) UFPactado_Reserva                       

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 13
          ),0) UFPactado_PagoEnExceso                

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 14
          ),0) UFPactado_Pie                           

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 15
          ),0) UFPactado_Pie100PorCientoCredito                           

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 16
          ),0) UFPactado_PagoDolares               

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 17
          ),0) UFPactado_ContratoAnexo                

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 18
          ),0) UFPactado_BonoDeIntregracionSocial   

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 19
          ),0) UFPactado_ExcesoDS116                 

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 20
          ),0) UFPactado_Bono                          

          ,isnull((
                select ROUND(MontoItem,2) from InmT_CarOfeItemFinan
                 where InmT_CarOfeItemFinan.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_CarOfeItemFinan.ItemFinId = 21
          ),0) UFPactado_BonoCaptacion                


          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 1
          ),0) UFMontoRecibido_Ahorro

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 2
          ),0) UFMontoRecibido_CuotaContado                 

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 3
          ),0) UFMontoRecibido_Subsidio                      

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 4
          ),0) UFMontoRecibido_CreditoHipotecario           

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 5
          ),0) UFMontoRecibido_CreditoComplementario        

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 6
          ),0) UFMontoRecibido_LeasingHabitacional          

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 7
          ),0) UFMontoRecibido_CreditoDirecto               

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 8
          ),0) UFMontoRecibido_GastosOperacionales          

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 9
          ),0) UFMontoRecibido_Mutualidad                    

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 10
          ),0) UFRecibido_Capredena

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 11
          ),0) UFMontoRecibido_BeneficioMinero              

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 12
          ),0) UFMontoRecibido_Reserva                       

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 13
          ),0) UFMontoRecibido_PagoEnExceso                

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 14
          ),0) UFMontoRecibido_Pie                           

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 15
          ),0) UFRecibido_Pie100PorCientoCredito

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 16
          ),0) UFRecibido_PagoDolares

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 17
          ),0) UFMontoRecibido_ContratoAnexo                

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 18
          ),0) UFMontoRecibido_BonoDeIntregracionSocial   

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 19
          ),0) UFMontoRecibido_ExcesoDS116                 

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 20
          ),0) UFMontoRecibido_Bono                          

          ,isnull((
                select isnull(sum(ROUND(MontoItemDet,2)),0) from InmT_PagosCartaOferta
                 where InmT_PagosCartaOferta.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId
                   and InmT_PagosCartaOferta.ItemFinId = 21
          ),0) UFMontoRecibido_BonoCaptacion                
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
          ,cmu.CmuNombre ComunaProyecto
          ,reg.RegNombre RegionProyecto 

  FROM InmT_CartaOferta inner join 
           InmT_Proyecto on InmT_Proyecto.pTprId = InmT_CartaOferta.pTprId inner join
           GlbT_Comunas cmu on InmT_Proyecto.CmuCodigo = cmu.CmuCodigo inner join
           GlbT_Regiones reg on cmu.RegCodigo = reg.RegCodigo inner join

       InmT_Cotizacion on InmT_CartaOferta.pCotizacionId = InmT_Cotizacion.CotizacionId inner join
           InmT_Afluencia on InmT_Cotizacion.AfluId = InmT_Afluencia.AfluId inner join
           InmT_TipoVenta on InmT_Cotizacion.TVentaId = InmT_TipoVenta.TVentaId inner join
           InmT_TipoCliente on InmT_Cotizacion.TcliId = InmT_TipoCliente.TcliId inner join
           (Select VenId, VenNombre from InmT_Vendedores group by VenId, VenNombre) InmT_Vendedores on InmT_Vendedores.VenId = InmT_CartaOferta.VenIdResp inner join
           InmT_Estados on InmT_CartaOferta.DocEstado = InmT_Estados.DocEstado and InmT_Estados.TipoEstado = 2 inner join
           GlbT_Entidad on InmT_CartaOferta.pEntId = GlbT_Entidad.EntId inner join
           GlbT_TiposProyectos on GlbT_TiposProyectos.TprId = InmT_CartaOferta.pTprId inner join
           InmT_InmuebleProyecto on InmT_CartaOferta.pTprId = InmT_InmuebleProyecto.pTprId 
                      and InmT_CartaOferta.PryNumero = InmT_InmuebleProyecto.PryNumero 
                      and InmT_CartaOferta.pEmpId = InmT_InmuebleProyecto.pEmpId left outer join
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
    and InmT_CartaOferta.DocEstado not in (6, 7)
    and GlbT_TiposProyectos.TprId in ($proyectos)
    and convert(int,left(convert(varchar,InmT_CartaOferta.CarOfeFecha,112),6)) between $periodoini and $periodofin
UNION
SELECT 0 EntId
      ,0 CarOfeNumInterno
      ,GlbT_TiposProyectos.TprGlosa Proyecto
      ,GlbT_TiposProyectos.TprId idProyecto
      ,0 CartaOfertaId
      ,0 pEntId
      ,InmT_InmuebleProyecto.DivCodigo Division
      ,InmT_InmuebleProyecto.pTprId NroProyecto
      ,'' EntRut 
      ,'' EntRazonSocial 
      ,''EntNomFantasia
      ,e.Descripcion EstadoInmueble
      ,'' Direccion
      ,'' RegNombre
      ,'' CmuNombre
      ,'' VenNombre
      ,rtrim(InmT_InmuebleProyecto.InmuebleCodigo) Inmueble
      ,''  InmueblesRelacionado1
      ,''  InmueblesRelacionado2
      ,''  InmueblesRelacionado3
      ,''  InmueblesRelacionado4
      ,''  AfluGlosa
      ,'' TVentaGlosa
      ,'' TcliGlosa
      ,'' CategoriaGlosa
      ,'' ModoGlosa
      ,'1900/01/01' FechaNacimientoTitular
      ,' ' TelefonoTitular
      ,'' EmailTitular
      ,'' GlosaEstCivil
      ,'' ProfesionTitular
      ,'' GlosaRegConyugal
      ,'' Nacionalidad
      ,'' RentaLiquidaTitular
      ,'' GlosaNotaria
      ,'' EntRazonSocial
      ,'1900/01/01' FechaCartaOferta
      ,'1900/01/01' FechaEscritura
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
      ,'' PryNumero
      ,0 UFPagadoItemsFinanciamiento
      ,0 UFPagadoEnExceso
      ,inmt_inmuebleproyecto.PrecioLista PrecioLista
      ,0 PrecioListaInmuebleRelacionado1
      ,0 PrecioListaInmuebleRelacionado2
      ,0 PrecioListaInmuebleRelacionado3
      ,0 PrecioListaInmuebleRelacionado4
      ,inmt_inmuebleproyecto.PrecioVenta PrecioVenta
      ,0 PrecioVentaInmuebleRelacionado1
      ,0 PrecioVentaInmuebleRelacionado2
      ,0 PrecioVentaInmuebleRelacionado3
      ,0 PrecioVentaInmuebleRelacionado4
      ,0 PorcentajeVariacion
      ,0 MontoVariacion
      ,0 UFPactado_Ahorro                           
      ,0 UFPactado_CuotaContado                 
      ,0 UFPactado_Subsidio                      
      ,0 UFPactado_CreditoHipotecario           
      ,0 UFPactado_CreditoComplementario        
      ,0 UFPactado_LeasingHabitacional          
      ,0 UFPactado_CreditoDirecto               
      ,0 UFPactado_GastosOperacionales          
      ,0 UFPactado_Mutualidad                    
      ,0 UFPactado_Capredena
      ,0 UFPactado_BeneficioMinero              
      ,0 UFPactado_Reserva                       
      ,0 UFPactado_PagoEnexceso                
      ,0 UFPactado_Pie          
      ,0 UFPactado_Pie100PorCientoCredito
      ,0 UFPactado_PagoDolares
      ,0 UFPactado_ContratoAnexo                
      ,0 UFPactado_BonoDeIntregracionSocial   
      ,0 UFPactado_ExcesoDS116                 
      ,0 UFPactado_Bono                          
      ,0 UFPactado_BonoCaptacion                
      ,0 UFMontoRecibido_Ahorro                           
      ,0 UFMontoRecibido_CuotaContado                 
      ,0 UFMontoRecibido_Subsidio                      
      ,0 UFMontoRecibido_CreditoHipotecario           
      ,0 UFMontoRecibido_CreditoComplementario        
      ,0 UFMontoRecibido_LeasingHabitacional          
      ,0 UFMontoRecibido_CreditoDirecto               
      ,0 UFMontoRecibido_GastosOperacionales          
      ,0 UFMontoRecibido_Mutualidad                    
      ,0 UFMontoRecibido_Capredena
      ,0 UFMontoRecibido_BeneficioMinero              
      ,0 UFMontoRecibido_Reserva                       
      ,0 UFMontoRecibido_PagoEnexceso                
      ,0 UFMontoRecibido_Pie                           
      ,0 UFMontoRecibido_Pie100PorCientoCredito
      ,0 UFMontoRecibido_PagoDolares
      ,0 UFMontoRecibido_ContratoAnexo                
      ,0 UFMontoRecibido_BonoDeIntregracionSocial   
      ,0 UFMontoRecibido_ExcesoDS116                 
      ,0 UFMontoRecibido_Bono                          
      ,0 UFMontoRecibido_BonoCaptacion                
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
      ,GlbT_ComunasProyecto.CmuNombre ComunaProyecto
      ,GlbT_RegionesProyecto.RegNombre RegionProyecto

  FROM InmT_InmuebleProyecto inner join
           GlbT_TiposProyectos on GlbT_TiposProyectos.TprId = InmT_InmuebleProyecto.pTprId inner join

           InmT_Proyecto on GlbT_TiposProyectos.TprId = InmT_Proyecto.pTprId and InmT_Proyecto.pEmpId = InmT_InmuebleProyecto.pEmpId inner join
           GlbT_Comunas GlbT_ComunasProyecto on InmT_Proyecto.CmuCodigo = GlbT_ComunasProyecto.CmuCodigo inner join
           GlbT_Regiones GlbT_RegionesProyecto on GlbT_ComunasProyecto.RegCodigo = GlbT_RegionesProyecto.RegCodigo left outer join

           InmT_Estados e on InmT_InmuebleProyecto.DocEstado = e.DocEstado and e.TipoEstado = 1 left outer join
           InmT_Clasificacion on InmT_InmuebleProyecto.ClasificaId = InmT_Clasificacion.ClasificaId left outer join
       InmT_TipoInmueble on InmT_InmuebleProyecto.TInmId = InmT_TipoInmueble.TInmId and
                                                        InmT_InmuebleProyecto.pTprId = InmT_TipoInmueble.pTprId
  where InmT_InmuebleProyecto.pEmpId = $empid
    and GlbT_TiposProyectos.TprId in ($proyectos)
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
ORDER BY GlbT_TiposProyectos.TprId