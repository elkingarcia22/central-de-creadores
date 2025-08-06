-- ====================================
-- CREAR TABLA HISTORIAL DE PARTICIPACIÓN DE EMPRESAS
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- Crear tabla de historial de participación de empresas
CREATE TABLE IF NOT EXISTS historial_participacion_empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    investigacion_id UUID NOT NULL REFERENCES investigaciones(id) ON DELETE CASCADE,
    participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
    reclutamiento_id UUID NOT NULL REFERENCES reclutamientos(id) ON DELETE CASCADE,
    
    -- Información de la participación
    fecha_participacion TIMESTAMP WITH TIME ZONE NOT NULL,
    duracion_sesion INTEGER NOT NULL DEFAULT 60, -- en minutos
    estado_sesion VARCHAR(50) NOT NULL DEFAULT 'completada' CHECK (estado_sesion IN ('programada', 'en_curso', 'completada', 'cancelada', 'no_show')),
    
    -- Información del participante en ese momento
    rol_participante VARCHAR(255), -- Rol del participante en la empresa
    departamento_participante VARCHAR(255), -- Departamento del participante
    
    -- Información de la investigación
    tipo_investigacion VARCHAR(100),
    producto_evaluado VARCHAR(255),
    
    -- Métricas de la sesión
    satisfaccion_participante INTEGER CHECK (satisfaccion_participante >= 1 AND satisfaccion_participante <= 5),
    calidad_feedback TEXT,
    insights_obtenidos TEXT,
    
    -- Información de seguimiento
    seguimiento_requerido BOOLEAN DEFAULT false,
    fecha_seguimiento TIMESTAMP WITH TIME ZONE,
    notas_seguimiento TEXT,
    
    -- Metadatos
    creado_por UUID REFERENCES usuarios(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_historial_empresa_id ON historial_participacion_empresas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_historial_investigacion_id ON historial_participacion_empresas(investigacion_id);
CREATE INDEX IF NOT EXISTS idx_historial_participante_id ON historial_participacion_empresas(participante_id);
CREATE INDEX IF NOT EXISTS idx_historial_reclutamiento_id ON historial_participacion_empresas(reclutamiento_id);
CREATE INDEX IF NOT EXISTS idx_historial_fecha_participacion ON historial_participacion_empresas(fecha_participacion);
CREATE INDEX IF NOT EXISTS idx_historial_estado_sesion ON historial_participacion_empresas(estado_sesion);

-- Habilitar RLS (Row Level Security)
ALTER TABLE historial_participacion_empresas ENABLE ROW LEVEL SECURITY;

-- Crear políticas básicas de RLS
CREATE POLICY "Usuarios autenticados pueden ver historial de empresas" ON historial_participacion_empresas
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden insertar historial de empresas" ON historial_participacion_empresas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar historial de empresas" ON historial_participacion_empresas
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_historial_empresas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at
CREATE TRIGGER trigger_update_historial_empresas_updated_at
    BEFORE UPDATE ON historial_participacion_empresas
    FOR EACH ROW
    EXECUTE FUNCTION update_historial_empresas_updated_at();

-- Crear función para insertar automáticamente en el historial cuando se complete un reclutamiento
CREATE OR REPLACE FUNCTION insertar_historial_empresa_automatico()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo insertar si el estado cambia a 'Finalizado' o 'Completado'
    IF NEW.estado_agendamiento = (
        SELECT id FROM estado_agendamiento_cat WHERE nombre IN ('Finalizado', 'Completado') LIMIT 1
    ) AND OLD.estado_agendamiento != NEW.estado_agendamiento THEN
        
        -- Insertar en el historial
        INSERT INTO historial_participacion_empresas (
            empresa_id,
            investigacion_id,
            participante_id,
            reclutamiento_id,
            fecha_participacion,
            duracion_sesion,
            estado_sesion,
            rol_participante,
            tipo_investigacion,
            producto_evaluado,
            creado_por
        )
        SELECT 
            p.empresa_id,
            r.investigacion_id,
            r.participantes_id,
            r.id,
            COALESCE(r.fecha_sesion, NOW()),
            COALESCE(r.duracion_sesion, 60),
            'completada',
            re.nombre as rol_participante,
            ti.nombre as tipo_investigacion,
            pr.nombre as producto_evaluado,
            r.creado_por
        FROM reclutamientos r
        LEFT JOIN participantes p ON r.participantes_id = p.id
        LEFT JOIN roles_empresa re ON p.rol_empresa_id = re.id
        LEFT JOIN investigaciones i ON r.investigacion_id = i.id
        LEFT JOIN tipos_investigacion ti ON i.tipo_investigacion_id = ti.id
        LEFT JOIN productos pr ON i.producto_id = pr.id
        WHERE r.id = NEW.id
        AND p.empresa_id IS NOT NULL; -- Solo para participantes externos con empresa
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para insertar automáticamente en el historial
CREATE TRIGGER trigger_insertar_historial_empresa
    AFTER UPDATE ON reclutamientos
    FOR EACH ROW
    EXECUTE FUNCTION insertar_historial_empresa_automatico();

-- Verificar que la tabla se creó correctamente
SELECT 'Tabla historial_participacion_empresas creada exitosamente' as resultado;

-- Mostrar estructura de la tabla creada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_empresas'
ORDER BY ordinal_position; 