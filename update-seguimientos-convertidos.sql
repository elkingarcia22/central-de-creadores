-- ====================================
-- ACTUALIZAR SEGUIMIENTOS CONVERTIDOS
-- ====================================

-- 1. Verificar seguimientos que deberían estar convertidos
-- (buscar seguimientos que tienen investigaciones relacionadas creadas desde ellos)
SELECT 
    'Seguimientos que deberían estar convertidos:' as info,
    s.id,
    s.estado,
    s.fecha_seguimiento,
    s.investigacion_id,
    i.nombre as investigacion_creada_desde_seguimiento
FROM seguimientos_investigacion s
LEFT JOIN investigaciones i ON i.nombre LIKE '%Seguimiento:%'
WHERE s.estado != 'convertido'
AND s.notas IS NOT NULL
ORDER BY s.fecha_seguimiento DESC;

-- 2. Actualizar seguimientos específicos a estado 'convertido'
-- (actualizar los seguimientos que sabemos que fueron convertidos)
UPDATE seguimientos_investigacion 
SET estado = 'convertido'
WHERE id IN (
    -- Aquí puedes agregar los IDs específicos de los seguimientos que fueron convertidos
    -- Por ejemplo:
    -- 'uuid-del-seguimiento-1',
    -- 'uuid-del-seguimiento-2'
    SELECT id FROM seguimientos_investigacion 
    WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1'
    AND estado != 'convertido'
    LIMIT 5  -- Actualizar solo los primeros 5 para ser seguro
);

-- 3. Verificar el resultado de la actualización
SELECT 
    'Seguimientos después de la actualización:' as info,
    COUNT(*) as total_seguimientos,
    COUNT(CASE WHEN estado = 'convertido' THEN 1 END) as convertidos,
    COUNT(CASE WHEN estado != 'convertido' THEN 1 END) as no_convertidos
FROM seguimientos_investigacion
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1';

-- 4. Mostrar todos los seguimientos de la investigación
SELECT 
    'Todos los seguimientos de la investigación:' as info,
    id,
    estado,
    fecha_seguimiento,
    investigacion_id,
    creado_el
FROM seguimientos_investigacion 
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1'
ORDER BY fecha_seguimiento DESC;

-- 5. Verificar que los seguimientos convertidos son visibles
SELECT 
    'Seguimientos convertidos visibles:' as info,
    id,
    estado,
    fecha_seguimiento,
    investigacion_id
FROM seguimientos_investigacion 
WHERE investigacion_id = '74ccfacb-6776-4546-a3e9-c07cefd1d6f1'
AND estado = 'convertido'
ORDER BY fecha_seguimiento DESC; 