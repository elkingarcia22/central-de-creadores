-- Verificar si el usuario existe en la tabla de autenticación
SELECT
    'USUARIO_AUTH' AS tipo,
    au.id,
    au.email,
    au.created_at,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM
    auth.users au
WHERE
    au.id = '064ec394-e7d5-4e35-b24f-436bc7ffc00d';
