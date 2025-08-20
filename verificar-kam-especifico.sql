-- VERIFICAR SI EXISTE EL KAM ESPECÍFICO
SELECT 
    'KAM' as tabla,
    '0332e905-06e1-4e5d-bf81-7e4b9e8a41d6' as id_buscado,
    CASE WHEN k.id IS NOT NULL THEN 'EXISTE' ELSE 'NO EXISTE' END as existe,
    k.nombre as nombre_encontrado
FROM kams k
WHERE k.id = '0332e905-06e1-4e5d-bf81-7e4b9e8a41d6';
