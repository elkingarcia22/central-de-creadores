-- VERIFICAR EMPRESAS CON LA ESTRUCTURA CORREGIDA
-- Este script verifica que las empresas se pueden consultar correctamente

-- 1. Verificar empresas existentes
SELECT 
  'EMPRESAS EXISTENTES' as info,
  COUNT(*) as total
FROM empresas;

-- 2. Mostrar empresas con todas las relaciones
SELECT 
  e.id,
  e.nombre,
  e.descripcion,
  -- KAM
  u.nombre as kam_nombre,
  u.correo as kam_email,
  -- País
  p.nombre as pais_nombre,
  -- Industria
  i.nombre as industria_nombre,
  -- Estado
  ee.nombre as estado_nombre,
  -- Tamaño
  te.nombre as tamano_nombre,
  -- Modalidad
  m.nombre as modalidad_nombre,
  -- Relación
  re.nombre as relacion_nombre,
  -- Producto
  pr.nombre as producto_nombre
FROM empresas e
LEFT JOIN usuarios u ON e.kam_id = u.id
LEFT JOIN paises p ON e.pais = p.id
LEFT JOIN industrias i ON e.industria = i.id
LEFT JOIN estado_empresa ee ON e.estado = ee.id
LEFT JOIN tamano_empresa te ON e.tamaño = te.id
LEFT JOIN modalidades m ON e.modalidad = m.id
LEFT JOIN relacion_empresa re ON e.relacion = re.id
LEFT JOIN productos pr ON e.producto_id = pr.id
ORDER BY e.nombre
LIMIT 10;

-- 3. Verificar que las tablas de catálogo tienen datos
SELECT 'PAISES' as tabla, COUNT(*) as total FROM paises
UNION ALL
SELECT 'INDUSTRIAS' as tabla, COUNT(*) as total FROM industrias
UNION ALL
SELECT 'ESTADO_EMPRESA' as tabla, COUNT(*) as total FROM estado_empresa
UNION ALL
SELECT 'TAMANO_EMPRESA' as tabla, COUNT(*) as total FROM tamano_empresa
UNION ALL
SELECT 'MODALIDADES' as tabla, COUNT(*) as total FROM modalidades
UNION ALL
SELECT 'RELACION_EMPRESA' as tabla, COUNT(*) as total FROM relacion_empresa
UNION ALL
SELECT 'PRODUCTOS' as tabla, COUNT(*) as total FROM productos
UNION ALL
SELECT 'USUARIOS' as tabla, COUNT(*) as total FROM usuarios;

-- 4. Mostrar algunos datos de catálogo para referencia
SELECT 'PAISES DISPONIBLES' as info, nombre FROM paises LIMIT 5;
SELECT 'INDUSTRIAS DISPONIBLES' as info, nombre FROM industrias LIMIT 5;
SELECT 'ESTADOS DISPONIBLES' as info, nombre FROM estado_empresa LIMIT 5;
SELECT 'TAMAÑOS DISPONIBLES' as info, nombre FROM tamano_empresa LIMIT 5;
