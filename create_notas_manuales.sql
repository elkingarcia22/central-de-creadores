-- Crear tabla para notas manuales
CREATE TABLE IF NOT EXISTS notas_manuales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  sesion_id UUID NOT NULL REFERENCES reclutamientos(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_notas_manuales_participante_id ON notas_manuales(participante_id);
CREATE INDEX IF NOT EXISTS idx_notas_manuales_sesion_id ON notas_manuales(sesion_id);
CREATE INDEX IF NOT EXISTS idx_notas_manuales_fecha_creacion ON notas_manuales(fecha_creacion);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notas_manuales_updated_at 
    BEFORE UPDATE ON notas_manuales 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS (Row Level Security)
ALTER TABLE notas_manuales ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad
CREATE POLICY "Usuarios autenticados pueden ver sus notas" ON notas_manuales
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear notas" ON notas_manuales
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar sus notas" ON notas_manuales
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar sus notas" ON notas_manuales
    FOR DELETE USING (auth.role() = 'authenticated');

-- Comentarios para documentación
COMMENT ON TABLE notas_manuales IS 'Tabla para almacenar notas manuales creadas durante las sesiones';
COMMENT ON COLUMN notas_manuales.participante_id IS 'ID del participante al que pertenece la nota';
COMMENT ON COLUMN notas_manuales.sesion_id IS 'ID de la sesión en la que se creó la nota';
COMMENT ON COLUMN notas_manuales.contenido IS 'Contenido de la nota manual';
COMMENT ON COLUMN notas_manuales.fecha_creacion IS 'Fecha y hora de creación de la nota';
COMMENT ON COLUMN notas_manuales.fecha_actualizacion IS 'Fecha y hora de última actualización de la nota';
