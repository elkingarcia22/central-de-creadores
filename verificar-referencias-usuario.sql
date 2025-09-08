-- Verificar todas las referencias del usuario en la base de datos
SELECT
    'REFERENCIAS_USUARIO' AS tipo,
    'participantes' AS tabla,
    COUNT(*) AS cantidad_referencias
FROM
    public.participantes p
WHERE
    p.kam_id = 'bea59fc5-812f-4b71-8228-a50ffc85c2e8'

UNION ALL

SELECT
    'REFERENCIAS_USUARIO' AS tipo,
    'reclutamientos' AS tabla,
    COUNT(*) AS cantidad_referencias
FROM
    public.reclutamientos r
WHERE
    r.reclutador_id = 'bea59fc5-812f-4b71-8228-a50ffc85c2e8'

UNION ALL

SELECT
    'REFERENCIAS_USUARIO' AS tipo,
    'reclutamientos_creado_por' AS tabla,
    COUNT(*) AS cantidad_referencias
FROM
    public.reclutamientos r
WHERE
    r.creado_por = 'bea59fc5-812f-4b71-8228-a50ffc85c2e8';
