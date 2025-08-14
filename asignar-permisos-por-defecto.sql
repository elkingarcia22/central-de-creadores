-- ====================================
-- ASIGNAR PERMISOS POR DEFECTO A ROLES
-- ====================================
-- Script para asignar permisos por defecto a cada rol del sistema
-- Ejecutar después de crear-sistema-permisos-granular.sql

-- 1. PERMISOS PARA ADMINISTRADOR (TODO PERMITIDO)
INSERT INTO permisos_roles (rol_id, funcionalidad_id, permitido)
SELECT 
    rp.id as rol_id,
    f.id as funcionalidad_id,
    true as permitido
FROM roles_plataforma rp
CROSS JOIN funcionalidades f
WHERE rp.nombre = 'Administrador'
ON CONFLICT (rol_id, funcionalidad_id) DO UPDATE SET
    permitido = true,
    updated_at = NOW();

-- 2. PERMISOS PARA INVESTIGADOR
INSERT INTO permisos_roles (rol_id, funcionalidad_id, permitido)
SELECT 
    rp.id as rol_id,
    f.id as funcionalidad_id,
    CASE 
        -- Módulo: Investigaciones (todo permitido)
        WHEN m.nombre = 'investigaciones' THEN true
        -- Módulo: Libretos (todo permitido)
        WHEN m.nombre = 'libretos' THEN true
        -- Módulo: Reclutamiento (solo lectura y ver información)
        WHEN m.nombre = 'reclutamiento' AND f.nombre IN (
            'leer_reclutamiento',
            'ver_informacion_investigacion',
            'ver_libretos'
        ) THEN true
        -- Módulo: Seguimientos (solo lectura y métricas)
        WHEN m.nombre = 'seguimientos' AND f.nombre IN (
            'leer_seguimientos',
            'ver_metricas'
        ) THEN true
        -- Módulo: Usuarios (solo lectura)
        WHEN m.nombre = 'usuarios' AND f.nombre IN (
            'leer_usuarios',
            'ver_actividad'
        ) THEN true
        -- Módulo: Sistema (solo sistema de diseño)
        WHEN m.nombre = 'sistema' AND f.nombre = 'sistema_diseno' THEN true
        ELSE false
    END as permitido
FROM roles_plataforma rp
CROSS JOIN funcionalidades f
JOIN modulos m ON f.modulo_id = m.id
WHERE rp.nombre = 'Investigador'
ON CONFLICT (rol_id, funcionalidad_id) DO UPDATE SET
    permitido = EXCLUDED.permitido,
    updated_at = NOW();

-- 3. PERMISOS PARA RECLUTADOR
INSERT INTO permisos_roles (rol_id, funcionalidad_id, permitido)
SELECT 
    rp.id as rol_id,
    f.id as funcionalidad_id,
    CASE 
        -- Módulo: Reclutamiento (todo permitido excepto eliminar)
        WHEN m.nombre = 'reclutamiento' AND f.nombre NOT IN (
            'eliminar_reclutamiento'
        ) THEN true
        -- Módulo: Investigaciones (solo lectura)
        WHEN m.nombre = 'investigaciones' AND f.nombre IN (
            'leer_investigaciones',
            'ver_informacion_investigacion'
        ) THEN true
        -- Módulo: Libretos (solo lectura)
        WHEN m.nombre = 'libretos' AND f.nombre IN (
            'leer_libretos'
        ) THEN true
        -- Módulo: Usuarios (solo lectura)
        WHEN m.nombre = 'usuarios' AND f.nombre IN (
            'leer_usuarios'
        ) THEN true
        ELSE false
    END as permitido
FROM roles_plataforma rp
CROSS JOIN funcionalidades f
JOIN modulos m ON f.modulo_id = m.id
WHERE rp.nombre = 'Reclutador'
ON CONFLICT (rol_id, funcionalidad_id) DO UPDATE SET
    permitido = EXCLUDED.permitido,
    updated_at = NOW();

-- 4. PERMISOS PARA AGENDADOR
INSERT INTO permisos_roles (rol_id, funcionalidad_id, permitido)
SELECT 
    rp.id as rol_id,
    f.id as funcionalidad_id,
    CASE 
        -- Módulo: Reclutamiento (solo agendamiento y gestión de estados)
        WHEN m.nombre = 'reclutamiento' AND f.nombre IN (
            'leer_reclutamiento',
            'asignar_agendamiento',
            'gestionar_estados',
            'ver_informacion_investigacion'
        ) THEN true
        -- Módulo: Investigaciones (solo lectura)
        WHEN m.nombre = 'investigaciones' AND f.nombre IN (
            'leer_investigaciones'
        ) THEN true
        -- Módulo: Usuarios (solo lectura)
        WHEN m.nombre = 'usuarios' AND f.nombre IN (
            'leer_usuarios'
        ) THEN true
        ELSE false
    END as permitido
FROM roles_plataforma rp
CROSS JOIN funcionalidades f
JOIN modulos m ON f.modulo_id = m.id
WHERE rp.nombre = 'Agendador'
ON CONFLICT (rol_id, funcionalidad_id) DO UPDATE SET
    permitido = EXCLUDED.permitido,
    updated_at = NOW();

-- 5. PERMISOS PARA ANALISTA (ROL NUEVO)
INSERT INTO permisos_roles (rol_id, funcionalidad_id, permitido)
SELECT 
    rp.id as rol_id,
    f.id as funcionalidad_id,
    CASE 
        -- Módulo: Seguimientos (todo permitido)
        WHEN m.nombre = 'seguimientos' THEN true
        -- Módulo: Investigaciones (solo lectura)
        WHEN m.nombre = 'investigaciones' AND f.nombre IN (
            'leer_investigaciones',
            'ver_informacion_investigacion'
        ) THEN true
        -- Módulo: Reclutamiento (solo lectura)
        WHEN m.nombre = 'reclutamiento' AND f.nombre IN (
            'leer_reclutamiento',
            'ver_informacion_investigacion'
        ) THEN true
        -- Módulo: Usuarios (solo lectura)
        WHEN m.nombre = 'usuarios' AND f.nombre IN (
            'leer_usuarios'
        ) THEN true
        ELSE false
    END as permitido
FROM roles_plataforma rp
CROSS JOIN funcionalidades f
JOIN modulos m ON f.modulo_id = m.id
WHERE rp.nombre = 'Analista'
ON CONFLICT (rol_id, funcionalidad_id) DO UPDATE SET
    permitido = EXCLUDED.permitido,
    updated_at = NOW();

-- 6. VERIFICACIÓN DE PERMISOS ASIGNADOS
SELECT 
    'PERMISOS POR ROL:' as info,
    rp.nombre as rol,
    m.nombre as modulo,
    f.nombre as funcionalidad,
    pr.permitido
FROM permisos_roles pr
JOIN roles_plataforma rp ON pr.rol_id = rp.id
JOIN funcionalidades f ON pr.funcionalidad_id = f.id
JOIN modulos m ON f.modulo_id = m.id
WHERE pr.permitido = true
ORDER BY rp.nombre, m.orden, f.orden;

-- 7. RESUMEN DE PERMISOS
SELECT 
    rp.nombre as rol,
    COUNT(*) as total_funcionalidades,
    COUNT(CASE WHEN pr.permitido = true THEN 1 END) as permisos_habilitados,
    ROUND(
        (COUNT(CASE WHEN pr.permitido = true THEN 1 END) * 100.0 / COUNT(*)), 
        1
    ) as porcentaje_habilitado
FROM roles_plataforma rp
CROSS JOIN funcionalidades f
LEFT JOIN permisos_roles pr ON rp.id = pr.rol_id AND f.id = pr.funcionalidad_id
WHERE rp.es_sistema = true
GROUP BY rp.id, rp.nombre
ORDER BY rp.nombre;
