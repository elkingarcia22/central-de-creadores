-- ====================================
-- AGREGAR CAMPO DE DURACIÓN DE SESIÓN
-- ====================================

-- 1. AGREGAR CAMPO DE DURACIÓN
ALTER TABLE reclutamientos
ADD COLUMN duracion_sesion INTEGER DEFAULT 60; -- duración en minutos, por defecto 1 hora

-- 2. AGREGAR COMENTARIO
COMMENT ON COLUMN reclutamientos.duracion_sesion IS 'Duración de la sesión en minutos';

-- 3. VERIFICAR QUE SE AGREGÓ CORRECTAMENTE
SELECT '=== VERIFICANDO CAMPO AGREGADO ===' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'reclutamientos' AND column_name = 'duracion_sesion';

-- 4. ACTUALIZAR DURACIÓN PARA RECLUTAMIENTOS EXISTENTES
UPDATE reclutamientos 
SET duracion_sesion = 60 
WHERE duracion_sesion IS NULL;

-- 5. VERIFICAR DATOS
SELECT '=== VERIFICANDO DATOS ===' as info;
SELECT 
    id,
    fecha_sesion,
    duracion_sesion,
    fecha_sesion + (duracion_sesion || ' minutes')::INTERVAL as fecha_fin_sesion
FROM reclutamientos 
ORDER BY fecha_sesion DESC 
LIMIT 5; 