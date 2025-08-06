-- Actualizar campos de libretos para soportar selección múltiple
-- Ejecutar en Supabase Studio

-- 1. Verificar estructura actual
SELECT 
    '=== ESTRUCTURA ACTUAL ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'libretos_investigacion' 
AND column_name IN ('modalidad_id', 'tamano_empresa_id')
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Crear columnas temporales como arrays
ALTER TABLE libretos_investigacion 
ADD COLUMN modalidad_id_array UUID[],
ADD COLUMN tamano_empresa_id_array UUID[];

-- 3. Migrar datos existentes (si los hay)
-- Convertir valores únicos a arrays
UPDATE libretos_investigacion 
SET 
    modalidad_id_array = CASE 
        WHEN modalidad_id IS NOT NULL THEN ARRAY[modalidad_id::uuid]
        ELSE NULL 
    END,
    tamano_empresa_id_array = CASE 
        WHEN tamano_empresa_id IS NOT NULL THEN ARRAY[tamano_empresa_id::uuid]
        ELSE NULL 
    END;

-- 4. Eliminar columnas antiguas
ALTER TABLE libretos_investigacion 
DROP COLUMN modalidad_id,
DROP COLUMN tamano_empresa_id;

-- 5. Renombrar columnas nuevas
ALTER TABLE libretos_investigacion 
RENAME COLUMN modalidad_id_array TO modalidad_id;

ALTER TABLE libretos_investigacion 
RENAME COLUMN tamano_empresa_id_array TO tamano_empresa_id;

-- 6. Verificar estructura final
SELECT 
    '=== ESTRUCTURA FINAL ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'libretos_investigacion' 
AND column_name IN ('modalidad_id', 'tamano_empresa_id')
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Verificar datos migrados
SELECT 
    '=== DATOS MIGRADOS ===' as info;

SELECT 
    id,
    investigacion_id,
    modalidad_id,
    tamano_empresa_id
FROM libretos_investigacion 
LIMIT 5;

-- 8. Refrescar cache de esquemas (SUPABASE)
NOTIFY pgrst, 'reload schema';

-- 9. Mensaje de confirmación
SELECT '✅ Campos actualizados exitosamente a arrays' as resultado; 