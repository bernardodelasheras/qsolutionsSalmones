declare @inmt_calculocomision table (
        id              int identity(1,1) not null ,
        pEmpId                  NUMERIC(9,0) NOT NULL ,
        pTprId                  NUMERIC(9,0) NOT NULL ,
        periodo         int  not null ,
        tipoope         tinyint  not null ,
        monto           float not null,
        pinmuebleid     numeric(9,0) not null ,
        usuario         char(50)  not null ,
        estado_reg      char(1) not null ,
        fec_estado_reg  datetime not null,
        fec_ing_reg     datetime not null,
        id_usuario_ing_reg char(20) not null,
        fec_ult_modif_reg datetime not null,
        id_usuario_ult_modif_reg char(20) not null ,
        id_function_ult_modif_reg char(16) not null,
        pcartaofertaid numeric(9,0) not null,
        porccomision   float not null ,
        primary key clustered( id asc ))
        insert into @inmt_calculocomision(
        pEmpId                  ,
        pTprId                  ,
        periodo         ,
        tipoope         ,
        monto           ,
        pinmuebleid     ,
        usuario         ,
        estado_reg      ,
        fec_estado_reg  ,
        fec_ing_reg     ,
        id_usuario_ing_reg ,
        fec_ult_modif_reg ,
        id_usuario_ult_modif_reg ,
        id_function_ult_modif_reg ,
        pcartaofertaid ,
        porccomision   )
select * from fin700.dbo.inmt_calculocomision ;


      Select a.id, a.pEmpId, 
             rtrim(e.EntRazonsocial) Empresa,
             a.Usuario,
             u.ID_PERSONA rut,  
             u.NOMBRE usuario,
             a.pTprId,
             t.TprGlosa, 
             isnull(i.InmuebleCodigo,'POOL') Inmueble,
             a.Periodo, 
             a.TipoOpe,
             a.pInmuebleId InmuebleId,  
             a.pCartaOfertaId,
             isnull(c.CarOfeNumInterno,0) CarOfeNumInterno,
             a.monto MontoPromesa,
             convert(varchar, c.fechapromesa, 103) as fechapromesa,
             0 MontoEscritura,
             convert(varchar, c.fechaescrit, 103) as fechaescrit,
             0 MontoRecuperacion,
             convert(varchar, c.fechapagotot, 103) as fecharecuperacion,
             0 montoincentivos,
             0 MontoDesistimiento,
             convert(varchar, c.fechadesist,103) as fecha_desis,
             0 montotraspaso,
             convert(varchar, c.fechatraspaso,103) as fecha_traspaso,
             0 montootros,
             a.monto TOTAL
        from @inmt_calculocomision  a
             inner join glbt_empresas g on g.empid = a.pEmpId
             inner join glbt_entidad e on g.pentid = e.entid 
             inner join USU_USUARIOS u on u.ID_USUARIO = a.Usuario
             left join GlbT_TiposProyectos t ON a.pTprId = t.TprId 
             left join InmT_CartaOferta c ON a.pEmpId = c.pEmpId 
                                         and a.pCartaOfertaId = c.CartaOfertaId 
             left join InmT_InmuebleProyecto i ON a.PInmuebleId = i.InmuebleId 
                                              and a.pTprId = i.pTprId
             left join InmT_Vendedores v ON c.VenIdCierre = v.VenId
        where  a.pEmpId = 3 
          and  a.Periodo between @periododesde and  @periodohasta
          and  a.TipoOpe = 1
          and (a.usuario = '@usuario' or '@usuario' = '0')
          and (c.divcodigo = @division or @division = 0)
union          
      Select a.id, a.pEmpId, 
             rtrim(e.EntRazonsocial) Empresa,
             a.Usuario,  
             u.ID_PERSONA rut,  
             u.NOMBRE,
             a.pTprId,
             t.TprGlosa, 
             isnull(i.InmuebleCodigo,'POOL') Inmueble,
             a.Periodo, 
             a.TipoOpe,
             a.pInmuebleId,  
             a.pCartaOfertaId,
             isnull(c.CarOfeNumInterno,0) NroCartaOferta,
             0 MontoPromesa,
             convert(varchar, c.fechapromesa, 103) as fechapromesa,
             a.monto MontoEscritura,
             convert(varchar, c.fechaescrit, 103) as fechaescrit,
             0 MontoRecuperacion,
             convert(varchar, c.fechapagotot, 103) as fecharecuperacion,
             0 MontoIncentivos,
             0 MontoDesistimiento,
             convert(varchar, c.fechadesist,103) as fecha_desis,
             0 MontoTraspaso,
             convert(varchar, c.fechatraspaso,103) as fecha_traspaso,
             0 MontoOtros,
             a.monto Total
        from inmt_calculocomision  a
             inner join glbt_empresas g on g.empid = a.pEmpId
             inner join glbt_entidad e on g.pentid = e.entid 
             inner join USU_USUARIOS u on u.ID_USUARIO = a.Usuario
             left join GlbT_TiposProyectos t ON a.pTprId = t.TprId 
             left join InmT_CartaOferta c ON a.pEmpId = c.pEmpId 
                                         and a.pCartaOfertaId = c.CartaOfertaId 
             left join InmT_InmuebleProyecto i ON a.PInmuebleId = i.InmuebleId 
                                              and a.pTprId = i.pTprId
             left join InmT_Vendedores v ON c.VenIdCierre = v.VenId
        where  a.pEmpId = 3 
          and  a.Periodo between @periododesde and  @periodohasta
          and  a.TipoOpe = 2
          and (a.usuario = '@usuario' or '@usuario' = '0')
          and (c.divcodigo = @division or @division = 0)
union          
      Select a.id, a.pEmpId, 
             rtrim(e.EntRazonsocial) Empresa,
             a.Usuario,  
             u.ID_PERSONA rut,  
             u.NOMBRE,
             a.pTprId,
             t.TprGlosa, 
             isnull(i.InmuebleCodigo,'POOL') Inmueble,
             a.Periodo, 
             a.TipoOpe,
             a.pInmuebleId,  
             a.pCartaOfertaId,
             isnull(c.CarOfeNumInterno,0) NroCartaOferta,
             0 MontoPromesa,
             convert(varchar, c.fechapromesa, 103) as fechapromesa,
             0 MontoEscritura,
             convert(varchar, c.fechaescrit, 103) as fechaescrit,
             a.monto MontoRecuperacion,
             convert(varchar, c.fechapagotot, 103) as fecharecuperacion,
             0 MontoIncentivos,
             0 MontoDesistimiento,
             convert(varchar, c.fechadesist,103) as fecha_desis,
             0 MontoTraspaso,
             convert(varchar, c.fechatraspaso,103) as fecha_traspaso,
             0 MontoOtros,
             a.monto Total
        from inmt_calculocomision  a
             inner join glbt_empresas g on g.empid = a.pEmpId
             inner join glbt_entidad e on g.pentid = e.entid 
             inner join USU_USUARIOS u on u.ID_USUARIO = a.Usuario
             left join GlbT_TiposProyectos t ON a.pTprId = t.TprId 
             left join InmT_CartaOferta c ON a.pEmpId = c.pEmpId 
                                         and a.pCartaOfertaId = c.CartaOfertaId 
             left join InmT_InmuebleProyecto i ON a.PInmuebleId = i.InmuebleId 
                                              and a.pTprId = i.pTprId
             left join InmT_Vendedores v ON c.VenIdCierre = v.VenId
        where  a.pEmpId = 3 
          and  a.Periodo between @periododesde and  @periodohasta
          and  a.TipoOpe = 3
          and (a.usuario = '@usuario' or '@usuario' = '0')
          and (c.divcodigo = @division or @division = 0)
union          
      Select a.id, a.pEmpId, 
             rtrim(e.EntRazonsocial) Empresa,
             a.Usuario,  
             u.ID_PERSONA rut,  
             u.NOMBRE,
             a.pTprId,
             t.TprGlosa, 
             isnull(i.InmuebleCodigo,'POOL') Inmueble,
             a.Periodo, 
             a.TipoOpe,
             a.pInmuebleId,  
             a.pCartaOfertaId,
             isnull(c.CarOfeNumInterno,0) NroCartaOferta,
             0 MontoPromesa,
             convert(varchar, c.fechapromesa, 103) as fechapromesa,
             0 MontoEscritura,
             convert(varchar, c.fechaescrit, 103) as fechaescrit,
             0 MontoRecuperacion,
             convert(varchar, c.fechapagotot, 103) as fecharecuperacion,
             a.monto MontoIncentivos,
             0 MontoDesistimiento,
             convert(varchar, c.fechadesist,103) as fecha_desis,
             0 MontoTraspaso,
             convert(varchar, c.fechatraspaso,103) as fecha_traspaso,
             0 MontoOtros,
             a.monto Total
        from inmt_calculocomision  a
             inner join glbt_empresas g on g.empid = a.pEmpId
             inner join glbt_entidad e on g.pentid = e.entid 
             inner join USU_USUARIOS u on u.ID_USUARIO = a.Usuario
             left join GlbT_TiposProyectos t ON a.pTprId = t.TprId 
             left join InmT_CartaOferta c ON a.pEmpId = c.pEmpId 
                                         and a.pCartaOfertaId = c.CartaOfertaId 
             left join InmT_InmuebleProyecto i ON a.PInmuebleId = i.InmuebleId 
                                              and a.pTprId = i.pTprId
             left join InmT_Vendedores v ON c.VenIdCierre = v.VenId
        where  a.pEmpId = 3 
          and  a.Periodo between @periododesde and  @periodohasta
          and  a.TipoOpe = 4
          and (a.usuario = '@usuario' or '@usuario' = '0')
          and (c.divcodigo = @division or @division = 0)
union          
      Select a.id, a.pEmpId, 
             rtrim(e.EntRazonsocial) Empresa,
             a.Usuario,  
             u.ID_PERSONA rut,  
             u.NOMBRE,
             a.pTprId,
             t.TprGlosa, 
             isnull(i.InmuebleCodigo,'POOL') Inmueble,
             a.Periodo, 
             a.TipoOpe,
             a.pInmuebleId,  
             a.pCartaOfertaId,
             isnull(c.CarOfeNumInterno,0) NroCartaOferta,
             0 MontoPromesa,
             convert(varchar, c.fechapromesa, 103) as fechapromesa,
             0 MontoEscritura,
             convert(varchar, c.fechaescrit, 103) as fechaescrit,
             0 MontoRecuperacion,
             convert(varchar, c.fechapagotot, 103) as fecharecuperacion,
             0 MontoIncentivos,
             a.monto MontoDesistimiento,
             convert(varchar, c.fechadesist,103) as fecha_desis,
             0 MontoTraspaso,
             convert(varchar, c.fechatraspaso,103) as fecha_traspaso,
             0 MontoOtros,
             a.monto Total
        from inmt_calculocomision  a
             inner join glbt_empresas g on g.empid = a.pEmpId
             inner join glbt_entidad e on g.pentid = e.entid 
             inner join USU_USUARIOS u on u.ID_USUARIO = a.Usuario
             left join GlbT_TiposProyectos t ON a.pTprId = t.TprId 
             left join InmT_CartaOferta c ON a.pEmpId = c.pEmpId 
                                         and a.pCartaOfertaId = c.CartaOfertaId 
             left join InmT_InmuebleProyecto i ON a.PInmuebleId = i.InmuebleId 
                                              and a.pTprId = i.pTprId
             left join InmT_Vendedores v ON c.VenIdCierre = v.VenId
        where  a.pEmpId = 3 
          and  a.Periodo between @periododesde and  @periodohasta
          and  a.TipoOpe = 7
          and (a.usuario = '@usuario' or '@usuario' = '0')
          and (c.divcodigo = @division or @division = 0)
          
union          
      Select a.id, a.pEmpId, 
             rtrim(e.EntRazonsocial) Empresa,
             a.Usuario,  
             u.ID_PERSONA rut,  
             u.NOMBRE,
             a.pTprId,
             t.TprGlosa, 
             isnull(i.InmuebleCodigo,'POOL') Inmueble,
             a.Periodo, 
             a.TipoOpe,
             a.pInmuebleId,  
             a.pCartaOfertaId,
             isnull(c.CarOfeNumInterno,0) NroCartaOferta,
             0 MontoPromesa,
             convert(varchar, c.fechapromesa, 103) as fechapromesa,
             0 MontoEscritura,
             convert(varchar, c.fechaescrit, 103) as fechaescrit,
             0 MontoRecuperacion,
             convert(varchar, c.fechapagotot, 103) as fecharecuperacion,
             0 MontoIncentivos,
             0 MontoDesistimiento,
             convert(varchar, c.fechadesist,103) as fecha_desis,
             a.monto MontoTraspaso,
             convert(varchar, c.fechatraspaso,103) as fecha_traspaso,
             0 MontoOtros,
             a.monto Total
        from inmt_calculocomision  a
             inner join glbt_empresas g on g.empid = a.pEmpId
             inner join glbt_entidad e on g.pentid = e.entid 
             inner join USU_USUARIOS u on u.ID_USUARIO = a.Usuario
             left join GlbT_TiposProyectos t ON a.pTprId = t.TprId 
             left join InmT_CartaOferta c ON a.pEmpId = c.pEmpId 
                                         and a.pCartaOfertaId = c.CartaOfertaId 
             left join InmT_InmuebleProyecto i ON a.PInmuebleId = i.InmuebleId 
                                              and a.pTprId = i.pTprId
             left join InmT_Vendedores v ON c.VenIdCierre = v.VenId
        where  a.pEmpId = 3 
          and  a.Periodo between @periododesde and  @periodohasta
          and  a.TipoOpe = 8
          and (a.usuario = '@usuario' or '@usuario' = '0')
          and (c.divcodigo = @division or @division = 0)
union          
      Select a.id, a.pEmpId, 
             rtrim(e.EntRazonsocial) Empresa,
             a.Usuario,  
             u.ID_PERSONA rut,  
             u.NOMBRE,
             a.pTprId,
             t.TprGlosa, 
             isnull(i.InmuebleCodigo,'POOL') Inmueble,
             a.Periodo, 
             a.TipoOpe,
             a.pInmuebleId,  
             a.pCartaOfertaId,
             isnull(c.CarOfeNumInterno,0) NroCartaOferta,
             0 MontoPromesa,
             convert(varchar, c.fechapromesa, 103) as fechapromesa,
             0 MontoEscritura,
             convert(varchar, c.fechaescrit, 103) as fechaescrit,
             0 MontoRecuperacion,
             convert(varchar, c.fechapagotot, 103) as fecharecuperacion,
             0 MontoIncentivos,
             0 MontoDesistimiento,
             convert(varchar, c.fechadesist,103) as fecha_desis,
             0 MontoTraspaso,
             convert(varchar, c.fechatraspaso,103) as fecha_traspaso,
             a.monto MontoOtros,
             a.monto Total
        from inmt_calculocomision  a
             inner join glbt_empresas g on g.empid = a.pEmpId
             inner join glbt_entidad e on g.pentid = e.entid 
             inner join USU_USUARIOS u on u.ID_USUARIO = a.Usuario
             left join GlbT_TiposProyectos t ON a.pTprId = t.TprId 
             left join InmT_CartaOferta c ON a.pEmpId = c.pEmpId 
                                         and a.pCartaOfertaId = c.CartaOfertaId 
             left join InmT_InmuebleProyecto i ON a.PInmuebleId = i.InmuebleId 
                                              and a.pTprId = i.pTprId
             left join InmT_Vendedores v ON c.VenIdCierre = v.VenId
        where  a.pEmpId = 3 
          and  a.Periodo between @periododesde and  @periodohasta
          and  a.TipoOpe not in (1,2,3,4,7,8)
          and (a.usuario = '@usuario' or '@usuario' = '0')
          and (c.divcodigo = @division or @division = 0)
