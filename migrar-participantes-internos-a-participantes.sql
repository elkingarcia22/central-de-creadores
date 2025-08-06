-- ====================================
-- MIGRAR PARTICIPANTES INTERNOS A PARTICIPANTES
-- ====================================
-- Ejecutar en Supabase SQL Editor
-- Solución para el problema de IDs inválidos en reclutamientos

-- PASO 1: Verificar participantes internos existentes
SELECT '=== PARTICIPANTES INTERNOS EXISTENTES ===' as info;

SELECT 
    id,
    nombre,
    email,
    departamento_id,
    activo
FROM participantes_internos 
ORDER BY nombre;

-- PASO 2: Agregar columna tipo a participantes si no existe
SELECT '=== AGREGANDO COLUMNA TIPO A PARTICIPANTES ===' as info;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'participantes' 
        AND column_name = 'tipo'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE participantes ADD COLUMN tipo TEXT DEFAULT 'externo';
        RAISE NOTICE '✅ Columna tipo agregada a participantes';
    ELSE
        RAISE NOTICE '✅ Columna tipo ya existe en participantes';
    END IF;
END $$;

-- PASO 3: Migrar participantes internos a participantes
SELECT '=== MIGRANDO PARTICIPANTES INTERNOS ===' as info;

INSERT INTO participantes (
    id,
    nombre,
    email,
    tipo,
    created_at,
    updated_at
)
SELECT 
    pi.id,
    pi.nombre,
    pi.email,
    'interno' as tipo,
    pi.created_at,
    pi.updated_at
FROM participantes_internos pi
WHERE NOT EXISTS (
    SELECT 1 FROM participantes p WHERE p.id = pi.id
);

SELECT '✅ Participantes internos migrados' as resultado;

-- PASO 4: Verificar migración
SELECT '=== VERIFICACIÓN DE MIGRACIÓN ===' as info;

SELECT 
    'Participantes externos:' as tipo,
    COUNT(*) as total
FROM participantes 
WHERE tipo = 'externo' OR tipo IS NULL
UNION ALL
SELECT 
    'Participantes internos (en participantes):' as tipo,
    COUNT(*) as total
FROM participantes 
WHERE tipo = 'interno'
UNION ALL
SELECT 
    'Participantes internos (tabla original):' as tipo,
    COUNT(*) as total
FROM participantes_internos;

-- PASO 5: Mostrar participantes internos migrados
SELECT '=== PARTICIPANTES INTERNOS MIGRADOS ===' as info;

SELECT 
    id,
    nombre,
    email,
    tipo,
    created_at
FROM participantes 
WHERE tipo = 'interno'
ORDER BY nombre;

-- PASO 6: Limpiar reclutamientos corruptos (ahora que tenemos los IDs correctos)
SELECT '=== LIMPIANDO RECLUTAMIENTOS CORRUPTOS ===' as info;

DELETE FROM reclutamientos 
WHERE participantes_id IS NOT NULL 
AND participantes_id NOT IN (SELECT id FROM participantes);

SELECT '✅ Reclutamientos corruptos eliminados' as resultado;

-- PASO 7: Estado final
SELECT '=== ESTADO FINAL ===' as info;

SELECT 
    'Total participantes:' as info,
    COUNT(*) as total
FROM participantes;

SELECT 
    'Total reclutamientos:' as info,
    COUNT(*) as total
FROM reclutamientos; 