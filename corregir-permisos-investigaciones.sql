-- CORREGIR PERMISOS TABLA INVESTIGACIONES

-- 1. VERIFICAR PERMISOS ACTUALES
SELECT 'PERMISOS ACTUALES' as info;

SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'investigaciones'
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 2. CONCEDER PERMISOS A ROLES AUTENTICADOS
SELECT 'CONCEDIENDO PERMISOS' as info;

-- Conceder permisos a authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE investigaciones TO authenticated;

-- Conceder permisos a service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE investigaciones TO service_role;

-- Conceder permisos a anon (si es necesario)
GRANT SELECT ON TABLE investigaciones TO anon;

-- 3. VERIFICAR PERMISOS DESPUÉS DE LA CORRECCIÓN
SELECT 'PERMISOS DESPUÉS DE CORRECCIÓN' as info;

SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'investigaciones'
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 4. VERIFICAR RLS
SELECT 'VERIFICAR RLS' as info;

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'investigaciones';

-- 5. VERIFICAR POLÍTICAS RLS
SELECT 'VERIFICAR POLÍTICAS RLS' as info;

SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'investigaciones';

-- 6. PROBAR ACTUALIZACIÓN DESPUÉS DE CORREGIR PERMISOS
SELECT 'PRUEBA ACTUALIZACIÓN' as info;

UPDATE investigaciones 
SET actualizado_el = NOW()
WHERE id = 'ed58dbf4-f506-4b33-a0b7-1795458a67ff'
RETURNING id, nombre, actualizado_el; 