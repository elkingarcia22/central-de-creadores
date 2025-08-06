-- ====================================
-- VERIFICAR DATOS EN TABLAS RELACIONADAS
-- ====================================

-- 1. PRODUCTOS (necesario para producto_id)
SELECT 'PRODUCTOS' as tabla, id, nombre, activo 
FROM productos 
WHERE activo = true 
ORDER BY nombre 
LIMIT 10;

-- 2. TIPOS DE INVESTIGACIÓN (necesario para tipo_investigacion_id)
SELECT 'TIPOS_INVESTIGACION' as tabla, id, nombre, activo 
FROM tipos_investigacion 
WHERE activo = true 
ORDER BY nombre 
LIMIT 10;

-- 3. USUARIOS (necesario para responsable_id, implementador_id, creado_por)
SELECT 'USUARIOS' as tabla, id, full_name, email 
FROM usuarios 
ORDER BY full_name 
LIMIT 10;

-- 4. PERIODOS (opcional para periodo_id)
SELECT 'PERIODOS' as tabla, id, nombre, activo 
FROM periodo 
WHERE activo = true 
ORDER BY nombre 
LIMIT 10;

-- 5. VERIFICAR SI EXISTEN OTRAS TABLAS MENCIONADAS
-- Estado reclutamiento
SELECT 'ESTADO_RECLUTAMIENTO' as tabla, COUNT(*) as total 
FROM estado_reclutamiento_cat;

-- Riesgo categorías
SELECT 'RIESGO_CAT' as tabla, COUNT(*) as total 
FROM riesgo_cat;

-- ====================================
-- ESTRUCTURA DE IDs PARA REFERENCIA
-- ====================================

-- Ver algunos IDs reales para usar en pruebas
SELECT 
    'SAMPLE_IDS' as info,
    (SELECT id FROM productos WHERE activo = true LIMIT 1) as producto_id_sample,
    (SELECT id FROM tipos_investigacion WHERE activo = true LIMIT 1) as tipo_investigacion_id_sample,
    (SELECT id FROM usuarios LIMIT 1) as usuario_id_sample,
    (SELECT id FROM periodo WHERE activo = true LIMIT 1) as periodo_id_sample; 