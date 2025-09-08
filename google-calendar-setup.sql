-- Crear tabla para almacenar tokens de Google Calendar
CREATE TABLE IF NOT EXISTS google_calendar_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_type TEXT DEFAULT 'Bearer',
    expiry_date BIGINT,
    scope TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_google_calendar_tokens_user_id ON google_calendar_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_google_calendar_tokens_expiry ON google_calendar_tokens(expiry_date);

-- Habilitar RLS (Row Level Security)
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS
CREATE POLICY "Users can view their own Google Calendar tokens" ON google_calendar_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Google Calendar tokens" ON google_calendar_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google Calendar tokens" ON google_calendar_tokens
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google Calendar tokens" ON google_calendar_tokens
    FOR DELETE USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_google_calendar_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER trigger_update_google_calendar_tokens_updated_at
    BEFORE UPDATE ON google_calendar_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_google_calendar_tokens_updated_at();

-- Agregar comentarios a la tabla
COMMENT ON TABLE google_calendar_tokens IS 'Almacena tokens de autenticación de Google Calendar para cada usuario';
COMMENT ON COLUMN google_calendar_tokens.user_id IS 'ID del usuario propietario de los tokens';
COMMENT ON COLUMN google_calendar_tokens.access_token IS 'Token de acceso de Google Calendar';
COMMENT ON COLUMN google_calendar_tokens.refresh_token IS 'Token de actualización de Google Calendar';
COMMENT ON COLUMN google_calendar_tokens.expiry_date IS 'Fecha de expiración del token en formato Unix timestamp';
COMMENT ON COLUMN google_calendar_tokens.scope IS 'Scopes de permisos otorgados por el usuario';
