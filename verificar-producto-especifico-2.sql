-- VERIFICAR SI EXISTE EL PRODUCTO ESPECÍFICO
SELECT 
    'PRODUCTO' as tabla,
    '08e6b770-b69e-4e4e-aeef-aec8c5c247b5' as id_buscado,
    CASE WHEN p.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe,
    p.nombre as nombre_encontrado,
    p.activo as activo_encontrado
FROM productos p
WHERE p.id = '08e6b770-b69e-4e4e-aeef-aec8c5c247b5';
