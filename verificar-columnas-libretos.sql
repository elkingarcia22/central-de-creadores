-- ====================================
-- VERIFICAR COLUMNAS ESPECÍFICAS DE LIBRETOS_INVESTIGACION
-- ====================================

-- Lista de todas las columnas que debe tener la tabla
WITH columnas_necesarias AS (
    SELECT unnest(ARRAY[
        'id',
        'investigacion_id',
        'problema_situacion',
        'hipotesis',
        'objetivos',
        'resultado_esperado',
        'productos_recomendaciones',
        'plataforma_id',
        'tipo_prueba_id',
        'rol_empresa_id',
        'industria_id',
        'pais_id',
        'modalidad_id',
        'tamano_empresa_id',
        'numero_participantes',
        'nombre_sesion',
        'usuarios_participantes',
        'duracion_estimada',
        'descripcion_general',
        'link_prototipo',
        'creado_por',
        'creado_el',
        'actualizado_el'
    ]) AS columna_necesaria
),
columnas_existentes AS (
    SELECT column_name
    FROM information_schema.columns 
    WHERE table_name = 'libretos_investigacion' 
    AND table_schema = 'public'
)
SELECT 
    cn.columna_necesaria,
    CASE 
        WHEN ce.column_name IS NOT NULL THEN '✅ EXISTE'
        ELSE '❌ FALTA'
    END as estado
FROM columnas_necesarias cn
LEFT JOIN columnas_existentes ce ON cn.columna_necesaria = ce.column_name
ORDER BY 
    CASE WHEN ce.column_name IS NULL THEN 0 ELSE 1 END,
    cn.columna_necesaria;

-- Mostrar estructura actual de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'libretos_investigacion' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Contar columnas faltantes
WITH columnas_necesarias AS (
    SELECT unnest(ARRAY[
        'id', 'investigacion_id', 'problema_situacion', 'hipotesis', 'objetivos',
        'resultado_esperado', 'productos_recomendaciones', 'plataforma_id', 'tipo_prueba_id',
        'rol_empresa_id', 'industria_id', 'pais_id', 'modalidad_id', 'tamano_empresa_id',
        'numero_participantes', 'nombre_sesion', 'usuarios_participantes', 'duracion_estimada',
        'descripcion_general', 'link_prototipo', 'creado_por', 'creado_el', 'actualizado_el'
    ]) AS columna_necesaria
),
columnas_existentes AS (
    SELECT column_name
    FROM information_schema.columns 
    WHERE table_name = 'libretos_investigacion' 
    AND table_schema = 'public'
)
SELECT 
    COUNT(*) as total_necesarias,
    COUNT(ce.column_name) as total_existentes,
    COUNT(*) - COUNT(ce.column_name) as total_faltantes
FROM columnas_necesarias cn
LEFT JOIN columnas_existentes ce ON cn.columna_necesaria = ce.column_name; 