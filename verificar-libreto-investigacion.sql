-- Verificar libreto de la investigación específica
SELECT 
    i.id,
    i.nombre as investigacion_nombre,
    i.libreto as libreto_id,
    li.nombre_sesion as libreto_titulo,
    li.numero_participantes,
    li.numero_participantes_esperados
FROM investigaciones i
LEFT JOIN libretos_investigacion li ON i.libreto = li.id
WHERE i.nombre = 'prueba flujo estados (test trigger)'; 