-- ====================================
-- DIAGNÓSTICO COMPLETO DEL PROBLEMA KAM
-- ====================================

-- 1. VERIFICAR QUÉ USUARIOS EXISTEN EN LA TABLA USUARIOS
SELECT 
  'USUARIOS EN TABLA USUARIOS:' as info,
  id,
  nombre,
  correo,
  activo
FROM usuarios
ORDER BY nombre;

-- 2. VERIFICAR EL KAM ACTUAL DE LAS EMPRESAS
SELECT 
  'KAM ACTUAL EN EMPRESAS:' as info,
  id,
  nombre,
  kam_id
FROM empresas
ORDER BY nombre;

-- 3. VERIFICAR SI EL KAM ACTUAL EXISTE EN USUARIOS
SELECT 
  'VERIFICAR KAM ACTUAL:' as info,
  e.id as empresa_id,
  e.nombre as empresa_nombre,
  e.kam_id,
  CASE 
    WHEN u.id IS NOT NULL THEN 'EXISTE'
    ELSE 'NO EXISTE'
  END as kam_existe,
  u.nombre as usuario_nombre,
  u.correo as usuario_email
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id
ORDER BY e.nombre;

-- 4. OBTENER EL PRIMER USUARIO VÁLIDO PARA ASIGNAR COMO KAM
SELECT 
  'PRIMER USUARIO DISPONIBLE:' as info,
  id,
  nombre,
  correo
FROM usuarios
WHERE activo = true
ORDER BY nombre
LIMIT 1;

-- 5. ACTUALIZAR TODAS LAS EMPRESAS CON EL PRIMER USUARIO VÁLIDO
DO $$
DECLARE
    primer_usuario_id UUID;
BEGIN
    -- Obtener el primer usuario activo
    SELECT id INTO primer_usuario_id 
    FROM usuarios 
    WHERE activo = true 
    ORDER BY nombre 
    LIMIT 1;
    
    IF primer_usuario_id IS NOT NULL THEN
        -- Actualizar todas las empresas
        UPDATE empresas 
        SET kam_id = primer_usuario_id;
        
        RAISE NOTICE 'KAMs actualizados con usuario ID: %', primer_usuario_id;
    ELSE
        RAISE NOTICE 'No hay usuarios activos disponibles';
    END IF;
END $$;

-- 6. VERIFICAR EL RESULTADO FINAL
SELECT 
  'RESULTADO FINAL:' as info,
  e.id,
  e.nombre,
  e.kam_id,
  u.nombre as kam_nombre,
  u.correo as kam_email,
  u.activo as kam_activo
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id
ORDER BY e.nombre;

-- 7. CONTAR EMPRESAS CON KAM VÁLIDO
SELECT 
  'ESTADÍSTICAS FINALES:' as info,
  COUNT(*) as total_empresas,
  COUNT(u.id) as empresas_con_kam_valido,
  COUNT(*) - COUNT(u.id) as empresas_sin_kam_valido
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id;
