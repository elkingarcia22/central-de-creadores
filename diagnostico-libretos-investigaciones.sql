-- Diagnóstico de vinculación entre investigaciones y libretos

-- 1. Verificar investigaciones sin libreto asignado
SELECT 
    id,
    nombre,
    libreto,
    estado,
    creado_el
FROM investigaciones 
WHERE libreto IS NULL
ORDER BY creado_el DESC;

-- 2. Verificar libretos disponibles
SELECT 
    id,
    nombre_sesion,
    descripcion_general,
    numero_participantes,
    numero_participantes_esperados,
    creado_el
FROM libretos_investigacion
ORDER BY creado_el DESC;

-- 3. Verificar investigaciones con libreto asignado
SELECT 
    i.id,
    i.nombre,
    i.libreto,
    l.nombre_sesion,
    l.numero_participantes,
    l.numero_participantes_esperados
FROM investigaciones i
LEFT JOIN libretos_investigacion l ON i.libreto = l.id
WHERE i.libreto IS NOT NULL
ORDER BY i.creado_el DESC;

-- 4. Verificar si hay libretos huérfanos (sin investigación asignada)
SELECT 
    l.id,
    l.nombre_sesion,
    l.descripcion_general,
    l.numero_participantes,
    l.creado_el
FROM libretos_investigacion l
LEFT JOIN investigaciones i ON l.id = i.libreto
WHERE i.id IS NULL
ORDER BY l.creado_el DESC;

-- 5. Contar estadísticas
SELECT 
    'Total investigaciones' as tipo,
    COUNT(*) as cantidad
FROM investigaciones
UNION ALL
SELECT 
    'Investigaciones sin libreto' as tipo,
    COUNT(*) as cantidad
FROM investigaciones
WHERE libreto IS NULL
UNION ALL
SELECT 
    'Investigaciones con libreto' as tipo,
    COUNT(*) as cantidad
FROM investigaciones
WHERE libreto IS NOT NULL
UNION ALL
SELECT 
    'Total libretos' as tipo,
    COUNT(*) as cantidad
FROM libretos_investigacion
UNION ALL
SELECT 
    'Libretos sin asignar' as tipo,
    COUNT(*) as cantidad
FROM libretos_investigacion l
LEFT JOIN investigaciones i ON l.id = i.libreto
WHERE i.id IS NULL; 