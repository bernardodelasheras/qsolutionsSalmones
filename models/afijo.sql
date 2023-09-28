select GlbT_Periodos.PerGlosa,
       rtrim(GlbT_Division.DivGlosa) DivGlosa,
       AfiT_Bien.DivCodigo,
       AfiT_Bien.AfiGrupoCod,
       rtrim(AfiT_Grupo.AfiGrupoDes) DescGrupo,
       AfiT_Bien.AfiCodigo,
       rtrim(AfiT_Bien.AfiDescripcion) DescBien,
       AfiT_Bien.AfiSubGrpCod,
       rtrim(AfiT_SubGrupo.AfiSubGrpDes) DescSubGrupo,
       AfiT_Bien.AfiCantidad,
       AfiT_Bien.AfiUbiFisicaCod,
       GlbT_Entidad.EntRut,
       AfiT_Bien.AfiUnidadCod,
       AfiT_Bien.AfiCodBarraBien,
       isnull(convert(varchar, AfiT_Bien.AfiFechaIngreso, 111),'1900/01/01') AfiFechaIngreso,
       rtrim(ConT_ConceptosImp.CdiGlosa) ConceptoImputacion,
       ConT_CentrosResp.CreCodigo,
       AfiT_BienCentroResp.AfiPorcentajeResp,
       AfiT_BienDatosCompra.AfiValorCompra,
       isnull(convert(varchar,AfiT_BienDatosCompra.AfiFechaAdq, 111),'1900/01/01') AfiFechaAdq,
       LlgT_CabeceraDoc.LlgDocNumDoc,
       rtrim(GlbT_Documentos.TdoGlosa) TipoDocumento,
       AfiT_GrupoCuentas.AfiTipoCalculoCod,
       AfiT_BienDatCont.AfiEjercicioInc,
       AfiT_BienDatCont.AfiPerMesInc,
       GlbT_Periodos.EjeAno,
       GlbT_Periodos.PerMes,
       AfiT_BienDatCont.AfiEjercicioInDep,
       AfiT_BienDatCont.AfiPerMesInDep,
       AfiT_BienDatCont.AfiVidaUtilMeses,
       AfiT_BienDatCont.AfiSaldoVUEje,
       AfiT_BienDatCont.AfiSaldoVUReal,
       AfiT_BienDatCont.AfiValorAdq,
       AfiT_BienCorrMonDep.AfiValorNeto ValorActualizado,
       AfiT_BienCorrMonDep.AfiDepAcumEjeAnt DepAcumInicial,
       AfiT_BienCorrMonDep.AfiDepAcumEjeAnt+AfiT_BienCorrMonDep.AfiDepAcumEje DepAcumActualizada,
       AfiT_BienCorrMonDep.AfiCorrMonVLEje CMValorLibro,
       AfiT_BienCorrMonDep.AfiCMDepAcumEje CMDeprecAcum,
       AfiT_BienCorrMonDep.AfiFactorCorr FactorCM,
       rtrim(AfiT_EstadoBien.AfiEstadoDes) Estado,
       ConT_CabeceraOpe.CabOpeNumero,
       ConT_Cuentas.CtaCodigo,
       rtrim(ConT_Cuentas.CtaNombre) DescCuenta,
       rtrim(EntidadEmpresa.EntRazonSocial) Empresa,
       AfiT_BienCorrMonDep.AfiDepPeriodo DepreciacionDelMes,
       AfiT_Bien.CodigoBienId BienId,
       AfiT_Bien.AfiSecuencia,
       rtrim(GlbT_Entidad.EntRazonSocial) RazonSocial
from AfiT_Bien inner join
     AfiT_BienDatCont on AfiT_Bien.CodigoBienId = AfiT_BienDatCont.pCodigoBienId inner join
     AfiT_BienCorrMonDep On AfiT_BienDatCont.DatContId = AfiT_BienCorrMonDep.pDatContId inner join
     GlbT_Empresas on AfiT_Bien.pEmpId = GlbT_Empresas.EmpId inner join
     GlbT_Entidad EntidadEmpresa on GlbT_Empresas.pEntId = EntidadEmpresa.EntId inner join
     GlbT_Periodos on AfiT_Bien.pEmpId = GlbT_Periodos.pEmpId and
                      AfiT_BienCorrMonDep.EjeAno = GlbT_Periodos.EjeAno and
                      AfiT_BienCorrMonDep.PerMes = GlbT_Periodos.PerMes inner join
     AfiT_Grupo ON AfiT_Bien.AfiGrupoCod = AfiT_Grupo.AfiGrupoCod INNER JOIN                      
     AfiT_GrupoCuentas ON AfiT_BienDatCont.AfiTipoCalculoCod = AfiT_GrupoCuentas.AfiTipoCalculoCod AND 
                          AfiT_Grupo.AfiGrupoCod = AfiT_GrupoCuentas.AfiGrupoCod AND                       
                          AfiT_Bien.pEmpId = AfiT_GrupoCuentas.pEmpId INNER JOIN                      
     AfiT_SubGrupo ON AfiT_Bien.AfiGrupoCod = AfiT_SubGrupo.AfiGrupoCod AND 
                      AfiT_Bien.AfiSubGrpCod = AfiT_SubGrupo.AfiSubGrpCod INNER JOIN                      
     ConT_Cuentas ON AfiT_GrupoCuentas.pCtaIdAct = ConT_Cuentas.CtaId inner join
     GlbT_Division on AfiT_Bien.DivCodigo = GlbT_Division.DivCodigo inner join
     AfiT_BienCentroResp on AfiT_Bien.CodigoBienId = AfiT_BienCentroResp.pCodigoBienId inner join
     ConT_ConceptosImp on AfiT_Bien.CdiCodigo = ConT_ConceptosImp.CdiCodigo inner join
     ConT_CentrosResp on AfiT_BienCentroResp.pCreId = ConT_CentrosResp.CreId inner join 
     AfiT_Ubicacion on AfiT_Bien.AfiUbiFisicaCod = AfiT_Ubicacion.AfiUbiFisicaCod left outer join
     AfiT_BienDatosCompra ON AfiT_Bien.CodigoBienId = AfiT_BienDatosCompra.pCodigoBienId LEFT OUTER JOIN
     LlgT_CabeceraDoc ON AfiT_BienDatosCompra.pCabLlgId = LlgT_CabeceraDoc.CabLlgId left outer join
     LlgT_TipoOperacion on LlgT_CabeceraDoc.pTipoOpeId = LlgT_TipoOperacion.TipoOpeId left outer join
     GlbT_Documentos on LlgT_TipoOperacion.TdoId = GlbT_Documentos.TdoId left outer join
     GlbT_Entidad on LlgT_CabeceraDoc.pEntId = GlbT_Entidad.EntId left outer join
     AfiT_EstadoBien on AfiT_BienDatCont.AfiEstado = AfiT_EstadoBien.AfiEstado left outer join
     ConT_CabeceraOpe on AfiT_BienCorrMonDep.pCabOpeId = ConT_CabeceraOpe.CabOpeId
where  AfiT_Bien.pEmpId = @empid
  and (AfiT_Bien.DivCodigo = @divcodigo or @divcodigo = 0)
  and  GlbT_Periodos.PerId between @peridi and @peridf
  and  AfiT_GrupoCuentas.AfiTipoCalculoCod = @tipocalculo