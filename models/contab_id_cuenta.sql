select count(*) as cuenta from 
(Select MovCceId
from
(
select  
  ccet_Movimientos.MovCceId
from  ccet_movimientos
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
and ccet_movimientos.perid <= $perid 
and llgt_Cabeceradoc.llgdocestado = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and ((select glbt_periodos.EjeAno 
      from glbt_periodos  
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from glbt_periodos  
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = ccet_movimientos.perid))
union
select
  ccet_Movimientos.MovCceId
from  ccet_movimientos
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
and ccet_movimientos.perid <= $perid 
and cont_Cabeceraope.conestcod = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and ((select glbt_periodos.EjeAno 
      from glbt_periodos  
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from glbt_periodos  
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = ccet_movimientos.perid))
union

select  
  cont_Movimientos.MovConId

from  cont_movimientos
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
and cont_movimientos.perid <= $perid 
and llgt_Cabeceradoc.llgdocestado = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and ((select glbt_periodos.EjeAno 
      from glbt_periodos  
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from glbt_periodos  
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = cont_movimientos.perid))
union
select  
  cont_Movimientos.MovConId

from  cont_movimientos
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
and cont_movimientos.perid <= $perid 
and cont_Cabeceraope.conestcod = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and cont_movimientos.siscodori not in(10,11)
and ((select glbt_periodos.EjeAno 
      from glbt_periodos  
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from glbt_periodos  
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = cont_movimientos.perid))
union
SELECT
  cont_DetalleCom.DetCompId

FROM cont_CabeceraCom INNER JOIN cont_DetalleCom 
ON cont_CabeceraCom.CabCompId = cont_DetalleCom.pCabCompId  
LEFT JOIN cont_ClasificaCuentas ON cont_DetalleCom.pCtaId = cont_ClasificaCuentas.pCtaId  
LEFT JOIN cont_Cuentas ON cont_ClasificaCuentas.pCtaId = cont_Cuentas.CtaId  
LEFT JOIN glbt_Empresas ON cont_CabeceraCom.pEmpId = glbt_Empresas.EmpId  
LEFT JOIN glbt_Entidad ON glbt_Empresas.pEntId = glbt_Entidad.EntId  
LEFT JOIN glbt_Sistemas ON cont_CabeceraCom.SisCodOri = glbt_Sistemas.SisCodOri  
LEFT JOIN glbt_Periodos ON  cont_CabeceraCom.PerId = glbt_Periodos.PerId  
AND  cont_CabeceraCom.pEmpId = glbt_Periodos.pEmpId   
LEFT JOIN glbt_Division ON cont_CabeceraCom.DivCodigo = glbt_Division.DivCodigo  
LEFT JOIN cont_TipoOperacion ON cont_CabeceraCom.pTipoOpeId = cont_TipoOperacion.TipoOpeId  
LEFT JOIN cont_Estados ON cont_CabeceraCom.ComEstadoCod = cont_Estados.ConEstCod  
LEFT JOIN glbt_Monedas ON cont_DetalleCom.pMonedaId = glbt_Monedas.MonedaId  
LEFT JOIN cont_CentrosResp ON cont_DetalleCom.pCreId = cont_CentrosResp.CreId  
LEFT JOIN cont_TipoComprobante ON  cont_CabeceraCom.pEmpId = cont_TipoComprobante.pEmpId  
AND  cont_CabeceraCom.TcoId = cont_TipoComprobante.TcoId   
LEFT JOIN cont_TipoCuenta ON  cont_Cuentas.TctId = cont_TipoCuenta.TctId  
AND  cont_Cuentas.TctId = cont_TipoCuenta.TctId 

WHERE    cont_CabeceraCom.pEmpId = $pempid  
AND   cont_Estados.ConEstTipoEstado = 'CBTE'  
AND   cont_ClasificaCuentas.pCtaId <> 0  
AND   cont_ClasificaCuentas.pPdcId = $pdcid
AND   cont_CabeceraCom.PerId <= $perid 
and cont_cabeceracom.ComEstadoCod = 5
and cont_cabeceracom.perid =   ( select glbt_periodos.PerId from glbt_periodos
                                           where glbt_periodos.pempid = $pempid
                                           and glbt_periodos.permes = 0 
                                           and glbt_periodos.EjeAno = (select glbt_periodos.EjeAno 
                                           from glbt_periodos 
                                           where glbt_periodos.perid = $perid
                                           and glbt_periodos.pempid = $pempid )) 
union 
select  
  test_Movimientos.MovTesId

from  test_movimientos
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
and test_movimientos.perid <= $perid 
and cont_Cabeceraope.conestcod = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and ((select glbt_periodos.EjeAno 
      from glbt_periodos  
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from glbt_periodos  
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = test_movimientos.perid))
) detalle) detalleNumerado