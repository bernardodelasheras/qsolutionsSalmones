select convert(varchar,convert(numeric, left(d.EntRut,10)))+right(d.EntRut,1) rut,
       'natural' type,
	   a.PrecioVenta monto,
	   0 efective,
	   'UF' currency,
	   rtrim(d.EntRazonSocial) name,
	   rtrim(d.EntRazonSocial) fatherName,
	   rtrim(d.EntRazonSocial) motherName,
	   rtrim(c.ProfesionTitular) position,
	   'true' completada,
	   'Chile' nationality,
	   rtrim(c.EMailTitular) email,
	   case e.CategoriaGlosa 
	     when 'Masculino' then 'male'
	     else 'female'
	   end gender,
	   rtrim(ltrim(rtrim(c.DireccionTitular) + ' ' + rtrim(f.CmuNombre))) address,
	   rtrim(c.TelefonoTitular) phone,
	   Replace(c.RutTitularRepLeg,'-','') representativeDni,
       convert(varchar,a.CarOfeNumInterno) referenceNumber,
	   'Carta Oferta '+ convert(varchar,a.CarOfeNumInterno) + ' ' + rtrim(g.TprGlosa)+' '+ rtrim(a.PryNumero) transactionComments,
	   'Compraventa de Inmueble'  transactionType,
	   convert(varchar, a.CarOfeFecha, 23) transactionDate,
	   a.CartaOfertaId cartaOfertaId
from InmT_CartaOferta a left join
     InmT_HojaAntecedentes c on a.pEntId = c.pEntId left join
	 GlbT_Entidad d on d.EntId = a.pEntid left join
     InmT_CategoriaCliente e on e.CategoriaId = c.CategoriaId left join
	 GlbT_Comunas f on f.CmuCodigo = c.CmuCodigoTitular left join
     GlbT_TiposProyectos g on g.TprId = a.pTprId
where a.pEmpId = @empid
  and a.CarOfeFecha between convert(varchar, getdate() - @nroDias, 23) and convert(varchar, getdate(), 23)
  and a.DocEstado not in (6, 7)
