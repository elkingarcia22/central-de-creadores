-- Verificar tokens de Google Calendar

-- 1. Verificar si la tabla existe
SELECT 'TABLA_EXISTE' as tipo, COUNT(*) as total 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'google_calendar_tokens';

-- 2. Verificar estructura de la tabla
SELECT 'ESTRUCTURA_TABLA' as tipo, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'google_calendar_tokens'
ORDER BY ordinal_position;

-- 3. Contar total de tokens
SELECT 'TOTAL_TOKENS' as tipo, COUNT(*) as total FROM public.google_calendar_tokens;

-- 4. Ver todos los tokens (sin mostrar datos sensibles)
SELECT 
  'TOKENS_EXISTENTES' as tipo,
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

-- 5. Verificar si hay tokens para el usuario específico
SELECT 
  'TOKENS_USUARIO' as tipo,
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
