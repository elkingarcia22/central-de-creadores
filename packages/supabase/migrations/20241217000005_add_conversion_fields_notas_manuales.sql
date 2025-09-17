-- Agregar campos para rastrear conversiones de notas manuales
-- Fecha: 2024-12-17
-- Descripción: Agregar campos para indicar si una nota fue convertida a dolor o perfilamiento

-- Agregar campos de conversión a la tabla notas_manuales
ALTER TABLE notas_manuales 
ADD COLUMN IF NOT EXISTS convertida_a_dolor BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS convertida_a_perfilamiento BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS dolor_id UUID REFERENCES dolores_participantes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS perfilamiento_id UUID REFERENCES perfilamientos_participantes(id) ON DELETE SET NULL;

-- Agregar comentarios para documentar los campos
COMMENT ON COLUMN notas_manuales.convertida_a_dolor IS 'Indica si la nota fue convertida a un dolor';
COMMENT ON COLUMN notas_manuales.convertida_a_perfilamiento IS 'Indica si la nota fue convertida a un perfilamiento';
COMMENT ON COLUMN notas_manuales.dolor_id IS 'ID del dolor creado a partir de esta nota (si aplica)';
COMMENT ON COLUMN notas_manuales.perfilamiento_id IS 'ID del perfilamiento creado a partir de esta nota (si aplica)';

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_notas_manuales_convertida_a_dolor ON notas_manuales(convertida_a_dolor);
CREATE INDEX IF NOT EXISTS idx_notas_manuales_convertida_a_perfilamiento ON notas_manuales(convertida_a_perfilamiento);
CREATE INDEX IF NOT EXISTS idx_notas_manuales_dolor_id ON notas_manuales(dolor_id);
CREATE INDEX IF NOT EXISTS idx_notas_manuales_perfilamiento_id ON notas_manuales(perfilamiento_id);
