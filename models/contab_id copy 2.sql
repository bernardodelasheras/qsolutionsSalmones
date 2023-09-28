SET NOCOUNT on

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

 (select RTRIM(clactanodonombre)  from cont_clasificacuentas  with (nolock) 
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


 (select RTRIM(clactanodonombre)  from cont_clasificacuentas  with (nolock) 
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


 (select RTRIM(clactanodonombre)  from cont_clasificacuentas  with (nolock) 
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

 (select RTRIM(clactanodonombre)  from cont_clasificacuentas  with (nolock) 
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


 (select RTRIM(clactanodonombre)  from cont_clasificacuentas  with (nolock) 
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

 (select RTRIM(clactanodonombre)  from cont_clasificacuentas  with (nolock) 
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

 (select RTRIM(clactanodonombre)  from cont_clasificacuentas  with (nolock) 
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
        CONT_CLASIFICACUENTAS CLA with (nolock)  on CLA.PCTAID = CONT_CUENTAS.CTAID
  WHERE CLA.pPdcId = $pdcid


select 
     pEmpId, Empresa, DivCodigo, DivGlosa, 
     isnull(convert(varchar,DigFecha, 111),'1900/01/01') DigFecha,
     PerId, PerGlosa,
     SisCodOri, SisGlosa, OpeCod, OpeGlosa, NroInterno, Estado, ConEstGlosa,
	   CtaCodigo, CtaNombre, MonedaId, MonGlosa, 
	   MovCceMontoImpuDebe,MovCceMontoImpuHaber,
	   MovCceMontoLocalDebe,MovCceMontoLocalHaber,
	   MovCceMontoConvDebe,MovCceMontoConvHaber,
	   CreCodigo, CreNombre, CdiCodigo, CdiGlosa,
	   EntRut, EntRazonSocial, TdoId, TdoGlosa,
	   LlgDocNumDoc, TcoId, TcoGlosa,
	   llgdocdigusuario,
	   llgdocaprusuario,
	   llgdocactusuario,
	   TctId, TctGlosa,
	   GlosaMovimiento,
     Nivel1,Nivel2,Nivel3,Nivel4,Nivel5,Nivel6,Nivel7,
     cabopelinea,
     pcabopeid,
     codigofinanciero,
     glosafinanciero,
     ctacte,
     banco,
     isnull(convert(varchar,fechaComprobante , 111),'1900/01/01') fechaComprobante,
     EjercicioContable, MovCCeId
from 
(select row_number() over (order by MovCceId) as id,
       MovCceId, pEmpId, Empresa, DivCodigo, DivGlosa, LlgDocDigFecha DigFecha, PerId, PerGlosa,
       SisCodOri, SisGlosa, OpeCod, OpeGlosa, LlgDocNumInterno NroInterno, llgdocestado Estado, ConEstGlosa,
	   CtaCodigo, CtaNombre, MonedaId, MonGlosa, 
	   MovCceMontoImpuDebe,MovCceMontoImpuHaber,
	   MovCceMontoLocalDebe,MovCceMontoLocalHaber,
	   MovCceMontoConvDebe,MovCceMontoConvHaber,
	   CreCodigo, CreNombre, CdiCodigo, CdiGlosa,
	   EntRut, EntRazonSocial, TdoId, TdoGlosa,
	   LlgDocNumDoc, TcoId, TcoGlosa,
	   llgdocdigusuario,
	   llgdocaprusuario,
	   llgdocactusuario,
	   TctId, TctGlosa,
	   GlosaMovimiento,
	   Nivel1,Nivel2,Nivel3,Nivel4,Nivel5,Nivel6,Nivel7,
     cabopelinea,
     pcabopeid,
     codigofinanciero,
     glosafinanciero,
     ctacte,
     banco,
     fechaComprobante,
     EjercicioContable

from
(
select  
  ccet_Movimientos.MovCceId+10000000000 MovCCeId
, ccet_Movimientos.pEmpId
, rtrim(glbt_Entidad.EntRazonSocial) Empresa
, ccet_Movimientos.DivCodigo
, rtrim(glbt_Division.DivGlosa) DivGlosa
, llgt_cabeceradoc.LlgDocDigFecha
, ccet_Movimientos.PerId
, rtrim(glbt_Periodos.PerGlosa) PerGlosa
, ccet_Movimientos.SisCodOri
, rtrim(glbt_Sistemas.SisGlosa) SisGlosa
, llgt_TipoOperacion.OpeCod
, rtrim(llgt_TipoOperacion.OpeGlosa) OpeGlosa
, llgt_cabeceradoc.llgdocnuminterno
, rtrim(llgt_cabeceradoc.llgdocestado) llgdocestado
, rtrim(cont_Estados.ConEstGlosa) ConEstGlosa
, cont_Cuentas.CtaCodigo
, rtrim(cont_Cuentas.CtaNombre) CtaNombre
, glbt_Monedas.MonedaId
, rtrim(glbt_Monedas.MonGlosa) MonGlosa
, ccet_Movimientos.MovCceMontoImpuDebe
, ccet_Movimientos.MovCceMontoImpuHaber
, ccet_Movimientos.MovCceMontoLocalDebe
, ccet_Movimientos.MovCceMontoLocalHaber
, ccet_Movimientos.MovCceMontoConvDebe
, ccet_Movimientos.MovCceMontoConvHaber
, isnull(cont_CentrosResp.CreCodigo, 0) CreCodigo
, isnull(rtrim(cont_CentrosResp.CreNombre),' ') CreNombre
, isnull(cont_ConceptosImp.CdiCodigo, 0) CdiCodigo
, isnull(rtrim(cont_ConceptosImp.CdiGlosa),' ') CdiGlosa
, isnull(Entidad1.EntRut, '0000000000-0') EntRut
, isnull(rtrim(Entidad1.EntRazonSocial),' ') EntRazonSocial
, isnull(glbt_Documentos.TdoId,0) TdoId
, isnull(rtrim(glbt_Documentos.TdoGlosa),' ') TdoGlosa
, llgt_movimientos.llgdocnumdoc
, cont_CabeceraCom.TcoId 
, rtrim(cont_TipoComprobante.TcoGlosa) TcoGlosa
, rtrim(llgt_cabeceradoc.llgdocdigusuario) llgdocdigusuario
, rtrim(llgt_cabeceradoc.llgdocaprusuario) llgdocaprusuario
, rtrim(llgt_cabeceradoc.llgdocactusuario) llgdocactusuario
, cont_TipoCuenta.TctId
, rtrim(cont_TipoCuenta.TctGlosa) TctGlosa
, rtrim(replace(replace(isnull(ccet_movimientos.movcceglosa,''),char(10),''),char(13),'')) GlosaMovimiento
, tmp.Nivel1
, tmp.Nivel2
, tmp.Nivel3
, tmp.Nivel4
, tmp.Nivel5
, tmp.Nivel6
, tmp.Nivel7
,   ccet_Movimientos.cabopelinea
,   ccet_Movimientos.pcabopeid
,0  as codigofinanciero
,'' as glosafinanciero
,'' as ctacte
,'' as banco
,cont_CabeceraCom.comfecha fechaComprobante
,glbt_Periodos.EjeAno EjercicioContable

from  ccet_movimientos with (nolock) 
      inner join @temp tmp on tmp.ctaid = ccet_movimientos.pctaid
      left join llgt_cabeceradoc with (nolock)  on  ccet_movimientos.pcabopeid = llgt_cabeceradoc.CabLlgId
          left join llgt_movimientos with (nolock)  on ccet_movimientos.pcabopeid = llgt_movimientos.pcabllgid
          and ccet_movimientos.cabopelinea = llgt_movimientos.cabopelinea
          LEFT JOIN glbt_Empresas with (nolock)  on ccet_Movimientos.pEmpId = glbt_Empresas.EmpId
      LEFT JOIN glbt_Entidad with (nolock)  on glbt_Empresas.pEntId = glbt_Entidad.EntId
          LEFT JOIN glbt_Division with (nolock)  on ccet_Movimientos.DivCodigo = glbt_Division.DivCodigo
          LEFT JOIN glbt_Periodos with (nolock)  on (ccet_Movimientos.pEmpId = glbt_Periodos.pEmpId) 
          AND (ccet_Movimientos.PerId = glbt_Periodos.PerId) 
          LEFT JOIN glbt_Sistemas with (nolock)  on ccet_Movimientos.SisCodOri = glbt_Sistemas.SisCodOri 
          LEFT JOIN llgt_TipoOperacion with (nolock)  on ccet_movimientos.pEmpId = llgt_TipoOperacion.pEmpId 
          AND  llgt_cabeceradoc.pTipoOpeId = llgt_TipoOperacion.TipoOpeId
          LEFT JOIN cont_Estados with (nolock)  on llgt_Cabeceradoc.llgdocestado= cont_Estados.ConEstCod
          AND cont_Estados.ConEstTipoEstado = 'CBTE'
          LEFT JOIN cont_Cuentas with (nolock)  on ccet_Movimientos.pCtaId = cont_Cuentas.CtaId 
      LEFT JOIN glbt_Monedas with (nolock)  on llgt_Cabeceradoc.pMonedaId = glbt_Monedas.MonedaId 
          LEFT JOIN cont_CentrosResp with (nolock)  on ccet_Movimientos.pCreId = cont_CentrosResp.CreId 
          LEFT JOIN cont_ConceptosImp with (nolock)  on ccet_Movimientos.CdiCodigo = cont_ConceptosImp.CdiCodigo
          LEFT JOIN glbt_Entidad AS Entidad1 with (nolock)  on llgt_Cabeceradoc.pEntId = Entidad1.EntId 
          LEFT JOIN glbt_Documentos with (nolock)  on llgt_movimientos.TdoId = glbt_Documentos.TdoId 
          left join cont_CabeceraCom with (nolock)  on  ccet_movimientos.pCabCompId = cont_CabeceraCom.CabCompId
          LEFT JOIN cont_TipoComprobante with (nolock)  on (cont_CabeceraCom.pEmpId = cont_TipoComprobante.pEmpId) 
          AND (cont_CabeceraCom.TcoId = cont_TipoComprobante.TcoId)
          LEFT JOIN  cont_TipoCuenta with (nolock)  on cont_Cuentas.TctId = cont_TipoCuenta.TctId
          LEFT JOIN  cont_ClasificaCuentas with (nolock)  on ccet_Movimientos.pCtaId = cont_ClasificaCuentas.pCtaId 
          

where ccet_movimientos.pempid = $pempid
and ccet_movimientos.siscodori in (10,11)
and ccet_movimientos.perid <= $perid 
and llgt_Cabeceradoc.llgdocestado = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and ((select glbt_periodos.EjeAno 
      from glbt_periodos   with (nolock) 
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from glbt_periodos   with (nolock) 
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = ccet_movimientos.perid))
union
select
  ccet_Movimientos.MovCceId+20000000000  
, ccet_Movimientos.pEmpId
, rtrim(glbt_Entidad.EntRazonSocial) 
, ccet_Movimientos.DivCodigo
, rtrim(glbt_Division.DivGlosa)
, cont_cabeceraope.cabopefecha
, cont_cabeceraope.PerId
, rtrim(glbt_Periodos.PerGlosa)
, ccet_Movimientos.SisCodOri
, rtrim(glbt_Sistemas.SisGlosa)
, cont_TipoOperacion.OpeCod
, rtrim(cont_TipoOperacion.OpeGlosa)
, cont_cabeceraope.cabopenumero
, cont_cabeceraope.conestcod
, rtrim(cont_Estados.ConEstGlosa)
, cont_Cuentas.CtaCodigo
, rtrim(cont_Cuentas.CtaNombre)
, glbt_Monedas.MonedaId
, rtrim(glbt_Monedas.MonGlosa)
, ccet_Movimientos.MovCceMontoImpuDebe
, ccet_Movimientos.MovCceMontoImpuHaber
, ccet_Movimientos.MovCceMontoLocalDebe
, ccet_Movimientos.MovCceMontoLocalHaber
, ccet_Movimientos.MovCceMontoConvDebe
, ccet_Movimientos.MovCceMontoConvHaber
, isnull(cont_CentrosResp.CreCodigo,0)
, isnull(rtrim(cont_CentrosResp.CreNombre),' ')
, isnull(cont_ConceptosImp.CdiCodigo,0)
, isnull(rtrim(cont_ConceptosImp.CdiGlosa),' ')
, isnull(Entidad2.EntRut,'0000000000-0')
, isnull(rtrim(Entidad2.EntRazonSocial),' ')
, isnull(glbt_Documentos.TdoId,0)
, isnull(rtrim(glbt_Documentos.TdoGlosa),' ')
, ccet_documentos.docccenumero
, cont_CabeceraCom.TcoId 
, rtrim(cont_TipoComprobante.TcoGlosa) 
, rtrim(cont_cabeceraope.cabopedigusuario)
, rtrim(cont_cabeceraope.cabopeaprusuario)
, rtrim(cont_cabeceraope.cabopeactusuario)
, cont_TipoCuenta.TctId
, rtrim(cont_TipoCuenta.TctGlosa)
, replace(replace(ccet_movimientos.movcceglosa,char(10),''),char(13),'') as GlosaMovimiento
, tmp.Nivel1
, tmp.Nivel2
, tmp.Nivel3
, tmp.Nivel4
, tmp.Nivel5
, tmp.Nivel6
, tmp.Nivel7
,   ccet_Movimientos.cabopelinea 
,   ccet_Movimientos.pcabopeid
,0  as codigofinanciero
,'' as glosafinanciero
,'' as ctacte
,'' as banco
,cont_CabeceraOpe.cabopefecha fechaComprobante
,glbt_Periodos.EjeAno

from  ccet_movimientos with (nolock) 
      inner join @temp tmp on tmp.ctaid = ccet_movimientos.pctaid
          left join cont_cabeceraope with (nolock)  on  ccet_movimientos.pcabopeid = cont_cabeceraope.cabopeid
          LEFT JOIN glbt_Empresas with (nolock)  on ccet_Movimientos.pEmpId = glbt_Empresas.EmpId
          LEFT JOIN glbt_Entidad with (nolock)  on glbt_Empresas.pEntId = glbt_Entidad.EntId
          LEFT JOIN glbt_Division with (nolock)  on ccet_Movimientos.DivCodigo = glbt_Division.DivCodigo
          LEFT JOIN glbt_Periodos with (nolock)  on (ccet_Movimientos.pEmpId = glbt_Periodos.pEmpId) 
          AND (cont_cabeceraope.PerId = glbt_Periodos.PerId) 
          LEFT JOIN glbt_Sistemas with (nolock)  on ccet_Movimientos.SisCodOri = glbt_Sistemas.SisCodOri 
          LEFT JOIN cont_TipoOperacion with (nolock)  on ccet_movimientos.pEmpId = cont_TipoOperacion.pEmpId 
          AND  cont_cabeceraope.pTipoOpeId = ConT_TipoOperacion.TipoOpeId
          LEFT JOIN cont_Estados with (nolock)  on cont_cabeceraope.conestcod= cont_Estados.ConEstCod
          AND cont_Estados.ConEstTipoEstado = 'CBTE'
          LEFT JOIN cont_Cuentas with (nolock)  on ccet_Movimientos.pCtaId = cont_Cuentas.CtaId 
          LEFT JOIN CONT_DETALLECOM with (nolock)  on ccet_Movimientos.PDETCOMPID = CONT_DETALLECOM.DETCOMPID 
          LEFT JOIN glbt_Monedas with (nolock)  on CONT_DETALLECOM.pMonedaId = glbt_Monedas.MonedaId 
          LEFT JOIN cont_CentrosResp with (nolock)  on ccet_Movimientos.pCreId = cont_CentrosResp.CreId 
          LEFT JOIN cont_ConceptosImp with (nolock)  on ccet_Movimientos.CdiCodigo = cont_ConceptosImp.CdiCodigo
          LEFT JOIN glbt_Entidad AS Entidad1 with (nolock)  on cont_cabeceraope.pEntId = Entidad1.EntId 
          LEFT join cont_CabeceraCom with (nolock)  on  ccet_movimientos.pCabCompId = cont_CabeceraCom.CabCompId
          LEFT JOIN cont_TipoComprobante with (nolock)  on (cont_CabeceraCom.pEmpId = cont_TipoComprobante.pEmpId) 
          AND (cont_CabeceraCom.TcoId = cont_TipoComprobante.TcoId)
          LEFT JOIN  cont_TipoCuenta with (nolock)  on cont_Cuentas.TctId = cont_TipoCuenta.TctId
          LEFT JOIN  cont_ClasificaCuentas with (nolock)  on ccet_Movimientos.pCtaId = cont_ClasificaCuentas.pCtaId  
          LEFT JOIN CCET_DOCUMENTOS with (nolock)  on CCET_MOVIMIENTOS.PDOCCCEID = CCET_DOCUMENTOS.DOCCCEID
          LEFT JOIN glbt_Entidad AS Entidad2 with (nolock)  on CCET_DOCUMENTOS.pEntId = Entidad2.EntId  
          LEFT JOIN glbt_Documentos with (nolock)  on ccet_documentos.tdoid = glbt_Documentos.TdoId 

          
          

where ccet_movimientos.pempid = $pempid
and ccet_movimientos.siscodori not in (10,11)
and ccet_movimientos.perid <= $perid 
and cont_Cabeceraope.conestcod = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and ((select glbt_periodos.EjeAno 
      from glbt_periodos   with (nolock) 
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from glbt_periodos   with (nolock) 
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = ccet_movimientos.perid))
union

select  
  cont_Movimientos.MovConId+30000000000
, cont_Movimientos.pEmpId
, rtrim(glbt_Entidad.EntRazonSocial)
, cont_Movimientos.DivCodigo
, rtrim(glbt_Division.DivGlosa)
, llgt_cabeceradoc.LlgDocDigFecha
, cont_Movimientos.PerId
, rtrim(glbt_Periodos.PerGlosa)
, cont_Movimientos.SisCodOri
, rtrim(glbt_Sistemas.SisGlosa)
, llgt_TipoOperacion.OpeCod
, rtrim(llgt_TipoOperacion.OpeGlosa)
, llgt_cabeceradoc.llgdocnuminterno
, llgt_cabeceradoc.llgdocestado
, rtrim(cont_Estados.ConEstGlosa)
, cont_Cuentas.CtaCodigo
, rtrim(cont_Cuentas.CtaNombre)
, glbt_Monedas.MonedaId
, rtrim(glbt_Monedas.MonGlosa)
, cont_Movimientos.MovconMontoImpuDebe
, cont_Movimientos.MovConMontoImpuHaber
, cont_Movimientos.MovConMontoLocalDebe
, cont_Movimientos.MovConMontoLocalHaber
, cont_Movimientos.MovConMontoConvDebe
, cont_Movimientos.MovConMontoConvHaber
, isnull(cont_CentrosResp.CreCodigo,0)
, isnull(rtrim(cont_CentrosResp.CreNombre),' ')
, isnull(cont_ConceptosImp.CdiCodigo,0)
, isnull(rtrim(cont_ConceptosImp.CdiGlosa), ' ')
, isnull(Entidad1.EntRut,'0000000000-0')
, isnull(rtrim(Entidad1.EntRazonSocial),' ')
, isnull(glbt_Documentos.TdoId,0)
, isnull(rtrim(glbt_Documentos.TdoGlosa), ' ')
, llgt_movimientos.llgdocnumdoc
, cont_CabeceraCom.TcoId 
, rtrim(cont_TipoComprobante.TcoGlosa)
, rtrim(llgt_cabeceradoc.llgdocdigusuario)
, rtrim(llgt_cabeceradoc.llgdocaprusuario)
, rtrim(llgt_cabeceradoc.llgdocactusuario)
, cont_TipoCuenta.TctId
, rtrim(cont_TipoCuenta.TctGlosa)
, replace(replace(cont_movimientos.movconglosa,char(10),''),char(13),'') as GlosaMovimiento
, tmp.Nivel1
, tmp.Nivel2
, tmp.Nivel3
, tmp.Nivel4
, tmp.Nivel5
, tmp.Nivel6
, tmp.Nivel7
,   cont_Movimientos.cabopelinea
,   cont_Movimientos.pcabopeid
,0  as codigofinanciero
,'' as glosafinanciero
,'' as ctacte
,'' as banco
,cont_CabeceraCom.comfecha fechaComprobante
,glbt_Periodos.EjeAno

from  cont_movimientos with (nolock) 
      inner join @temp tmp on tmp.ctaid = cont_movimientos.pctaid
      left join llgt_cabeceradoc with (nolock)  on  cont_movimientos.pcabopeid = llgt_cabeceradoc.CabLlgId
          left join llgt_movimientos with (nolock)  on cont_movimientos.pcabopeid = llgt_movimientos.pcabllgid
          and cont_movimientos.cabopelinea = llgt_movimientos.cabopelinea
          LEFT JOIN glbt_Empresas with (nolock)  on cont_Movimientos.pEmpId = glbt_Empresas.EmpId
      LEFT JOIN glbt_Entidad with (nolock)  on glbt_Empresas.pEntId = glbt_Entidad.EntId
          LEFT JOIN glbt_Division with (nolock)  on cont_Movimientos.DivCodigo = glbt_Division.DivCodigo
          LEFT JOIN glbt_Periodos with (nolock)  on (cont_Movimientos.pEmpId = glbt_Periodos.pEmpId) 
          AND (cont_Movimientos.PerId = glbt_Periodos.PerId) 
          LEFT JOIN glbt_Sistemas with (nolock)  on cont_Movimientos.SisCodOri = glbt_Sistemas.SisCodOri 
          LEFT JOIN llgt_TipoOperacion with (nolock)  on cont_movimientos.pEmpId = llgt_TipoOperacion.pEmpId 
          AND  llgt_cabeceradoc.pTipoOpeId = llgt_TipoOperacion.TipoOpeId
          LEFT JOIN cont_Estados with (nolock)  on llgt_Cabeceradoc.llgdocestado= cont_Estados.ConEstCod
          AND cont_Estados.ConEstTipoEstado = 'CBTE'
          LEFT JOIN cont_Cuentas with (nolock)  on cont_Movimientos.pCtaId = cont_Cuentas.CtaId 
      LEFT JOIN glbt_Monedas with (nolock)  on llgt_Cabeceradoc.pMonedaId = glbt_Monedas.MonedaId 
          LEFT JOIN cont_CentrosResp with (nolock)  on cont_Movimientos.pCreId = cont_CentrosResp.CreId 
          LEFT JOIN cont_ConceptosImp with (nolock)  on cont_Movimientos.CdiCodigo = cont_ConceptosImp.CdiCodigo
          LEFT JOIN glbt_Entidad AS Entidad1 with (nolock)  on llgt_Cabeceradoc.pEntId = Entidad1.EntId 
          LEFT JOIN glbt_Documentos with (nolock)  on llgt_movimientos.TdoId = glbt_Documentos.TdoId 
          left join cont_CabeceraCom with (nolock)  on  cont_movimientos.pCabCompId = cont_CabeceraCom.CabCompId
          LEFT JOIN cont_TipoComprobante with (nolock)  on (cont_CabeceraCom.pEmpId = cont_TipoComprobante.pEmpId) 
          AND (cont_CabeceraCom.TcoId = cont_TipoComprobante.TcoId)
          LEFT JOIN  cont_TipoCuenta with (nolock)  on cont_Cuentas.TctId = cont_TipoCuenta.TctId
          LEFT JOIN  cont_ClasificaCuentas with (nolock)  on cont_Movimientos.pCtaId = cont_ClasificaCuentas.pCtaId 
          

where cont_movimientos.pempid = $pempid
and cont_movimientos.siscodori in (10,11)
and cont_movimientos.perid <= $perid 
and llgt_Cabeceradoc.llgdocestado = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and ((select glbt_periodos.EjeAno 
      from glbt_periodos   with (nolock) 
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from glbt_periodos   with (nolock) 
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = cont_movimientos.perid))
union
select  
  cont_Movimientos.MovConId+40000000000
, cont_Movimientos.pEmpId
, rtrim(glbt_Entidad.EntRazonSocial)
, cont_Movimientos.DivCodigo
, rtrim(glbt_Division.DivGlosa)
, cont_cabeceraope.cabopefecha
, cont_Movimientos.PerId
, rtrim(glbt_Periodos.PerGlosa)
, cont_Movimientos.SisCodOri
, rtrim(glbt_Sistemas.SisGlosa)
, cont_TipoOperacion.OpeCod
, rtrim(cont_TipoOperacion.OpeGlosa)
, cont_cabeceraope.cabopenumero
, cont_cabeceraope.conestcod
, rtrim(cont_Estados.ConEstGlosa)
, cont_Cuentas.CtaCodigo
, rtrim(cont_Cuentas.CtaNombre)
, glbt_Monedas.MonedaId
, rtrim(glbt_Monedas.MonGlosa)
, cont_Movimientos.MovconMontoImpuDebe
, cont_Movimientos.MovconMontoImpuHaber
, cont_Movimientos.MovconMontoLocalDebe
, cont_Movimientos.MovconMontoLocalHaber
, cont_Movimientos.MovconMontoConvDebe
, cont_Movimientos.MovconMontoConvHaber
, isnull(cont_CentrosResp.CreCodigo,0)
, isnull(rtrim(cont_CentrosResp.CreNombre),' ')
, isnull(cont_ConceptosImp.CdiCodigo,0)
, isnull(rtrim(cont_ConceptosImp.CdiGlosa),' ')
, isnull(Entidad1.EntRut,'0000000000-0')
, isnull(rtrim(Entidad1.EntRazonSocial),' ')
,0
,' '
,' '
, cont_CabeceraCom.TcoId 
, rtrim(cont_TipoComprobante.TcoGlosa)
, rtrim(cont_cabeceraope.cabopedigusuario)
, rtrim(cont_cabeceraope.cabopeaprusuario)
, rtrim(cont_cabeceraope.cabopeactusuario)
, cont_TipoCuenta.TctId
, rtrim(cont_TipoCuenta.TctGlosa)
, replace(replace(cont_movimientos.MovconGlosa,char(10),''),char(13),'') as GlosaMovimiento
, tmp.Nivel1
, tmp.Nivel2
, tmp.Nivel3
, tmp.Nivel4
, tmp.Nivel5
, tmp.Nivel6
, tmp.Nivel7
,   cont_Movimientos.cabopelinea
,   cont_movimientos.pcabopeid
,    cont_movimientos.cficodigo
,    ''
,    '' 
,    '' 
,cont_CabeceraOpe.cabopefecha fechaComprobante
,glbt_Periodos.EjeAno

from  cont_movimientos with (nolock) 
      inner join @temp tmp on tmp.ctaid = cont_movimientos.pctaid
      left join cont_cabeceraope with (nolock)  on  cont_movimientos.pcabopeid = cont_cabeceraope.cabopeid
          LEFT JOIN glbt_Empresas with (nolock)  on cont_Movimientos.pEmpId = glbt_Empresas.EmpId
      LEFT JOIN glbt_Entidad with (nolock)  on glbt_Empresas.pEntId = glbt_Entidad.EntId
          LEFT JOIN glbt_Division with (nolock)  on cont_Movimientos.DivCodigo = glbt_Division.DivCodigo
          LEFT JOIN glbt_Periodos with (nolock)  on (cont_Movimientos.pEmpId = glbt_Periodos.pEmpId) 
          AND (cont_Movimientos.PerId = glbt_Periodos.PerId) 
          LEFT JOIN glbt_Sistemas with (nolock)  on cont_Movimientos.SisCodOri = glbt_Sistemas.SisCodOri 
          LEFT JOIN cont_TipoOperacion with (nolock)  on cont_movimientos.pEmpId = cont_TipoOperacion.pEmpId 
          AND  cont_cabeceraope.pTipoOpeId = ConT_TipoOperacion.TipoOpeId
          LEFT JOIN cont_Estados with (nolock)  on cont_cabeceraope.conestcod= cont_Estados.ConEstCod
          AND cont_Estados.ConEstTipoEstado = 'CBTE'
          LEFT JOIN cont_Cuentas with (nolock)  on cont_Movimientos.pCtaId = cont_Cuentas.CtaId 
      LEFT JOIN glbt_Monedas with (nolock)  on cont_movimientos.pMonedaId = glbt_Monedas.MonedaId 
          LEFT JOIN cont_CentrosResp with (nolock)  on cont_Movimientos.pCreId = cont_CentrosResp.CreId 
          LEFT JOIN cont_ConceptosImp with (nolock)  on cont_Movimientos.CdiCodigo = cont_ConceptosImp.CdiCodigo
          LEFT JOIN glbt_Entidad AS Entidad1 with (nolock)  on cont_cabeceraope.pEntId = Entidad1.EntId 
          LEFT join cont_CabeceraCom with (nolock)  on  cont_movimientos.pCabCompId = cont_CabeceraCom.CabCompId
          LEFT JOIN cont_TipoComprobante with (nolock)  on (cont_CabeceraCom.pEmpId = cont_TipoComprobante.pEmpId) 
          AND (cont_CabeceraCom.TcoId = cont_TipoComprobante.TcoId)
          LEFT JOIN  cont_TipoCuenta with (nolock)  on cont_Cuentas.TctId = cont_TipoCuenta.TctId
          LEFT JOIN  cont_ClasificaCuentas with (nolock)  on cont_Movimientos.pCtaId = cont_ClasificaCuentas.pCtaId 
          
where 
cont_movimientos.pempid = $pempid
and cont_movimientos.perid <= $perid 
and cont_Cabeceraope.conestcod = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and cont_movimientos.siscodori not in(10,11)
and ((select glbt_periodos.EjeAno 
      from glbt_periodos   with (nolock) 
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from glbt_periodos   with (nolock) 
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = cont_movimientos.perid))
union
SELECT
  cont_DetalleCom.DetCompId+50000000000
, cont_CabeceraCom.pEmpId
, rtrim(glbt_Entidad.EntRazonSocial)
, cont_CabeceraCom.DivCodigo
, rtrim(glbt_Division.DivGlosa)
, cont_CabeceraCom.comfecha
, cont_CabeceraCom.PerId
, rtrim(glbt_Periodos.PerGlosa)
, cont_CabeceraCom.SisCodOri
, rtrim(glbt_Sistemas.SisGlosa)
, cont_TipoOperacion.OpeCod
, rtrim(cont_TipoOperacion.OpeGlosa)
, cont_CabeceraCom.ComNumero
, cont_CabeceraCom.ComEstadoCod
, rtrim(cont_Estados.ConEstGlosa)
, cont_Cuentas.CtaCodigo
, rtrim(cont_Cuentas.CtaNombre)
, glbt_Monedas.MonedaId
, rtrim(glbt_Monedas.MonGlosa)
, cont_DetalleCom.MovCceMontoImpuDebe
, cont_DetalleCom.MovCceMontoImpuHaber
, cont_DetalleCom.MovCceMontoLocalDebe
, cont_DetalleCom.MovCceMontoLocalHaber
, cont_DetalleCom.MovCceMontoConvDebe
, cont_DetalleCom.MovCceMontoConvHaber
, isnull(cont_DetalleCom.pCreId,0)
, isnull(rtrim(cont_CentrosResp.CreNombre),' ')
, '0'         
, ' '    
, '0000000000-0' 
, ' '  
, ' '   
, ' '  
, ' '
, cont_CabeceraCom.TcoId
, rtrim(cont_TipoComprobante.TcoGlosa)
, rtrim(cont_CabeceraCom.DigUsuario)
, rtrim(cont_CabeceraCom.ActUsuario)
, rtrim(cont_CabeceraCom.AprUsuario)
, cont_TipoCuenta.TctId
, rtrim(cont_TipoCuenta.TctGlosa)
,replace(replace(cont_DetalleCom.ComGlosa,char(10),''),char(13),'')        as ccet_movimientos_movcceglosa
, tmp.Nivel1
, tmp.Nivel2
, tmp.Nivel3
, tmp.Nivel4
, tmp.Nivel5
, tmp.Nivel6
, tmp.Nivel7
,   cont_detallecom.comlinea
,   cont_detallecom.pcabcompid 
,0
,''
,''
,'' 
,cont_CabeceraCom.comfecha fechaComprobante
,glbt_Periodos.EjeAno

FROM cont_CabeceraCom with (nolock)  INNER JOIN cont_DetalleCom 
ON cont_CabeceraCom.CabCompId = cont_DetalleCom.pCabCompId  
inner join @temp tmp on tmp.ctaid = cont_DetalleCom.pctaid
LEFT JOIN cont_ClasificaCuentas with (nolock)  on cont_DetalleCom.pCtaId = cont_ClasificaCuentas.pCtaId  
LEFT JOIN cont_Cuentas with (nolock)  on cont_ClasificaCuentas.pCtaId = cont_Cuentas.CtaId  
LEFT JOIN glbt_Empresas with (nolock)  on cont_CabeceraCom.pEmpId = glbt_Empresas.EmpId  
LEFT JOIN glbt_Entidad with (nolock)  on glbt_Empresas.pEntId = glbt_Entidad.EntId  
LEFT JOIN glbt_Sistemas with (nolock)  on cont_CabeceraCom.SisCodOri = glbt_Sistemas.SisCodOri  
LEFT JOIN glbt_Periodos with (nolock)  on  cont_CabeceraCom.PerId = glbt_Periodos.PerId  
AND  cont_CabeceraCom.pEmpId = glbt_Periodos.pEmpId   
LEFT JOIN glbt_Division with (nolock)  on cont_CabeceraCom.DivCodigo = glbt_Division.DivCodigo  
LEFT JOIN cont_TipoOperacion with (nolock)  on cont_CabeceraCom.pTipoOpeId = cont_TipoOperacion.TipoOpeId  
LEFT JOIN cont_Estados with (nolock)  on cont_CabeceraCom.ComEstadoCod = cont_Estados.ConEstCod  
LEFT JOIN glbt_Monedas with (nolock)  on cont_DetalleCom.pMonedaId = glbt_Monedas.MonedaId  
LEFT JOIN cont_CentrosResp with (nolock)  on cont_DetalleCom.pCreId = cont_CentrosResp.CreId  
LEFT JOIN cont_TipoComprobante with (nolock)  on  cont_CabeceraCom.pEmpId = cont_TipoComprobante.pEmpId  
AND  cont_CabeceraCom.TcoId = cont_TipoComprobante.TcoId   
LEFT JOIN cont_TipoCuenta with (nolock)  on  cont_Cuentas.TctId = cont_TipoCuenta.TctId  
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
  test_Movimientos.MovTesId+60000000000
, test_Movimientos.pEmpId
, rtrim(glbt_Entidad.EntRazonSocial)
, test_Movimientos.DivCodigo
, rtrim(glbt_Division.DivGlosa)
, cont_cabeceraope.cabopefecha
, test_Movimientos.PerId
, rtrim(glbt_Periodos.PerGlosa)
, test_Movimientos.SisCodOri
, rtrim(glbt_Sistemas.SisGlosa)
, cont_TipoOperacion.OpeCod
, rtrim(cont_TipoOperacion.OpeGlosa)
, cont_cabeceraope.cabopenumero
, cont_cabeceraope.conestcod
, rtrim(cont_Estados.ConEstGlosa)
, cont_Cuentas.CtaCodigo
, rtrim(cont_Cuentas.CtaNombre)
, glbt_Monedas.MonedaId
, rtrim(glbt_Monedas.MonGlosa)
, test_Movimientos.MovtesMontoImpuDebe
, test_Movimientos.MovtesMontoImpuHaber
, test_Movimientos.MovtesMontoLocalDebe
, test_Movimientos.MovtesMontoLocalHaber
, test_Movimientos.MovtesMontoConvDebe
, test_Movimientos.MovtesMontoConvHaber
, isnull(cont_CentrosResp.CreCodigo,0)
, isnull(rtrim(cont_CentrosResp.CreNombre),' ')
, isnull(cont_ConceptosImp.CdiCodigo,0)
, isnull(rtrim(cont_ConceptosImp.CdiGlosa),' ')
, isnull(Entidad1.EntRut,'0000000000-0')
, isnull(rtrim(Entidad1.EntRazonSocial),' ')
, isnull(glbt_Documentos.TdoId,0)
, isnull(rtrim(glbt_Documentos.TdoGlosa) ,' ')
, '0'
, cont_CabeceraCom.TcoId 
, rtrim(cont_TipoComprobante.TcoGlosa)
, rtrim(cont_cabeceraope.cabopedigusuario)
, rtrim(cont_cabeceraope.cabopeaprusuario)
, rtrim(cont_cabeceraope.cabopeactusuario)
, cont_TipoCuenta.TctId
, rtrim(cont_TipoCuenta.TctGlosa)
, replace(replace(test_movimientos.movtesglosa,char(10),''),char(13),'') as GlosaMovimiento
, tmp.Nivel1
, tmp.Nivel2
, tmp.Nivel3
, tmp.Nivel4
, tmp.Nivel5
, tmp.Nivel6
, tmp.Nivel7
, test_Movimientos.cabopelinea
, test_Movimientos.pcabopeid
, test_movimientos.cficodigo
, rtrim(test_codigosfin.cfiglosa) 
, test_ctactesbancarias.codctactebco
, rtrim(entidad2.entrazonsocial) 
, cont_CabeceraOpe.cabopefecha fechaComprobante
, glbt_Periodos.EjeAno

from  test_movimientos with (nolock) 
      inner join @temp tmp on tmp.ctaid = test_movimientos.pctaid
      left join cont_cabeceraope with (nolock)  on  test_movimientos.pcabopeid = cont_cabeceraope.cabopeid
          LEFT JOIN glbt_Empresas with (nolock)  on test_Movimientos.pEmpId = glbt_Empresas.EmpId
      LEFT JOIN glbt_Entidad with (nolock)  on glbt_Empresas.pEntId = glbt_Entidad.EntId
          LEFT JOIN glbt_Division with (nolock)  on test_Movimientos.DivCodigo = glbt_Division.DivCodigo
          LEFT JOIN glbt_Periodos with (nolock)  on (test_Movimientos.pEmpId = glbt_Periodos.pEmpId) 
          AND (test_Movimientos.PerId = glbt_Periodos.PerId) 
          LEFT JOIN glbt_Sistemas with (nolock)  on test_Movimientos.SisCodOri = glbt_Sistemas.SisCodOri 
          LEFT JOIN cont_TipoOperacion with (nolock)  on test_movimientos.pEmpId = cont_TipoOperacion.pEmpId 
          AND  cont_cabeceraope.pTipoOpeId = ConT_TipoOperacion.TipoOpeId
          LEFT JOIN cont_Estados with (nolock)  on cont_cabeceraope.conestcod= cont_Estados.ConEstCod
          AND cont_Estados.ConEstTipoEstado = 'CBTE'
          LEFT JOIN cont_Cuentas with (nolock)  on test_Movimientos.pCtaId = cont_Cuentas.CtaId 
      LEFT JOIN glbt_Monedas with (nolock)  on test_Movimientos.pMonedaId = glbt_Monedas.MonedaId 
          LEFT JOIN cont_CentrosResp with (nolock)  on test_Movimientos.pCreId = cont_CentrosResp.CreId 
          LEFT JOIN cont_ConceptosImp with (nolock)  on test_Movimientos.CdiCodigo = cont_ConceptosImp.CdiCodigo
          LEFT JOIN glbt_Entidad AS Entidad1 with (nolock)  on cont_cabeceraope.pEntId = Entidad1.EntId 
          LEFT join cont_CabeceraCom with (nolock)  on  test_movimientos.pCabCompId = cont_CabeceraCom.CabCompId
          LEFT JOIN glbt_Documentos with (nolock)  on cont_cabeceraope.pTipoopeid = glbt_Documentos.TdoId 
          LEFT JOIN cont_TipoComprobante with (nolock)  on (cont_CabeceraCom.pEmpId = cont_TipoComprobante.pEmpId) 
          AND (cont_CabeceraCom.TcoId = cont_TipoComprobante.TcoId)
          LEFT JOIN  cont_TipoCuenta with (nolock)  on cont_Cuentas.TctId = cont_TipoCuenta.TctId
          LEFT JOIN  cont_ClasificaCuentas with (nolock)  on test_Movimientos.pCtaId = cont_ClasificaCuentas.pCtaId 
          LEFT JOIN  test_ctactesbancarias with (nolock)  on test_Movimientos.Pctactebcoid = test_ctactesbancarias.ctactebcoid
          LEFT JOIN test_instifinan with (nolock)  on test_ctactesbancarias.INSTCOD = test_instifinan.INSTCOD
          LEFT JOIN GLBT_ENTIDAD as entidad2 with (nolock)  on test_instifinan.pentid =entidad2.entid 
          LEFT JOIN test_codigosfin with (nolock)  on test_Movimientos.CFICODIGO = test_codigosfin.CFICODIGO 


where test_movimientos.pempid = $pempid
and test_movimientos.perid <= $perid 
and cont_Cabeceraope.conestcod = $estado
AND cont_ClasificaCuentas.pPdcId = $pdcid
and ((select glbt_periodos.EjeAno 
      from glbt_periodos   with (nolock) 
          where glbt_periodos.pempid = $pempid
          and  glbt_periodos.perid = $perid ) = 
          (select glbt_periodos.EjeAno  
           from glbt_periodos   with (nolock) 
           where glbt_periodos.pempid = $pempid  
           and  glbt_periodos.perid = test_movimientos.perid))
) detalle) detalleNumerado
where id between $inicial and $final