-- ====================================
-- VERIFICAR SERVICE ROLE KEY
-- ====================================

-- 1. VERIFICAR USUARIO ACTUAL
SELECT 
    'USUARIO ACTUAL' as info,
    auth.uid() as user_id,
    auth.role() as user_role,
    auth.email() as user_email;

-- 2. PROBAR CONSULTA CON RLS NORMAL
SELECT 
    'CONSULTA CON RLS NORMAL' as info,
    COUNT(*) as total_seguimientos
FROM seguimientos_investigacion;

-- 3. PROBAR INSERCIÓN CON RLS NORMAL
-- (Esto debería fallar si no hay usuario autenticado)
DO $$
BEGIN
    BEGIN
        INSERT INTO seguimientos_investigacion (
            investigacion_id,
            fecha_seguimiento,
            notas,
            responsable_id,
            estado,
            creado_por
        ) VALUES (
            '12c5ce70-d6e0-422d-919c-7cc9b4867a48',
            CURRENT_DATE,
            'Prueba RLS normal',
            'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d',
            'pendiente',
            'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d'
        );
        RAISE NOTICE '✅ Inserción con RLS normal exitosa';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Inserción con RLS normal falló: %', SQLERRM;
    END;
END $$;

-- 4. VERIFICAR POLÍTICAS RLS
SELECT 
    'POLÍTICAS RLS ACTUALES' as info,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'seguimientos_investigacion'
ORDER BY cmd, policyname;

-- 5. VERIFICAR PERMISOS DE LA TABLA
SELECT 
    'PERMISOS DE LA TABLA' as info,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'seguimientos_investigacion'
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 6. VERIFICAR SI HAY DATOS DE PRUEBA
SELECT 
    'DATOS DE PRUEBA' as info,
    id,
    investigacion_id,
    fecha_seguimiento,
    estado,
    creado_el
FROM seguimientos_investigacion 
ORDER BY creado_el DESC 
LIMIT 5; 