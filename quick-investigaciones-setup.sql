-- ====================================
-- SETUP MÍNIMO MÓDULO INVESTIGACIONES
-- Solo vista temporal - Sin crear tablas
-- ====================================

-- VISTA TEMPORAL VACÍA (LA QUE NECESITA LA APLICACIÓN)
CREATE OR REPLACE VIEW investigaciones_completas AS
SELECT 
    gen_random_uuid() as id,
    'Ejemplo Temporal' as titulo,
    'Esta es una vista temporal mientras configuramos el sistema' as descripcion,
    NULL as objetivos,
    NULL as metodologia,
    'borrador' as estado,
    'usabilidad' as tipo,
    'media' as prioridad,
    NULL as fecha_inicio,
    NULL as fecha_fin,
    NOW() as fecha_creacion,
    NOW() as fecha_actualizacion,
    0 as progreso,
    0 as participantes_objetivo,
    0 as participantes_actuales,
    0 as sesiones_programadas,
    0 as sesiones_completadas,
    0.00 as presupuesto_total,
    0.00 as presupuesto_utilizado,
    NULL as creador_id,
    '{}' as tags,
    '{}' as configuracion,
    '{}' as resultados,
    NOW() as created_at,
    NOW() as updated_at,
    'Sistema' as creador_nombre,
    'sistema@app.com' as creador_email,
    0 as total_sesiones,
    0 as sesiones_completadas_real
WHERE false; -- Vista vacía por ahora

SELECT 'Vista temporal creada - Sin tablas' as mensaje;
