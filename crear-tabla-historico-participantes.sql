-- ====================================
-- CREAR TABLA HISTORIAL DE PARTICIPACIÓN DE PARTICIPANTES
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- Crear tabla de historial de participación de participantes
CREATE TABLE IF NOT EXISTS historial_participacion_participantes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
    investigacion_id UUID NOT NULL REFERENCES investigaciones(id) ON DELETE CASCADE,
    reclutamiento_id UUID NOT NULL REFERENCES reclutamientos(id) ON DELETE CASCADE,
    empresa_id UUID REFERENCES empresas(id) ON DELETE SET NULL,
    
    -- Información de la participación
    fecha_participacion TIMESTAMP WITH TIME ZONE NOT NULL,
    duracion_sesion INTEGER NOT NULL DEFAULT 60,
    estado_sesion VARCHAR(50) NOT NULL DEFAULT 'completada',
    rol_participante VARCHAR(100),
    departamento_participante VARCHAR(100),
    tipo_investigacion VARCHAR(100),
    producto_evaluado VARCHAR(200),
    
    -- Métricas de satisfacción y calidad
    satisfaccion_participante INTEGER CHECK (satisfaccion_participante >= 1 AND satisfaccion_participante <= 5),
    calidad_feedback TEXT,
    insights_obtenidos TEXT,
    
    -- Seguimiento
    seguimiento_requerido BOOLEAN DEFAULT FALSE,
    fecha_seguimiento TIMESTAMP WITH TIME ZONE,
    notas_seguimiento TEXT,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    creado_por UUID REFERENCES auth.users(id),
    actualizado_por UUID REFERENCES auth.users(id)
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_historial_participantes_participante_id ON historial_participacion_participantes(participante_id);
CREATE INDEX IF NOT EXISTS idx_historial_participantes_fecha ON historial_participacion_participantes(fecha_participacion);
CREATE INDEX IF NOT EXISTS idx_historial_participantes_empresa_id ON historial_participacion_participantes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_historial_participantes_estado ON historial_participacion_participantes(estado_sesion);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_historial_participantes_updated_at 
    BEFORE UPDATE ON historial_participacion_participantes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE historial_participacion_participantes IS 'Historial de participación de participantes en investigaciones';
COMMENT ON COLUMN historial_participacion_participantes.participante_id IS 'ID del participante';
COMMENT ON COLUMN historial_participacion_participantes.investigacion_id IS 'ID de la investigación';
COMMENT ON COLUMN historial_participacion_participantes.reclutamiento_id IS 'ID del reclutamiento';
COMMENT ON COLUMN historial_participacion_participantes.empresa_id IS 'ID de la empresa (solo para participantes externos)';
COMMENT ON COLUMN historial_participacion_participantes.fecha_participacion IS 'Fecha y hora de la participación';
COMMENT ON COLUMN historial_participacion_participantes.duracion_sesion IS 'Duración de la sesión en minutos';
COMMENT ON COLUMN historial_participacion_participantes.estado_sesion IS 'Estado de la sesión (completada, cancelada, etc.)';
COMMENT ON COLUMN historial_participacion_participantes.rol_participante IS 'Rol del participante en la sesión';
COMMENT ON COLUMN historial_participacion_participantes.satisfaccion_participante IS 'Nivel de satisfacción del participante (1-5)';
COMMENT ON COLUMN historial_participacion_participantes.calidad_feedback IS 'Feedback sobre la calidad de la sesión';
COMMENT ON COLUMN historial_participacion_participantes.seguimiento_requerido IS 'Indica si se requiere seguimiento';
COMMENT ON COLUMN historial_participacion_participantes.fecha_seguimiento IS 'Fecha programada para el seguimiento';

-- Verificar que la tabla se creó correctamente
SELECT 
    'Tabla creada exitosamente' as resultado,
    COUNT(*) as total_registros
FROM historial_participacion_participantes; 