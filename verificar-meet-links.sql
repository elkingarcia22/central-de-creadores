-- Verificar sesiones con enlaces de Meet
SELECT
    'SESIONES_CON_MEET' AS tipo,
    r.id,
    r.fecha_sesion,
    r.duracion_sesion,
    r.meet_link,
    r.estado_agendamiento,
    i.nombre AS investigacion_nombre
FROM
    public.reclutamientos r
LEFT JOIN
    public.investigaciones i ON r.investigacion_id = i.id
WHERE
    r.meet_link IS NOT NULL
    AND r.meet_link != ''
ORDER BY
    r.fecha_sesion DESC
LIMIT 10;
