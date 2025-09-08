-- Verificar si se creó el token para el usuario correcto

-- 1. Ver todos los tokens
SELECT 
  'TODOS_LOS_TOKENS' as tipo,
  user_id,
  created_at,
  expires_at,
  CASE 
    WHEN access_token IS NOT NULL THEN 'Sí' 
    ELSE 'No' 
  END as tiene_access_token,
  CASE 
    WHEN refresh_token IS NOT NULL THEN 'Sí' 
    ELSE 'No' 
  END as tiene_refresh_token
FROM public.google_calendar_tokens
ORDER BY created_at DESC;

-- 2. Verificar específicamente el usuario con reclutamientos
SELECT 
  'TOKEN_USUARIO_RECLUTAMIENTOS' as tipo,
  user_id,
  created_at,
  expires_at,
  CASE 
    WHEN access_token IS NOT NULL THEN 'Sí' 
    ELSE 'No' 
  END as tiene_access_token,
  CASE 
    WHEN refresh_token IS NOT NULL THEN 'Sí' 
    ELSE 'No' 
  END as tiene_refresh_token
FROM public.google_calendar_tokens
WHERE user_id = '9b1ef1eb-fdb4-410f-ab22-bfedc68294d6';
