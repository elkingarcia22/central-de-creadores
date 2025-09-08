-- Verificar los participantes que referencian al usuario
SELECT
    'PARTICIPANTES_USUARIO' AS tipo,
    p.id,
    p.nombre,
    p.email,
    p.kam_id,
    p.tipo
FROM
    public.participantes p
WHERE
    p.kam_id = 'bea59fc5-812f-4b71-8228-a50ffc85c2e8';
