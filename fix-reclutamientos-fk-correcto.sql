-- ====================================
-- CORREGIR FK DE RECLUTAMIENTOS - ANÁLISIS COMPLETO
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- ====================================
-- DOCUMENTACIÓN COMPLETA DEL PROBLEMA
-- ====================================

/*
ANÁLISIS DE DATOS REALES VERIFICADO:

1. RECLUTADOR IDS EN RECLUTAMIENTOS (7 usuarios únicos):
   - 7f58cd0e-6fd3-4249-ad18-8c25e23e39e0 (3 reclutamientos)
   - 0332e905-06e1-4e5d-bf81-7e4b9e8a41d6 (2 reclutamientos)
   - 37b272a8-8baa-493c-8877-f14d031e22a1 (2 reclutamientos)
   - 9b1ef1eb-fdb4-410f-ab22-bfedc68294d6 (2 reclutamientos)
   - 49a34b62-ece1-44fc-afda-67f3b27094ad (1 reclutamiento)
   - 983138ef-5917-4e4a-a46f-099a511ae6f7 (1 reclutamiento)
   - e1d4eb8b-83ae-4acc-9d31-6cedc776b64d (1 reclutamiento)

2. VERIFICACIÓN EN TABLA PROFILES (Supabase Auth):
   ✅ EXISTEN en profiles (4 usuarios):
      - e1d4eb8b-83ae-4acc-9d31-6cedc776b64d → "Elkin Garcia" (oficialchacal@gmail.com)
      - 37b272a8-8baa-493c-8877-f14d031e22a1 → "alisson Garcia" (agarcia@gmail.com)
      - 9b1ef1eb-fdb4-410f-ab22-bfedc68294d6 → "a" (a@gmail.com)
      - 983138ef-5917-4e4a-a46f-099a511ae6f7 → "alison" (alison@gmail.com)

   ❌ NO EXISTEN en profiles (3 usuarios):
      - 7f58cd0e-6fd3-4249-ad18-8c25e23e39e0
      - 0332e905-06e1-4e5d-bf81-7e4b9e8a41d6
      - 49a34b62-ece1-44fc-afda-67f3b27094ad

3. VERIFICACIÓN EN TABLA USUARIOS (Tabla de negocio):
   ✅ EXISTEN en usuarios (7 usuarios):
      - 7f58cd0e-6fd3-4249-ad18-8c25e23e39e0 → "jkknin" (hiuhiu@gmail.com)
      - 49a34b62-ece1-44fc-afda-67f3b27094ad → "pruebas" (prueba@gmail.com)
      - 9b1ef1eb-fdb4-410f-ab22-bfedc68294d6 → "a" (a@gmail.com)
      - 983138ef-5917-4e4a-a46f-099a511ae6f7 → "alison" (alison@gmail.com)
      - e1d4eb8b-83ae-4acc-9d31-6cedc776b64d → "Elkin Garcia" (oficialchacal@gmail.com)
      - 0332e905-06e1-4e5d-bf81-7e4b9e8a41d6 → "hdrgg" (safwefwe@gmail.com)
      - 37b272a8-8baa-493c-8877-f14d031e22a1 → "alisson Garcia" (agarcia@gmail.com)

CONCLUSIÓN:
- La tabla USUARIOS es la fuente correcta (todos los IDs existen)
- La FK actual apunta a USUARIOS (CORRECTO)
- La API debe usar USUARIOS, no PROFILES
- NO necesitamos cambiar la FK, solo corregir la API
*/

-- ====================================
-- VERIFICACIÓN ACTUAL (NO EJECUTAR - SOLO DOCUMENTACIÓN)
-- ====================================

-- 1. Verificar la FK actual de reclutador_id
SELECT 
    'FK actual de reclutador_id:' as info,
    tc.constraint_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'reclutamientos'
  AND kcu.column_name = 'reclutador_id';

-- 2. Verificar que todos los reclutador_ids existen en usuarios
SELECT 
    'Verificación de integridad:' as info,
    r.reclutador_id,
    CASE 
        WHEN u.id IS NOT NULL THEN '✅ EXISTE en usuarios'
        ELSE '❌ NO EXISTE en usuarios'
    END as existe_en_usuarios,
    u.nombre,
    u.correo
FROM (
    SELECT DISTINCT reclutador_id 
    FROM reclutamientos 
    WHERE reclutador_id IS NOT NULL
) r
LEFT JOIN usuarios u ON r.reclutador_id = u.id
ORDER BY existe_en_usuarios DESC;

-- ====================================
-- SOLUCIÓN: NO CAMBIAR FK, SOLO CORREGIR API
-- ====================================

/*
SOLUCIÓN IMPLEMENTADA:
1. ✅ La FK actual apunta a usuarios (CORRECTO)
2. ✅ Todos los reclutador_ids existen en usuarios
3. ✅ Cambiar API /api/usuarios para usar tabla usuarios
4. ✅ NO necesitamos cambiar la FK

CAMBIOS EN EL CÓDIGO:
- src/pages/api/usuarios.ts: Cambiar de profiles a usuarios
- Mapear campos: nombre→full_name, correo→email, foto_url→avatar_url
- Agregar filtro: activo = true
- Incluir roles: rol_plataforma
*/

-- ====================================
-- VERIFICACIÓN FINAL (EJECUTAR DESPUÉS DE CAMBIOS)
-- ====================================

-- Verificar que la API funciona correctamente
-- (Esto se verifica desde el frontend, no desde SQL)

-- Verificar que no hay errores de FK
SELECT 
    'Verificación final de integridad:' as info,
    COUNT(*) as total_reclutamientos,
    COUNT(CASE WHEN u.id IS NOT NULL THEN 1 END) as con_usuario_valido,
    COUNT(CASE WHEN u.id IS NULL THEN 1 END) as sin_usuario_valido
FROM reclutamientos r
LEFT JOIN usuarios u ON r.reclutador_id = u.id
WHERE r.reclutador_id IS NOT NULL;
