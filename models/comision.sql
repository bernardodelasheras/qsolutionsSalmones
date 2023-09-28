declare @temp table (
        idcalculocomision int identity(1,1) not null ,
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
        primary key clustered( idcalculocomision asc ))
        insert into @temp(
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
select * from fin700.dbo.inmt_calculocomision 
                        WHERE  pEmpId = @empid and
                                  (Periodo between @periododesde and  @periodohasta) and
                                  (Usuario = '@usuario' or '@usuario' = '0');


SELECT 
    a.idcalculocomision ,
    a.pEmpId,
    rtrim(e.EntRazonsocial) Empresa,
        a.pTprId,
        fin700.dbo.GlbT_TiposProyectos.TprGlosa, 
        a.Periodo, 
        a.usuario, 
        fin700.dbo.USU_USUARIOS.ID_PERSONA rut, 
        a.pCartaOfertaId,
    fin700.dbo.InmT_CartaOferta.CarOfeNumInterno,
        a.PInmuebleId InmuebleId,
        isnull(fin700.dbo.InmT_InmuebleProyecto.InmuebleCodigo, 'POOL') AS Inmueble , 
        a.TipoOpe, 
        SUM(a.Monto) AS TOTAL 

,convert(varchar, fin700.dbo.inmt_cartaoferta.fechapromesa, 103) as fechapromesa
,(select isnull(sum(b.monto),0)  from @temp b 
 where a.idcalculocomision = b.idcalculocomision
 and a.tipoope = 1 )  MontoPromesa


,convert(varchar, fin700.dbo.inmt_cartaoferta.fechaescrit, 103) as fechaescrit
,(select isnull(sum(b.monto),0)  from @temp b 
 where a.idcalculocomision = b.idcalculocomision 
 and a.tipoope = 2 ) as MontoEscritura


,convert(varchar, fin700.dbo.inmt_cartaoferta.fechapagotot, 103) as fecharecuperacion
,(select isnull(sum(b.monto),0)  from @temp b 
 where a.idcalculocomision = b.idcalculocomision
 and a.tipoope = 3 ) as MontoRecuperacion


,(select isnull(sum(b.monto),0)  from @temp b 
 where a.idcalculocomision = b.idcalculocomision
 and a.tipoope = 4 ) as montoincentivos


, convert(varchar, fin700.dbo.inmt_cartaoferta.fechadesist,103) as fecha_desis
,(select isnull(sum(b.monto),0)  from @temp b 
 where a.idcalculocomision = b.idcalculocomision
 and a.tipoope = 7 ) as MontoDesistimiento

,convert(varchar, fin700.dbo.inmt_cartaoferta.fechatraspaso,103) as fecha_traspaso
,(select isnull(sum(b.monto),0)  from @temp b 
 where a.idcalculocomision = b.idcalculocomision
 and a.tipoope = 8 ) as montotraspaso 

,(select isnull(sum(b.monto),0)  from @temp b 
 where a.idcalculocomision = b.idcalculocomision
 and a.tipoope NOT IN ( 1, 2, 3, 4, 7, 8 ) ) as montootros 

                        FROM      @temp a
                                        inner join glbt_empresas g on g.empid = a.pEmpId
										inner join glbt_entidad e on g.pentid = e.entid 
                                        LEFT JOIN fin700.dbo.GlbT_TiposProyectos ON a.pTprId = fin700.dbo.GlbT_TiposProyectos.TprId 
                                        LEFT JOIN fin700.dbo.USU_USUARIOS ON a.Usuario = fin700.dbo.USU_USUARIOS.ID_USUARIO
                                        LEFT JOIN fin700.dbo.InmT_CartaOferta  ON a.pCartaOfertaId = fin700.dbo.InmT_CartaOferta.CartaOfertaId 
                                        LEFT JOIN fin700.dbo.InmT_InmuebleProyecto ON fin700.dbo.InmT_CartaOferta.PryNumero = fin700.dbo.InmT_InmuebleProyecto.PryNumero
                                        AND fin700.dbo.InmT_CartaOferta.pTprId = fin700.dbo.InmT_InmuebleProyecto.pTprId
                        WHERE  a.pEmpId = @empid and
                                  (a.Periodo between @periododesde and  @periodohasta) and
                                  (a.Usuario = '@usuario' or '@usuario' = '0') and
                                  (InmT_CartaOferta.divcodigo = @division or @division = 0)

GROUP BY 
    a.idcalculocomision,
    a.pEmpId,
	e.EntRazonsocial,
        a.pTprId,
        fin700.dbo.GlbT_TiposProyectos.TprGlosa, 
        a.Periodo, 
        a.USUARIO, 
        fin700.dbo.USU_USUARIOS.ID_PERSONA, 
        a.pCartaOfertaId,
    fin700.dbo.InmT_CartaOferta.CarOfeNumInterno,
        a.PInmuebleId,
        fin700.dbo.InmT_InmuebleProyecto.InmuebleCodigo, 
        a.TipoOpe,
        fin700.dbo.InmT_CartaOferta.FechaPromesa,
        fin700.dbo.inmt_cartaoferta.fechaescrit,
        fin700.dbo.inmt_cartaoferta.fechapagotot,
        fin700.dbo.inmt_cartaoferta.fechadesist,
        fin700.dbo.inmt_cartaoferta.fechatraspaso
    ORDER BY 
        a.pTprId ,
        a.Periodo ,
        a.PInmuebleId,
        a.USUARIO 

        
