SET NOCOUNT ON

DECLARE @TEMP TABLE( CTAID     INT
                    , Nivel1        VARCHAR(40) NULL
                    , Nivel2        VARCHAR(40) NULL
                    , Nivel3        VARCHAR(40) NULL
                    , Nivel4        VARCHAR(40) NULL
                    , Nivel5        VARCHAR(40) NULL
                    , Nivel6        VARCHAR(40) NULL
                    , Nivel7        VARCHAR(40) NULL
 )


 INSERT INTO @TEMP
 SELECT CTAID, 

 (select RTRIM(clactanodonombre)  from cont_clasificacuentas 
   where ppdcid = CLA.pPdcId
     and clactanivel1 = (select clactanivel1 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId ) 
     and clactanivel2 = 0
         and clactanivel3 = 0 
         and ClaCtaNivel4 = 0 
         and clactanivel5 = 0 
         and clactanivel6 = 0
     and clactanivel7 = 0  
         and (pctaid = 0 or pctaid = CONT_CUENTAS.CtaId ) and clactanodonivel = 1) 
  as clactanodonivel1,


 (select RTRIM(clactanodonombre)  from cont_clasificacuentas 
   where ppdcid = CLA.pPdcId
     and clactanivel1 = (select clactanivel1 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId ) 
     and clactanivel2 = (select clactanivel2 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and clactanivel3 = 0 
         and ClaCtaNivel4 = 0 
         and clactanivel5 = 0 
         and clactanivel6 = 0
     and clactanivel7 = 0  
         and (pctaid = 0 or pctaid = CONT_CUENTAS.CtaId ) and clactanodonivel = 2) 
  as clactanodonivel2,


 (select RTRIM(clactanodonombre)  from cont_clasificacuentas 
   where ppdcid = CLA.pPdcId
     and clactanivel1 = (select clactanivel1 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId ) 
     and clactanivel2 = (select clactanivel2 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and clactanivel3 = (select clactanivel3 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and ClaCtaNivel4 = 0 
         and clactanivel5 = 0 
         and clactanivel6 = 0
     and clactanivel7 = 0  
         and (pctaid = 0 or pctaid = CONT_CUENTAS.CtaId ) and clactanodonivel = 3) 
  as clactanodonivel3,

 (select RTRIM(clactanodonombre)  from cont_clasificacuentas 
   where ppdcid = CLA.pPdcId
     and clactanivel1 = (select clactanivel1 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId ) 
     and clactanivel2 = (select clactanivel2 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and clactanivel3 = (select clactanivel3 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and ClaCtaNivel4 = (select clactanivel4 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and clactanivel5 = 0 
         and clactanivel6 = 0
     and clactanivel7 = 0  
         and (pctaid = 0 or pctaid = CONT_CUENTAS.CtaId ) and clactanodonivel = 4) 
  as clactanodonivel4,


 (select RTRIM(clactanodonombre)  from cont_clasificacuentas 
   where ppdcid = CLA.pPdcId
     and clactanivel1 = (select clactanivel1 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId ) 
     and clactanivel2 = (select clactanivel2 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and clactanivel3 = (select clactanivel3 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and ClaCtaNivel4 = (select clactanivel4 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and clactanivel5 = (select clactanivel5 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and clactanivel6 = 0
     and clactanivel7 = 0  
         and (pctaid = 0 or pctaid = CONT_CUENTAS.CtaId ) and clactanodonivel = 5) 
  as clactanodonivel5,

 (select RTRIM(clactanodonombre)  from cont_clasificacuentas 
   where ppdcid = CLA.pPdcId
     and clactanivel1 = (select clactanivel1 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId ) 
     and clactanivel2 = (select clactanivel2 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and clactanivel3 = (select clactanivel3 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and ClaCtaNivel4 = (select clactanivel4 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and clactanivel5 = (select clactanivel5 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and clactanivel6 = (select clactanivel6 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
     and clactanivel7 = 0  
         and (pctaid = 0 or pctaid = CONT_CUENTAS.CtaId ) and clactanodonivel = 6) 
  as clactanodonivel6,

 (select RTRIM(clactanodonombre)  from cont_clasificacuentas 
   where ppdcid = CLA.pPdcId
     and clactanivel1 = (select clactanivel1 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId ) 
     and clactanivel2 = (select clactanivel2 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and clactanivel3 = (select clactanivel3 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and ClaCtaNivel4 = (select clactanivel4 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and clactanivel5 = (select clactanivel5 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and clactanivel6 = (select clactanivel6 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
     and clactanivel7 = (select clactanivel7 from cont_clasificacuentas where pctaid = CONT_CUENTAS.CtaId  and ppdcid = CLA.pPdcId )   
         and (pctaid = 0 or pctaid = CONT_CUENTAS.CtaId ) and clactanodonivel = 7) 
  as clactanodonivel7

   FROM CONT_CUENTAS INNER JOIN
        CONT_CLASIFICACUENTAS CLA ON CLA.PCTAID = CONT_CUENTAS.CTAID
  WHERE CLA.pPdcId = $pdcid



SELECT

  ccet_Movimientos.pEmpId
, glbt_Entidad.EntRazonSocial 
, ccet_Movimientos.DivCodigo
, glbt_Division.DivGlosa
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, cont_Cuentas.CtaCodigo
, cont_Cuentas.CtaNombre
, ''
, ''
, SUM(ccet_Movimientos.MovCceMontoImpuDebe)
, SUM(ccet_Movimientos.MovCceMontoImpuHaber)
, SUM(ccet_Movimientos.MovCceMontoLocalDebe)
, SUM(ccet_Movimientos.MovCceMontoLocalHaber)
, SUM(ccet_Movimientos.MovCceMontoConvDebe)
, SUM(ccet_Movimientos.MovCceMontoConvHaber)
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, 'SALDOS INICIALES ccet_in_1011v10'

, Nivel1, Nivel2, Nivel3, Nivel4, Nivel5, Nivel6, Nivel7

,   ''
,   ''
,''
,'' 
,'' 
,'' 

from  ccet_movimientos 
      inner join @temp tmp on tmp.ctaid = ccet_movimientos.pctaid
      left join llgt_cabeceradoc on  ccet_movimientos.pcabopeid = llgt_cabeceradoc.CabLlgId
          left join llgt_movimientos on ccet_movimientos.pcabopeid = llgt_movimientos.pcabllgid
          and ccet_movimientos.cabopelinea = llgt_movimientos.cabopelinea
          LEFT JOIN glbt_Empresas ON ccet_Movimientos.pEmpId = glbt_Empresas.EmpId
      LEFT JOIN glbt_Entidad ON glbt_Empresas.pEntId = glbt_Entidad.EntId
          LEFT JOIN glbt_Division ON ccet_Movimientos.DivCodigo = glbt_Division.DivCodigo
          LEFT JOIN glbt_Periodos ON (ccet_Movimientos.pEmpId = glbt_Periodos.pEmpId) 
          AND (ccet_Movimientos.PerId = glbt_Periodos.PerId) 
          LEFT JOIN glbt_Sistemas ON ccet_Movimientos.SisCodOri = glbt_Sistemas.SisCodOri 
          LEFT JOIN llgt_TipoOperacion ON ccet_movimientos.pEmpId = llgt_TipoOperacion.pEmpId 
          AND  llgt_cabeceradoc.pTipoOpeId = llgt_TipoOperacion.TipoOpeId
          LEFT JOIN cont_Estados ON llgt_Cabeceradoc.llgdocestado= cont_Estados.ConEstCod
          AND cont_Estados.ConEstTipoEstado = 'CBTE'
          LEFT JOIN cont_Cuentas ON ccet_Movimientos.pCtaId = cont_Cuentas.CtaId 
      LEFT JOIN glbt_Monedas ON llgt_Cabeceradoc.pMonedaId = glbt_Monedas.MonedaId 
          LEFT JOIN cont_CentrosResp ON ccet_Movimientos.pCreId = cont_CentrosResp.CreId 
          LEFT JOIN cont_ConceptosImp ON ccet_Movimientos.CdiCodigo = cont_ConceptosImp.CdiCodigo
          LEFT JOIN glbt_Entidad AS Entidad1 ON llgt_Cabeceradoc.pEntId = Entidad1.EntId 
          LEFT JOIN glbt_Documentos ON llgt_movimientos.TdoId = glbt_Documentos.TdoId 
          left join cont_CabeceraCom on  ccet_movimientos.pCabCompId = cont_CabeceraCom.CabCompId
          LEFT JOIN cont_TipoComprobante ON (cont_CabeceraCom.pEmpId = cont_TipoComprobante.pEmpId) 
          AND (cont_CabeceraCom.TcoId = cont_TipoComprobante.TcoId)
          LEFT JOIN  cont_TipoCuenta ON cont_Cuentas.TctId = cont_TipoCuenta.TctId
          LEFT JOIN  cont_ClasificaCuentas ON ccet_Movimientos.pCtaId = cont_ClasificaCuentas.pCtaId 
          

where ccet_movimientos.pempid = $pempid
and ccet_movimientos.siscodori in (10,11)
and ccet_movimientos.perid < $perid 
and llgt_Cabeceradoc.llgdocestado = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and ((select glbt_periodos.EjeAno 
      from fin700.dbo.glbt_periodos  
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from fin700.dbo.glbt_periodos  
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = ccet_movimientos.perid))
GROUP BY 

ccet_Movimientos.pEmpId
, glbt_Entidad.EntRazonSocial 
, ccet_Movimientos.DivCodigo
, glbt_Division.DivGlosa
, cont_Cuentas.CtaCodigo
, cont_Cuentas.CtaNombre
, CCET_MOVIMIENTOS.PCTAID, Nivel1, Nivel2, Nivel3, Nivel4, Nivel5, Nivel6, Nivel7 
UNION
select  
  ccet_Movimientos.pEmpId
, glbt_Entidad.EntRazonSocial 
, ccet_Movimientos.DivCodigo
, glbt_Division.DivGlosa
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, cont_Cuentas.CtaCodigo
, cont_Cuentas.CtaNombre
, ''
, ''
, SUM(ccet_Movimientos.MovCceMontoImpuDebe)
, SUM(ccet_Movimientos.MovCceMontoImpuHaber)
, SUM(ccet_Movimientos.MovCceMontoLocalDebe)
, SUM(ccet_Movimientos.MovCceMontoLocalHaber)
, SUM(ccet_Movimientos.MovCceMontoConvDebe)
, SUM(ccet_Movimientos.MovCceMontoConvHaber)
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, 'SALDOS INICIALES ccet_notin_1011v10'
, Nivel1, Nivel2, Nivel3, Nivel4, Nivel5, Nivel6, Nivel7

,   ''
,   ''
,''
,'' 
,'' 
,'' 

from  ccet_movimientos
      inner join @temp tmp on tmp.ctaid = ccet_movimientos.pctaid
          left join cont_cabeceraope on  ccet_movimientos.pcabopeid = cont_cabeceraope.cabopeid
          LEFT JOIN glbt_Empresas ON ccet_Movimientos.pEmpId = glbt_Empresas.EmpId
          LEFT JOIN glbt_Entidad ON glbt_Empresas.pEntId = glbt_Entidad.EntId
          LEFT JOIN glbt_Division ON ccet_Movimientos.DivCodigo = glbt_Division.DivCodigo
          LEFT JOIN glbt_Periodos ON (ccet_Movimientos.pEmpId = glbt_Periodos.pEmpId) 
          AND (ccet_Movimientos.PerId = glbt_Periodos.PerId) 
          LEFT JOIN glbt_Sistemas ON ccet_Movimientos.SisCodOri = glbt_Sistemas.SisCodOri 
          LEFT JOIN cont_TipoOperacion ON ccet_movimientos.pEmpId = cont_TipoOperacion.pEmpId 
          AND  cont_cabeceraope.pTipoOpeId = ConT_TipoOperacion.TipoOpeId
          LEFT JOIN cont_Estados ON cont_cabeceraope.conestcod= cont_Estados.ConEstCod
          AND cont_Estados.ConEstTipoEstado = 'CBTE'
          LEFT JOIN cont_Cuentas ON ccet_Movimientos.pCtaId = cont_Cuentas.CtaId 
          LEFT JOIN CONT_DETALLECOM ON ccet_Movimientos.PDETCOMPID = CONT_DETALLECOM.DETCOMPID 
          LEFT JOIN glbt_Monedas ON CONT_DETALLECOM.pMonedaId = glbt_Monedas.MonedaId 
          LEFT JOIN cont_CentrosResp ON ccet_Movimientos.pCreId = cont_CentrosResp.CreId 
          LEFT JOIN cont_ConceptosImp ON ccet_Movimientos.CdiCodigo = cont_ConceptosImp.CdiCodigo
          LEFT JOIN glbt_Entidad AS Entidad1 ON cont_cabeceraope.pEntId = Entidad1.EntId 
          LEFT join cont_CabeceraCom on  ccet_movimientos.pCabCompId = cont_CabeceraCom.CabCompId
          LEFT JOIN cont_TipoComprobante ON (cont_CabeceraCom.pEmpId = cont_TipoComprobante.pEmpId) 
          AND (cont_CabeceraCom.TcoId = cont_TipoComprobante.TcoId)
          LEFT JOIN  cont_TipoCuenta ON cont_Cuentas.TctId = cont_TipoCuenta.TctId
          LEFT JOIN  cont_ClasificaCuentas ON ccet_Movimientos.pCtaId = cont_ClasificaCuentas.pCtaId  
          LEFT JOIN CCET_DOCUMENTOS ON CCET_MOVIMIENTOS.PDOCCCEID = CCET_DOCUMENTOS.DOCCCEID
          LEFT JOIN glbt_Entidad AS Entidad2 ON CCET_DOCUMENTOS.pEntId = Entidad2.EntId  
          LEFT JOIN glbt_Documentos ON ccet_documentos.tdoid = glbt_Documentos.TdoId 

          
          

where ccet_movimientos.pempid = $pempid
and ccet_movimientos.siscodori not in (10,11)
and ccet_movimientos.perid < $perid 
and cont_Cabeceraope.conestcod = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and ((select glbt_periodos.EjeAno 
      from fin700.dbo.glbt_periodos  
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from fin700.dbo.glbt_periodos  
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = ccet_movimientos.perid))
GROUP BY 
  ccet_Movimientos.pEmpId
, glbt_Entidad.EntRazonSocial 
, ccet_Movimientos.DivCodigo
, glbt_Division.DivGlosa
, cont_Cuentas.CtaCodigo
, cont_Cuentas.CtaNombre
, CCET_MOVIMIENTOS.PCTAID, Nivel1, Nivel2, Nivel3, Nivel4, Nivel5, Nivel6, Nivel7

UNION 

select  
  cont_Movimientos.pEmpId
, glbt_Entidad.EntRazonSocial 
, cont_Movimientos.DivCodigo
, glbt_Division.DivGlosa
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, cont_Cuentas.CtaCodigo
, cont_Cuentas.CtaNombre
, ''
, ''
, SUM(cont_Movimientos.MovconMontoImpuDebe)
, SUM(cont_Movimientos.MovConMontoImpuHaber)
, SUM(cont_Movimientos.MovConMontoLocalDebe)
, SUM(cont_Movimientos.MovConMontoLocalHaber)
, SUM(cont_Movimientos.MovConMontoConvDebe)
, SUM(cont_Movimientos.MovConMontoConvHaber)
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, 'SALDOS INICIALES cont_movimientos_in1011v10'
, Nivel1, Nivel2, Nivel3, Nivel4, Nivel5, Nivel6, Nivel7 

,   ''
,   ''
,   ''
,   '' 
,   '' 
,   '' 

from  cont_movimientos
      inner join @temp tmp on tmp.ctaid = cont_movimientos.pctaid
      left join llgt_cabeceradoc on  cont_movimientos.pcabopeid = llgt_cabeceradoc.CabLlgId
          left join llgt_movimientos on cont_movimientos.pcabopeid = llgt_movimientos.pcabllgid
          and cont_movimientos.cabopelinea = llgt_movimientos.cabopelinea
          LEFT JOIN glbt_Empresas ON cont_Movimientos.pEmpId = glbt_Empresas.EmpId
      LEFT JOIN glbt_Entidad ON glbt_Empresas.pEntId = glbt_Entidad.EntId
          LEFT JOIN glbt_Division ON cont_Movimientos.DivCodigo = glbt_Division.DivCodigo
          LEFT JOIN glbt_Periodos ON (cont_Movimientos.pEmpId = glbt_Periodos.pEmpId) 
          AND (cont_Movimientos.PerId = glbt_Periodos.PerId) 
          LEFT JOIN glbt_Sistemas ON cont_Movimientos.SisCodOri = glbt_Sistemas.SisCodOri 
          LEFT JOIN llgt_TipoOperacion ON cont_movimientos.pEmpId = llgt_TipoOperacion.pEmpId 
          AND  llgt_cabeceradoc.pTipoOpeId = llgt_TipoOperacion.TipoOpeId
          LEFT JOIN cont_Estados ON llgt_Cabeceradoc.llgdocestado= cont_Estados.ConEstCod
          AND cont_Estados.ConEstTipoEstado = 'CBTE'
          LEFT JOIN cont_Cuentas ON cont_Movimientos.pCtaId = cont_Cuentas.CtaId 
      LEFT JOIN glbt_Monedas ON llgt_Cabeceradoc.pMonedaId = glbt_Monedas.MonedaId 
          LEFT JOIN cont_CentrosResp ON cont_Movimientos.pCreId = cont_CentrosResp.CreId 
          LEFT JOIN cont_ConceptosImp ON cont_Movimientos.CdiCodigo = cont_ConceptosImp.CdiCodigo
          LEFT JOIN glbt_Entidad AS Entidad1 ON llgt_Cabeceradoc.pEntId = Entidad1.EntId 
          LEFT JOIN glbt_Documentos ON llgt_movimientos.TdoId = glbt_Documentos.TdoId 
          left join cont_CabeceraCom on  cont_movimientos.pCabCompId = cont_CabeceraCom.CabCompId
          LEFT JOIN cont_TipoComprobante ON (cont_CabeceraCom.pEmpId = cont_TipoComprobante.pEmpId) 
          AND (cont_CabeceraCom.TcoId = cont_TipoComprobante.TcoId)
          LEFT JOIN  cont_TipoCuenta ON cont_Cuentas.TctId = cont_TipoCuenta.TctId
          LEFT JOIN  cont_ClasificaCuentas ON cont_Movimientos.pCtaId = cont_ClasificaCuentas.pCtaId 
          

where cont_movimientos.pempid = $pempid
and cont_movimientos.siscodori in (10,11)
and cont_movimientos.perid < $perid 
and llgt_Cabeceradoc.llgdocestado = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and ((select glbt_periodos.EjeAno 
      from fin700.dbo.glbt_periodos  
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from fin700.dbo.glbt_periodos  
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = cont_movimientos.perid))
GROUP BY 
 cont_Movimientos.pEmpId
, glbt_Entidad.EntRazonSocial 
, cont_Movimientos.DivCodigo
, glbt_Division.DivGlosa
, cont_Cuentas.CtaCodigo
, cont_Cuentas.CtaNombre
, CONT_MOVIMIENTOS.PCTAID, Nivel1, Nivel2, Nivel3, Nivel4, Nivel5, Nivel6, Nivel7

UNION 

select  
  cont_Movimientos.pEmpId
, glbt_Entidad.EntRazonSocial 
, cont_Movimientos.DivCodigo
, glbt_Division.DivGlosa
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, cont_Cuentas.CtaCodigo
, cont_Cuentas.CtaNombre
, ''
, ''
, SUM(cont_Movimientos.MovconMontoImpuDebe)
, SUM(cont_Movimientos.MovconMontoImpuHaber)
, SUM(cont_Movimientos.MovconMontoLocalDebe)
, SUM(cont_Movimientos.MovconMontoLocalHaber)
, SUM(cont_Movimientos.MovconMontoConvDebe)
, SUM(cont_Movimientos.MovconMontoConvHaber)
, ''
, ''
, ''
, ''
, ''
, ''
,''
,''
,''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, 'SALDOS INCIALES cont_movimientos_not_in_1011v10'

, Nivel1, Nivel2, Nivel3, Nivel4, Nivel5, Nivel6, Nivel7

,   ''
,   ''
,    ''
,    ''
,    '' 
,    '' 

from  cont_movimientos
      inner join @temp tmp on tmp.ctaid = cont_movimientos.pctaid
      left join cont_cabeceraope on  cont_movimientos.pcabopeid = cont_cabeceraope.cabopeid
          LEFT JOIN glbt_Empresas ON cont_Movimientos.pEmpId = glbt_Empresas.EmpId
      LEFT JOIN glbt_Entidad ON glbt_Empresas.pEntId = glbt_Entidad.EntId
          LEFT JOIN glbt_Division ON cont_Movimientos.DivCodigo = glbt_Division.DivCodigo
          LEFT JOIN glbt_Periodos ON (cont_Movimientos.pEmpId = glbt_Periodos.pEmpId) 
          AND (cont_Movimientos.PerId = glbt_Periodos.PerId) 
          LEFT JOIN glbt_Sistemas ON cont_Movimientos.SisCodOri = glbt_Sistemas.SisCodOri 
          LEFT JOIN cont_TipoOperacion ON cont_movimientos.pEmpId = cont_TipoOperacion.pEmpId 
          AND  cont_cabeceraope.pTipoOpeId = ConT_TipoOperacion.TipoOpeId
          LEFT JOIN cont_Estados ON cont_cabeceraope.conestcod= cont_Estados.ConEstCod
          AND cont_Estados.ConEstTipoEstado = 'CBTE'
          LEFT JOIN cont_Cuentas ON cont_Movimientos.pCtaId = cont_Cuentas.CtaId 
      LEFT JOIN glbt_Monedas ON cont_movimientos.pMonedaId = glbt_Monedas.MonedaId 
          LEFT JOIN cont_CentrosResp ON cont_Movimientos.pCreId = cont_CentrosResp.CreId 
          LEFT JOIN cont_ConceptosImp ON cont_Movimientos.CdiCodigo = cont_ConceptosImp.CdiCodigo
          LEFT JOIN glbt_Entidad AS Entidad1 ON cont_cabeceraope.pEntId = Entidad1.EntId 
          LEFT join cont_CabeceraCom on  cont_movimientos.pCabCompId = cont_CabeceraCom.CabCompId
          LEFT JOIN cont_TipoComprobante ON (cont_CabeceraCom.pEmpId = cont_TipoComprobante.pEmpId) 
          AND (cont_CabeceraCom.TcoId = cont_TipoComprobante.TcoId)
          LEFT JOIN  cont_TipoCuenta ON cont_Cuentas.TctId = cont_TipoCuenta.TctId
          LEFT JOIN  cont_ClasificaCuentas ON cont_Movimientos.pCtaId = cont_ClasificaCuentas.pCtaId 
          
where 
cont_movimientos.pempid = $pempid
and cont_movimientos.perid < $perid 
and cont_Cabeceraope.conestcod = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and cont_movimientos.siscodori not in(10,11)
and ((select glbt_periodos.EjeAno 
      from fin700.dbo.glbt_periodos  
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from fin700.dbo.glbt_periodos  
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = cont_movimientos.perid))

GROUP BY 
cont_Movimientos.pEmpId
, glbt_Entidad.EntRazonSocial 
, cont_Movimientos.DivCodigo
, glbt_Division.DivGlosa
, cont_Cuentas.CtaCodigo
, cont_Cuentas.CtaNombre
, CONT_MOVIMIENTOS.PCTAID, Nivel1, Nivel2, Nivel3, Nivel4, Nivel5, Nivel6, Nivel7

UNION 

select  
  test_Movimientos.pEmpId
, glbt_Entidad.EntRazonSocial 
, test_Movimientos.DivCodigo
, glbt_Division.DivGlosa
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, cont_Cuentas.CtaCodigo
, cont_Cuentas.CtaNombre
, ''
, ''
, SUM(test_Movimientos.MovtesMontoImpuDebe)
, SUM(test_Movimientos.MovtesMontoImpuHaber)
, SUM(test_Movimientos.MovtesMontoLocalDebe)
, SUM(test_Movimientos.MovtesMontoLocalHaber)
, SUM(test_Movimientos.MovtesMontoConvDebe)
, SUM(test_Movimientos.MovtesMontoConvHaber)
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, 'SALDOS INICIALES test_movimientosv10' 

, Nivel1, Nivel2, Nivel3, Nivel4, Nivel5, Nivel6, Nivel7

,   ''
,   ''
,   ''
,   ''
,   ''
,   ''

from  test_movimientos
      inner join @temp tmp on tmp.ctaid = test_movimientos.pctaid
      left join cont_cabeceraope on  test_movimientos.pcabopeid = cont_cabeceraope.cabopeid
          LEFT JOIN glbt_Empresas ON test_Movimientos.pEmpId = glbt_Empresas.EmpId
      LEFT JOIN glbt_Entidad ON glbt_Empresas.pEntId = glbt_Entidad.EntId
          LEFT JOIN glbt_Division ON test_Movimientos.DivCodigo = glbt_Division.DivCodigo
          LEFT JOIN glbt_Periodos ON (test_Movimientos.pEmpId = glbt_Periodos.pEmpId) 
          AND (test_Movimientos.PerId = glbt_Periodos.PerId) 
          LEFT JOIN glbt_Sistemas ON test_Movimientos.SisCodOri = glbt_Sistemas.SisCodOri 
          LEFT JOIN cont_TipoOperacion ON test_movimientos.pEmpId = cont_TipoOperacion.pEmpId 
          AND  cont_cabeceraope.pTipoOpeId = ConT_TipoOperacion.TipoOpeId
          LEFT JOIN cont_Estados ON cont_cabeceraope.conestcod= cont_Estados.ConEstCod
          AND cont_Estados.ConEstTipoEstado = 'CBTE'
          LEFT JOIN cont_Cuentas ON test_Movimientos.pCtaId = cont_Cuentas.CtaId 
      LEFT JOIN glbt_Monedas ON test_Movimientos.pMonedaId = glbt_Monedas.MonedaId 
          LEFT JOIN cont_CentrosResp ON test_Movimientos.pCreId = cont_CentrosResp.CreId 
          LEFT JOIN cont_ConceptosImp ON test_Movimientos.CdiCodigo = cont_ConceptosImp.CdiCodigo
          LEFT JOIN glbt_Entidad AS Entidad1 ON cont_cabeceraope.pEntId = Entidad1.EntId 
          LEFT join cont_CabeceraCom on  test_movimientos.pCabCompId = cont_CabeceraCom.CabCompId
          LEFT JOIN glbt_Documentos ON cont_cabeceraope.pTipoopeid = glbt_Documentos.TdoId 
          LEFT JOIN cont_TipoComprobante ON (cont_CabeceraCom.pEmpId = cont_TipoComprobante.pEmpId) 
          AND (cont_CabeceraCom.TcoId = cont_TipoComprobante.TcoId)
          LEFT JOIN  cont_TipoCuenta ON cont_Cuentas.TctId = cont_TipoCuenta.TctId
          LEFT JOIN  cont_ClasificaCuentas ON test_Movimientos.pCtaId = cont_ClasificaCuentas.pCtaId 
          LEFT JOIN  test_ctactesbancarias ON test_Movimientos.Pctactebcoid = test_ctactesbancarias.ctactebcoid
          LEFT JOIN test_instifinan ON test_ctactesbancarias.INSTCOD = test_instifinan.INSTCOD
          LEFT JOIN GLBT_ENTIDAD as entidad2 on test_instifinan.pentid =entidad2.entid 
          LEFT JOIN test_codigosfin ON test_Movimientos.CFICODIGO = test_codigosfin.CFICODIGO 


where test_movimientos.pempid = $pempid
and test_movimientos.perid < $perid 
and cont_Cabeceraope.conestcod = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and ((select glbt_periodos.EjeAno 
      from fin700.dbo.glbt_periodos  
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from fin700.dbo.glbt_periodos  
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = test_movimientos.perid))
GROUP BY
  test_Movimientos.pEmpId
, glbt_Entidad.EntRazonSocial 
, test_Movimientos.DivCodigo
, glbt_Division.DivGlosa
, cont_Cuentas.CtaCodigo
, cont_Cuentas.CtaNombre
, TEST_MOVIMIENTOS.PCTAID , Nivel1, Nivel2, Nivel3, Nivel4, Nivel5, Nivel6, Nivel7

UNION 

SELECT
  cont_CabeceraCom.pEmpId
, glbt_Entidad.EntRazonSocial
, cont_CabeceraCom.DivCodigo
, glbt_Division.DivGlosa
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, cont_Cuentas.CtaCodigo
, cont_Cuentas.CtaNombre
, ''
, ''
, SUM(cont_DetalleCom.MovCceMontoImpuDebe)
, SUM(cont_DetalleCom.MovCceMontoImpuHaber)
, SUM(cont_DetalleCom.MovCceMontoLocalDebe)
, SUM(cont_DetalleCom.MovCceMontoLocalHaber)
, SUM(cont_DetalleCom.MovCceMontoConvDebe)
, SUM(cont_DetalleCom.MovCceMontoConvHaber)
, ''
, ''
, ''         
, ''    
, '' 
, ''  
, ''   
, ''  
, ''
, ''
, ''
, ''
, ''
, ''
, ''
, ''
,'SALDOS INICIALES saldosinicialesv10'
, Nivel1, Nivel2, Nivel3, Nivel4, Nivel5, Nivel6, Nivel7

,   ''
,   ''
,''
,''
,''
,'' 

FROM fin700.dbo.cont_CabeceraCom INNER JOIN fin700.dbo.cont_DetalleCom 
ON cont_CabeceraCom.CabCompId = cont_DetalleCom.pCabCompId  
inner join @temp tmp on tmp.ctaid = cont_detallecom.pctaid
LEFT JOIN fin700.dbo.cont_ClasificaCuentas ON cont_DetalleCom.pCtaId = cont_ClasificaCuentas.pCtaId  
LEFT JOIN fin700.dbo.cont_Cuentas ON cont_ClasificaCuentas.pCtaId = cont_Cuentas.CtaId  
LEFT JOIN fin700.dbo.glbt_Empresas ON cont_CabeceraCom.pEmpId = glbt_Empresas.EmpId  
LEFT JOIN fin700.dbo.glbt_Entidad ON glbt_Empresas.pEntId = glbt_Entidad.EntId  
LEFT JOIN fin700.dbo.glbt_Sistemas ON cont_CabeceraCom.SisCodOri = glbt_Sistemas.SisCodOri  
LEFT JOIN fin700.dbo.glbt_Periodos ON  cont_CabeceraCom.PerId = glbt_Periodos.PerId  
AND  cont_CabeceraCom.pEmpId = glbt_Periodos.pEmpId   
LEFT JOIN fin700.dbo.glbt_Division ON cont_CabeceraCom.DivCodigo = glbt_Division.DivCodigo  
LEFT JOIN fin700.dbo.cont_TipoOperacion ON cont_CabeceraCom.pTipoOpeId = cont_TipoOperacion.TipoOpeId  
LEFT JOIN fin700.dbo.cont_Estados ON cont_CabeceraCom.ComEstadoCod = cont_Estados.ConEstCod  
LEFT JOIN fin700.dbo.glbt_Monedas ON cont_DetalleCom.pMonedaId = glbt_Monedas.MonedaId  
LEFT JOIN fin700.dbo.cont_CentrosResp ON cont_DetalleCom.pCreId = cont_CentrosResp.CreId  
LEFT JOIN fin700.dbo.cont_TipoComprobante ON  cont_CabeceraCom.pEmpId = cont_TipoComprobante.pEmpId  
AND  cont_CabeceraCom.TcoId = cont_TipoComprobante.TcoId   
LEFT JOIN fin700.dbo.cont_TipoCuenta ON  cont_Cuentas.TctId = cont_TipoCuenta.TctId  
AND  cont_Cuentas.TctId = cont_TipoCuenta.TctId 

WHERE    cont_CabeceraCom.pEmpId = $pempid  
AND   cont_Estados.ConEstTipoEstado = 'CBTE'  
AND   cont_ClasificaCuentas.pCtaId <> 0  
AND   cont_ClasificaCuentas.pPdcId = $pdcid
AND   cont_CabeceraCom.PerId <= $perid 
and cont_cabeceracom.ComEstadoCod = 5
and cont_cabeceracom.perid =   ( select glbt_periodos.PerId from fin700.dbo.glbt_periodos
                                           where glbt_periodos.pempid = $pempid
                                           and glbt_periodos.permes = 0 
                                           and glbt_periodos.EjeAno = (select glbt_periodos.EjeAno 
                                           from fin700.dbo.glbt_periodos 
                                           where glbt_periodos.perid = $perid
                                           and glbt_periodos.pempid = $pempid )) 
GROUP BY 
 cont_CabeceraCom.pEmpId
, glbt_Entidad.EntRazonSocial
, cont_CabeceraCom.DivCodigo
, glbt_Division.DivGlosa
, cont_Cuentas.CtaCodigo
, cont_Cuentas.CtaNombre
, CONT_DETALLECOM.PCTAID, Nivel1, Nivel2, Nivel3, Nivel4, Nivel5, Nivel6, Nivel7


