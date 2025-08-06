-- Crear tabla de historial de participación para participantes internos
-- Similar a historial_participacion_empresas pero para participantes internos

CREATE TABLE IF NOT EXISTS historial_participacion_participantes_internos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participante_interno_id UUID NOT NULL REFERENCES participantes_internos(id) ON DELETE CASCADE,
    investigacion_id UUID NOT NULL REFERENCES investigaciones(id) ON DELETE CASCADE,
    fecha_participacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado_sesion TEXT NOT NULL DEFAULT 'completada' CHECK (estado_sesion IN ('completada', 'cancelada', 'reprogramada')),
    duracion_minutos INTEGER DEFAULT 60,
    reclutador_id UUID REFERENCES auth.users(id),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_historial_participantes_internos_participante_id 
ON historial_participacion_participantes_internos(participante_interno_id);

CREATE INDEX IF NOT EXISTS idx_historial_participantes_internos_investigacion_id 
ON historial_participacion_participantes_internos(investigacion_id);

CREATE INDEX IF NOT EXISTS idx_historial_participantes_internos_fecha 
ON historial_participacion_participantes_internos(fecha_participacion);

CREATE INDEX IF NOT EXISTS idx_historial_participantes_internos_estado 
ON historial_participacion_participantes_internos(estado_sesion);

-- Habilitar RLS
ALTER TABLE historial_participacion_participantes_internos ENABLE ROW LEVEL SECURITY;

-- Política básica de RLS (ajustar según necesidades)
CREATE POLICY "Usuarios autenticados pueden ver historial de participantes internos" 
ON historial_participacion_participantes_internos 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuarios autenticados pueden insertar historial de participantes internos" 
ON historial_participacion_participantes_internos 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar historial de participantes internos" 
ON historial_participacion_participantes_internos 
FOR UPDATE 
TO authenticated 
USING (true);

-- Verificar que la tabla se creó correctamente
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'historial_participacion_participantes_internos'
ORDER BY ordinal_position; 