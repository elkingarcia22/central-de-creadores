-- ====================================
-- DESHABILITAR RLS TEMPORALMENTE PARA SEGUIMIENTOS
-- ====================================

-- 1. VERIFICAR ESTADO ACTUAL
SELECT 
    'ESTADO ACTUAL' as info,
    schemaname,
    tablename,
    "rowsecurity"
FROM pg_tables 
WHERE tablename = 'seguimientos_investigacion';

-- 2. DESHABILITAR RLS
ALTER TABLE seguimientos_investigacion DISABLE ROW LEVEL SECURITY;

-- 3. VERIFICAR QUE SE DESHABILITÓ
SELECT 
    'DESPUÉS DE DESHABILITAR' as info,
    schemaname,
    tablename,
    "rowsecurity"
FROM pg_tables 
WHERE tablename = 'seguimientos_investigacion';

-- 4. PROBAR CONSULTA SIN RLS
SELECT 
    'PRUEBA CONSULTA SIN RLS' as info,
    COUNT(*) as total_seguimientos
FROM seguimientos_investigacion;

-- 5. PROBAR INSERCIÓN SIN RLS
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
            'Prueba sin RLS - ' || NOW(),
            'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d',
            'pendiente',
            'e1d4eb8b-83ae-4acc-9d31-6cedc776b64d'
        );
        RAISE NOTICE '✅ Inserción sin RLS exitosa';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Inserción sin RLS falló: %', SQLERRM;
    END;
END $$;

-- 6. VERIFICAR QUE SE INSERTÓ
SELECT 
    'VERIFICAR INSERCIÓN' as info,
    id,
    investigacion_id,
    fecha_seguimiento,
    notas,
    estado,
    creado_el
FROM seguimientos_investigacion 
WHERE notas LIKE 'Prueba sin RLS%'
ORDER BY creado_el DESC 
LIMIT 5;

-- 7. MOSTRAR TODOS LOS SEGUIMIENTOS
SELECT 
    'TODOS LOS SEGUIMIENTOS' as info,
    id,
    investigacion_id,
    fecha_seguimiento,
    estado,
    creado_el
FROM seguimientos_investigacion 
ORDER BY creado_el DESC 
LIMIT 10; 