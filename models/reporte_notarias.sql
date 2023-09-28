SELECT a.codigoNotaria
      ,b.nombre
      ,a.nroOt
      ,a.fechaOt
      ,a.registroNotaria
      ,a.nroRepertorio
      ,a.fechaRepertorio
      ,a.comparecientes
      ,a.ultEstado
      ,a.fechaEstado
      ,a.materia
      ,a.funcionario
      ,c.observacion
      ,c.fechaDet
      ,c.estado
      ,c.observacionDet
  FROM repertorios a 
      inner join notaria b on b.idNotaria = a.idNotaria
      inner join repertoriodetalles c on c.idRepertorio = a.idRepertorio 
 WHERE (a.idNotaria = @notaria or @notaria = 0)