-- Verificar directamente si la investigación tiene libreto
SELECT 
    i.id,
    i.nombre,
    i.libreto,
    li.id as libreto_id,
    li.nombre_sesion,
    li.numero_participantes
FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.libreto::uuid = li.id
WHERE i.nombre = 'prueba flujo estados (test trigger)'; 