-- Verificar participantes externos y sus empresas asignadas
SELECT 
    p.id,
    p.nombre,
    p.email,
    p.tipo,
    p.empresa_id,
    p.rol_empresa_id,
    e.nombre as empresa_nombre,
    re.nombre as rol_empresa_nombre
FROM participantes p
LEFT JOIN empresas e ON p.empresa_id = e.id
LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
WHERE p.tipo = 'externo'
ORDER BY p.nombre;

-- Verificar específicamente el participante "prueba 12344"
SELECT 
    p.id,
    p.nombre,
    p.email,
    p.tipo,
    p.empresa_id,
    p.rol_empresa_id,
    e.nombre as empresa_nombre,
    re.nombre as rol_empresa_nombre
FROM participantes p
LEFT JOIN empresas e ON p.empresa_id = e.id
LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
WHERE p.nombre = 'prueba 12344';

-- Verificar todas las empresas disponibles
SELECT id, nombre FROM empresas ORDER BY nombre; 