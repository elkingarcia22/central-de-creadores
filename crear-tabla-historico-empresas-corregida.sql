-- ====================================
-- CREAR TABLA HISTORIAL DE PARTICIPACIÓN DE EMPRESAS (CORREGIDA)
-- ====================================
-- Ejecutar en el SQL Editor de Supabase

-- Crear tabla de historial de participación de empresas (versión simplificada)
CREATE TABLE IF NOT EXISTS historial_participacion_empresas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    investigacion_id UUID NOT NULL REFERENCES investigaciones(id) ON DELETE CASCADE,
    participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
    reclutamiento_id UUID NOT NULL REFERENCES reclutamientos(id) ON DELETE CASCADE,
    
    -- Información básica de la participación
    fecha_participacion TIMESTAMP WITH TIME ZONE NOT NULL,
    duracion_sesion INTEGER NOT NULL DEFAULT 60, -- en minutos
    estado_sesion VARCHAR(50) NOT NULL DEFAULT 'completada' CHECK (estado_sesion IN ('programada', 'en_curso', 'completada', 'cancelada', 'no_show', 'reprogramada')),
    
    -- Metadatos
    creado_por UUID REFERENCES auth.users(id),
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

-- Comentarios para documentación
COMMENT ON TABLE historial_participacion_empresas IS 'Historial simplificado de participación de empresas en investigaciones';
COMMENT ON COLUMN historial_participacion_empresas.empresa_id IS 'ID de la empresa';
COMMENT ON COLUMN historial_participacion_empresas.investigacion_id IS 'ID de la investigación';
COMMENT ON COLUMN historial_participacion_empresas.participante_id IS 'ID del participante';
COMMENT ON COLUMN historial_participacion_empresas.reclutamiento_id IS 'ID del reclutamiento';
COMMENT ON COLUMN historial_participacion_empresas.fecha_participacion IS 'Fecha y hora de la participación';
COMMENT ON COLUMN historial_participacion_empresas.duracion_sesion IS 'Duración de la sesión en minutos';
COMMENT ON COLUMN historial_participacion_empresas.estado_sesion IS 'Estado de la sesión (completada, cancelada, etc.)';

-- Verificar que la tabla se creó correctamente
SELECT 
    'Tabla corregida creada exitosamente' as resultado,
    COUNT(*) as total_registros
FROM historial_participacion_empresas; 