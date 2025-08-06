-- Script para verificar datos de reclutamiento
-- Este script nos ayudará a entender qué datos existen y cómo están estructurados

-- 1. Verificar todos los estados únicos en la tabla investigaciones
SELECT DISTINCT estado, COUNT(*) as cantidad
FROM investigaciones 
GROUP BY estado 
ORDER BY cantidad DESC;

-- 2. Verificar si hay investigaciones con estado 'por_agendar'
SELECT COUNT(*) as total_por_agendar
FROM investigaciones 
WHERE estado = 'por_agendar';

-- 3. Verificar la estructura de la tabla investigaciones
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'investigaciones' 
ORDER BY ordinal_position;

-- 4. Verificar si existe la vista vista_reclutamientos_completa
SELECT EXISTS (
  SELECT 1 FROM information_schema.views 
  WHERE table_name = 'vista_reclutamientos_completa'
) as vista_existe;

-- 5. Verificar datos de libretos
SELECT COUNT(*) as total_libretos
FROM libretos_investigacion;

-- 6. Verificar usuarios disponibles
SELECT COUNT(*) as total_usuarios
FROM auth.users;

-- 7. Verificar algunas investigaciones de ejemplo
SELECT 
  id,
  nombre,
  estado,
  fecha_inicio,
  fecha_fin,
  riesgo_automatico,
  responsable_id,
  implementador_id
FROM investigaciones 
LIMIT 5; 