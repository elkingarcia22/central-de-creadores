-- ====================================
-- LIMPIAR DUPLICADOS Y NORMALIZAR TABLA LIBRETOS_INVESTIGACION
-- ====================================

-- 1. VERIFICAR DUPLICADOS ACTUALES
SELECT '=== DUPLICADOS ACTUALES ===' as info;

SELECT 
    investigacion_id,
    COUNT(*) as total_libretos,
    STRING_AGG(id::text, ', ') as ids_libretos
FROM libretos_investigacion 
GROUP BY investigacion_id 
HAVING COUNT(*) > 1
ORDER BY total_libretos DESC;

-- 2. ELIMINAR DUPLICADOS (mantener el más reciente)
DELETE FROM libretos_investigacion 
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY investigacion_id 
                   ORDER BY creado_el DESC
               ) as rn
        FROM libretos_investigacion
    ) t
    WHERE t.rn > 1
);

-- 3. NORMALIZAR COLUMNAS DUPLICADAS
-- Mover datos de columnas antiguas a las nuevas

-- Actualizar duracion_estimada desde duracion_estimada_minutos
UPDATE libretos_investigacion 
SET duracion_estimada = CAST(duracion_estimada_minutos AS INTEGER)
WHERE duracion_estimada IS NULL 
  AND duracion_estimada_minutos IS NOT NULL;

-- Actualizar tipo_prueba_id desde tipo_prueba (si es necesario)
-- Nota: Esto requiere mapeo específico según tus catálogos

-- Actualizar pais_id desde pais (si es necesario)
-- Nota: Esto requiere mapeo específico según tus catálogos

-- Actualizar productos_recomendaciones desde productos_requeridos
UPDATE libretos_investigacion 
SET productos_recomendaciones = productos_requeridos
WHERE productos_recomendaciones IS NULL 
  AND productos_requeridos IS NOT NULL;

-- Actualizar numero_participantes desde numero_participantes_esperados
UPDATE libretos_investigacion 
SET numero_participantes = CAST(numero_participantes_esperados AS INTEGER)
WHERE numero_participantes IS NULL 
  AND numero_participantes_esperados IS NOT NULL;

-- 4. ELIMINAR COLUMNAS ANTIGUAS (opcional - comentar si no estás seguro)
-- ALTER TABLE libretos_investigacion DROP COLUMN IF EXISTS duracion_estimada_minutos;
-- ALTER TABLE libretos_investigacion DROP COLUMN IF EXISTS tipo_prueba;
-- ALTER TABLE libretos_investigacion DROP COLUMN IF EXISTS pais;
-- ALTER TABLE libretos_investigacion DROP COLUMN IF EXISTS productos_requeridos;
-- ALTER TABLE libretos_investigacion DROP COLUMN IF EXISTS numero_participantes_esperados;

-- 5. AGREGAR RESTRICCIÓN ÚNICA PARA EVITAR FUTUROS DUPLICADOS
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_investigacion_id_libretos'
        AND table_name = 'libretos_investigacion'
    ) THEN
        ALTER TABLE libretos_investigacion 
        ADD CONSTRAINT unique_investigacion_id_libretos UNIQUE (investigacion_id);
        RAISE NOTICE 'Restricción única agregada';
    ELSE
        RAISE NOTICE 'Restricción única ya existe';
    END IF;
END $$;

-- 6. VERIFICAR RESULTADO FINAL
SELECT '=== RESULTADO FINAL ===' as info;

SELECT 
    investigacion_id,
    COUNT(*) as total_libretos
FROM libretos_investigacion 
GROUP BY investigacion_id 
ORDER BY total_libretos DESC;

-- 7. MOSTRAR ESTRUCTURA ACTUAL
SELECT '=== ESTRUCTURA ACTUAL ===' as info;

SELECT 
    column_name,
    data_type,
    is_nullable,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'libretos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. REFRESCAR CACHE DE ESQUEMAS
NOTIFY pgrst, 'reload schema';

SELECT 'Limpieza de libretos completada exitosamente' as mensaje; 