-- ====================================
-- CREAR TABLA DE DOLORES DE PARTICIPANTES
-- ====================================

-- 1. Crear tabla de categorías de dolores
CREATE TABLE IF NOT EXISTS categorias_dolores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    color VARCHAR(7) DEFAULT '#6B7280', -- Color por defecto gris
    icono VARCHAR(50), -- Para iconos del frontend
    orden INTEGER DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de dolores de participantes
CREATE TABLE IF NOT EXISTS dolores_participantes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participante_id UUID NOT NULL,
    categoria_id UUID NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    severidad VARCHAR(20) DEFAULT 'media' CHECK (severidad IN ('baja', 'media', 'alta', 'critica')),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'resuelto', 'archivado')),
    investigacion_relacionada_id UUID, -- Opcional: relacionar con una investigación específica
    sesion_relacionada_id UUID, -- Opcional: relacionar con una sesión específica
    creado_por UUID, -- Usuario que creó el dolor
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_resolucion TIMESTAMP WITH TIME ZONE,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign keys
    FOREIGN KEY (participante_id) REFERENCES participantes(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES categorias_dolores(id) ON DELETE RESTRICT,
    FOREIGN KEY (investigacion_relacionada_id) REFERENCES investigaciones(id) ON DELETE SET NULL,
    FOREIGN KEY (sesion_relacionada_id) REFERENCES reclutamientos(id) ON DELETE SET NULL,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 3. Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_dolores_participante_id ON dolores_participantes(participante_id);
CREATE INDEX IF NOT EXISTS idx_dolores_categoria_id ON dolores_participantes(categoria_id);
CREATE INDEX IF NOT EXISTS idx_dolores_estado ON dolores_participantes(estado);
CREATE INDEX IF NOT EXISTS idx_dolores_fecha_creacion ON dolores_participantes(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_dolores_investigacion ON dolores_participantes(investigacion_relacionada_id);
CREATE INDEX IF NOT EXISTS idx_dolores_sesion ON dolores_participantes(sesion_relacionada_id);

-- 4. Insertar categorías predefinidas
INSERT INTO categorias_dolores (nombre, descripcion, color, icono, orden) VALUES
-- Funcionales
('Funcionales', 'Falta de funcionalidades, limitaciones técnicas, usabilidad básica', '#EF4444', 'wrench', 1),
('Falta de funcionalidades', 'Cosas que el producto no hace y el cliente necesita', '#DC2626', 'plus-circle', 2),
('Limitaciones técnicas', 'Rendimiento, integraciones, compatibilidad, velocidad, errores', '#B91C1C', 'cpu', 3),
('Usabilidad básica', 'Facilidad para ejecutar tareas clave, accesibilidad, curva de aprendizaje', '#991B1B', 'mouse-pointer', 4),

-- Experiencia de Usuario
('Experiencia de Usuario', 'Interfaz, flujo, soporte, personalización', '#3B82F6', 'user', 5),
('Interfaz y diseño', 'Claridad, estética, consistencia visual', '#2563EB', 'palette', 6),
('Flujo y simplicidad', 'Número de pasos, fricción, redundancias', '#1D4ED8', 'arrow-right', 7),
('Soporte y acompañamiento', 'Facilidad de encontrar ayuda, documentación, tutoriales', '#1E40AF', 'life-buoy', 8),
('Personalización', 'Capacidad de adaptar la experiencia a sus necesidades', '#1E3A8A', 'settings', 9),

-- Negocio / Valor
('Negocio / Valor', 'Costo/beneficio, retorno esperado, flexibilidad contractual', '#10B981', 'dollar-sign', 10),
('Costo/beneficio', 'Percepción de precio vs. valor recibido', '#059669', 'trending-up', 11),
('Retorno esperado', 'Impacto en productividad, ingresos, ahorro de tiempo o recursos', '#047857', 'target', 12),
('Flexibilidad contractual', 'Licencias, planes, escalabilidad', '#065F46', 'file-text', 13),

-- Emocionales / Motivacionales
('Emocionales / Motivacionales', 'Confianza, control, satisfacción general', '#F59E0B', 'heart', 14),
('Confianza y seguridad', 'Privacidad, cumplimiento normativo, confiabilidad de la marca', '#D97706', 'shield', 15),
('Sensación de control', 'Autonomía para manejar el producto sin depender de terceros', '#B45309', 'command', 16),
('Satisfacción general', 'Frustraciones, expectativas cumplidas/no cumplidas', '#92400E', 'smile', 17),

-- Operativos / Organizacionales
('Operativos / Organizacionales', 'Adopción interna, capacitación, integración con procesos', '#8B5CF6', 'users', 18),
('Adopción interna', 'Facilidad para que los equipos usen el producto', '#7C3AED', 'user-check', 19),
('Capacitación necesaria', 'Curva de aprendizaje, necesidad de formación', '#6D28D9', 'graduation-cap', 20),
('Integración con procesos', 'Qué tan fácil se incorpora a su forma de trabajar', '#5B21B6', 'git-branch', 21),

-- Estratégicos
('Estratégicos', 'Alineación con objetivos, escalabilidad, innovación', '#EC4899', 'target', 22),
('Alineación con objetivos', 'Si el producto realmente ayuda a alcanzar metas estratégicas', '#DB2777', 'flag', 23),
('Escalabilidad futura', 'Si soporta el crecimiento de la empresa', '#BE185D', 'trending-up', 24),
('Innovación', 'Percepción de modernidad, actualización constante, competitividad', '#9D174D', 'zap', 25)
ON CONFLICT (nombre) DO NOTHING;

-- 5. Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Crear triggers para actualizar updated_at
CREATE TRIGGER update_categorias_dolores_updated_at 
    BEFORE UPDATE ON categorias_dolores 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dolores_participantes_updated_at 
    BEFORE UPDATE ON dolores_participantes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Crear vista para facilitar consultas
CREATE OR REPLACE VIEW vista_dolores_participantes AS
SELECT 
    dp.id,
    dp.participante_id,
    p.nombre as participante_nombre,
    p.email as participante_email,
    dp.categoria_id,
    cd.nombre as categoria_nombre,
    cd.color as categoria_color,
    cd.icono as categoria_icono,
    dp.titulo,
    dp.descripcion,
    dp.severidad,
    dp.estado,
    dp.investigacion_relacionada_id,
    i.nombre as investigacion_nombre,
    dp.sesion_relacionada_id,
    dp.creado_por,
    u.nombre as creado_por_nombre,
    dp.fecha_creacion,
    dp.fecha_resolucion,
    dp.fecha_actualizacion
FROM dolores_participantes dp
LEFT JOIN participantes p ON dp.participante_id = p.id
LEFT JOIN categorias_dolores cd ON dp.categoria_id = cd.id
LEFT JOIN investigaciones i ON dp.investigacion_relacionada_id = i.id
LEFT JOIN usuarios u ON dp.creado_por = u.id
WHERE cd.activo = true;

-- 8. Crear políticas RLS (Row Level Security) si es necesario
ALTER TABLE categorias_dolores ENABLE ROW LEVEL SECURITY;
ALTER TABLE dolores_participantes ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias_dolores (lectura pública, escritura solo para autenticados)
CREATE POLICY "Categorías visibles para todos" ON categorias_dolores
    FOR SELECT USING (true);

CREATE POLICY "Solo usuarios autenticados pueden crear categorías" ON categorias_dolores
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Solo usuarios autenticados pueden actualizar categorías" ON categorias_dolores
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas para dolores_participantes
CREATE POLICY "Dolores visibles para usuarios autenticados" ON dolores_participantes
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden crear dolores" ON dolores_participantes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar dolores" ON dolores_participantes
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden eliminar dolores" ON dolores_participantes
    FOR DELETE USING (auth.role() = 'authenticated');

-- 9. Comentarios para documentación
COMMENT ON TABLE categorias_dolores IS 'Categorías para clasificar dolores y necesidades de participantes';
COMMENT ON TABLE dolores_participantes IS 'Dolores y necesidades registrados por participantes';
COMMENT ON VIEW vista_dolores_participantes IS 'Vista unificada de dolores con información relacionada';

-- 10. Verificar la creación
SELECT 'Tablas creadas exitosamente' as resultado;
SELECT COUNT(*) as total_categorias FROM categorias_dolores;
SELECT COUNT(*) as total_dolores FROM dolores_participantes;
