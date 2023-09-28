SELECT  a.pEmpId,
        a.pTprId,
        rtrim(GlbT_TiposProyectos.TprGlosa) TprGlosa, 
        InmT_InmuebleProyecto.InmuebleId,
        isnull(InmT_InmuebleProyecto.InmuebleCodigo, 'POOL') Inmueble , 
        a.Periodo, 
        USU_USUARIOS.id_persona, 
        a.usuario, 
        a.pCartaOfertaId,
        InmT_CartaOferta.CarOfeNumInterno,

        (select isnull(sum(b.monto),0)  
           from InmT_CalculoComision b 
          where a.pEmpId = b.pEmpId
            and a.pTprId = b.pTprId
            and a.Periodo = b.Periodo
            and a.PInmuebleId = b.PInmuebleId
            and a.Usuario = b.Usuario
            and a.pCartaOfertaId = b.pCartaOfertaId
            and a.tipoope = 1 )  MontoPromesa,

        inmt_cartaoferta.fechapromesa as fechapromesa,


        (select isnull(sum(b.monto),0)  
           from InmT_CalculoComision b 
          where a.pEmpId = b.pEmpId
            and a.pTprId = b.pTprId
            and a.Periodo = b.Periodo
            and a.PInmuebleId = b.PInmuebleId
            and a.Usuario = b.Usuario
            and a.pCartaOfertaId = b.pCartaOfertaId
            and a.tipoope = 2 ) as MontoEscritura,
            
        inmt_cartaoferta.fechaescrit as fechaescrit,

        (select isnull(sum(b.monto),0)  
           from InmT_CalculoComision b 
          where a.pEmpId = b.pEmpId
            and a.pTprId = b.pTprId
            and a.Periodo = b.Periodo
            and a.PInmuebleId = b.PInmuebleId
            and a.Usuario = b.Usuario
            and a.pCartaOfertaId = b.pCartaOfertaId
            and a.tipoope = 3 ) as MontoRecuperacion,
            
        inmt_cartaoferta.fechapagotot as fecharecuperacion,
 
 
        (select isnull(sum(b.monto),0)  
           from InmT_CalculoComision b 
          where a.pEmpId = b.pEmpId
            and a.pTprId = b.pTprId
            and a.Periodo = b.Periodo
            and a.PInmuebleId = b.PInmuebleId
            and a.Usuario = b.Usuario
            and a.pCartaOfertaId = b.pCartaOfertaId
            and a.tipoope = 4 ) as montoincentivos,
        
        (select isnull(sum(b.monto),0)  
           from InmT_CalculoComision b 
          where a.pEmpId = b.pEmpId
            and a.pTprId = b.pTprId
            and a.Periodo = b.Periodo
            and a.PInmuebleId = b.PInmuebleId
            and a.Usuario = b.Usuario
            and a.pCartaOfertaId = b.pCartaOfertaId
            and a.tipoope = 7 ) as MontoDesistimiento,
            
        inmt_cartaoferta.fechadesist as fechadesistimiento,            
            
        (select isnull(sum(b.monto),0)  
           from InmT_CalculoComision b 
          where a.pEmpId = b.pEmpId
            and a.pTprId = b.pTprId
            and a.Periodo = b.Periodo
            and a.PInmuebleId = b.PInmuebleId
            and a.Usuario = b.Usuario
            and a.pCartaOfertaId = b.pCartaOfertaId
            and a.tipoope = 8 ) as montotraspaso,
            
        inmt_cartaoferta.fechatraspaso as fecha_traspaso,

        (select isnull(sum(b.monto),0)  
           from InmT_CalculoComision b 
          where a.pEmpId = b.pEmpId
            and a.pTprId = b.pTprId
            and a.Periodo = b.Periodo
            and a.PInmuebleId = b.PInmuebleId
            and a.Usuario = b.Usuario
            and a.pCartaOfertaId = b.pCartaOfertaId
            and a.tipoope NOT IN ( 1, 2, 3, 4, 7, 8 ) ) as montootros,

        sum(a.Monto) AS TOTAL 

FROM
     InmT_CalculoComision a 
     inner join USU_USUARIOS ON a.Usuario = USU_USUARIOS.ID_USUARIO
     LEFT JOIN InmT_CargoUsuarioProyecto ON a.Usuario = InmT_CargoUsuarioProyecto.Usuario
                                         AND a.pTprId = InmT_CargoUsuarioProyecto.pTprId
     LEFT JOIN GlbT_TiposProyectos ON InmT_CargoUsuarioProyecto.pTprId = GlbT_TiposProyectos.TprId 
     LEFT JOIN InmT_CartaOferta  ON a.pCartaOfertaId = InmT_CartaOferta.CartaOfertaId 
     LEFT JOIN InmT_InmuebleProyecto ON InmT_CartaOferta.PryNumero = InmT_InmuebleProyecto.PryNumero
                                               AND InmT_CartaOferta.pTprId = InmT_InmuebleProyecto.pTprId
WHERE   
     a.pEmpId = @empid and
    (a.Periodo >= @periododesde and a.Periodo <= @periodohasta) and
    (a.Usuario = '@usuario' or '@usuario' = '0') and
    (InmT_CartaOferta.divcodigo = @division or @division = 0)
GROUP BY 
    a.pEmpId,
    a.pTprId,
    InmT_CargoUsuarioProyecto.pCargoId,
    GlbT_TiposProyectos.TprGlosa, 
    a.Periodo, 
    a.USUARIO, 
    USU_USUARIOS.ID_PERSONA, 
    a.pCartaOfertaId,
    InmT_CartaOferta.CarOfeNumInterno,
    a.PInmuebleId,
    InmT_InmuebleProyecto.InmuebleCodigo, 
    a.TipoOpe,
    InmT_CartaOferta.FechaPromesa,
    inmt_cartaoferta.fechaescrit,
    inmt_cartaoferta.fechapagotot,
    inmt_cartaoferta.fechadesist,
    inmt_cartaoferta.fechatraspaso,
    InmT_InmuebleProyecto.InmuebleId
ORDER BY 
    a.pTprId ,
    a.Periodo ,
    a.PInmuebleId,
    a.USUARIO 
