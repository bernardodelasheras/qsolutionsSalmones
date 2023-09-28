set nocount on

declare @tmpt_borrar table (
        idRepertorio int,
        fecchaOt nvarchar(255),
        fecchaRepertorio nvarchar(255)
)

insert into @tmpt_borrar
SELECT idRepertorio
      , fechaOt
      , fechaRepertorio
  FROM repertorios
  where convert(date, fechaOt, 105) between convert(date, '@desde', 105) 
               and convert(date, '@hasta', 105) and codigoNotaria = @notaria
union
select * from 
(SELECT idRepertorio
      , fechaOt
      , fechaRepertorio
  FROM repertorios
  where (fechaRepertorio <> '00-00-0000') and codigoNotaria = @notaria) nozero
  where
  convert(date, fechaRepertorio, 105) between convert(date, '@desde', 105) 
               and convert(date, '@hasta', 105) 

delete from repertorios where idRepertorio in (select idRepertorio from @tmpt_borrar)

delete from repertoriodetalles where idRepertorio in (select idRepertorio from @tmpt_borrar)