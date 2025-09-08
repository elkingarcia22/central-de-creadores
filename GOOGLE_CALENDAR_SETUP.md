# 🔧 Configuración de Google Calendar

## ❌ Error Actual
```
Missing required parameter: client_id
Error 400: invalid_request
```

## ✅ Solución

### 1. Crear archivo `.env.local`

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```bash
# ====================================
# CONFIGURACIÓN SUPABASE
# ====================================
SUPABASE_URL=https://eloncaptettdvrvwypji.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsb25jYXB0ZXR0ZHZydnd5cGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMTYwMjQsImV4cCI6MjA2NTY5MjAyNH0.CFQ1kOCoNgNZ74yOF6qymrUUPV9V0B8JX2sfjc8LUv0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsb25jYXB0ZXR0ZHZydnd5cGppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDExNjAyNCwiZXhwIjoyMDY1NjkyMDI0fQ.b4-pu9KmNmn6jYYv1HgSKtoSRzjZDEEpdhtHcXxqWxw

# ====================================
# CONFIGURACIÓN GOOGLE CALENDAR
# ====================================
GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI
GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# ====================================
# CONFIGURACIÓN DE DESARROLLO
# ====================================
NODE_ENV=development
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-aqui
```

### 2. Configurar Google Cloud Console

#### Paso 1: Crear/Seleccionar Proyecto
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente

#### Paso 2: Habilitar APIs
1. Ve a "APIs y servicios" > "Biblioteca"
2. Busca "Google Calendar API"
3. Haz clic en "Habilitar"

#### Paso 3: Crear Credenciales OAuth 2.0
1. Ve a "APIs y servicios" > "Credenciales"
2. Haz clic en "Crear credenciales" > "ID de cliente OAuth 2.0"
3. Selecciona "Aplicación web"
4. Configura:
   - **Nombre**: Central de Creadores
   - **Orígenes JavaScript autorizados**: `http://localhost:3000`
   - **URI de redirección autorizadas**: `http://localhost:3000/api/auth/google/callback`

#### Paso 4: Obtener Credenciales
1. Copia el **Client ID** y **Client Secret**
2. Reemplaza en `.env.local`:
   - `TU_CLIENT_ID_AQUI` → Tu Client ID
   - `TU_CLIENT_SECRET_AQUI` → Tu Client Secret

### 3. Configurar Pantalla de Consentimiento

1. Ve a "APIs y servicios" > "Pantalla de consentimiento OAuth"
2. Configura:
   - **Tipo de usuario**: Externo
   - **Nombre de la aplicación**: Central de Creadores
   - **Correo de soporte**: Tu email
   - **Dominio autorizado**: `localhost` (para desarrollo)

### 4. Agregar Scopes

1. En "Pantalla de consentimiento" > "Scopes"
2. Agrega estos scopes:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`

### 5. Reiniciar el Servidor

```bash
npm run dev
```

## 🧪 Probar la Integración

1. Ve a `/configuraciones/conexiones`
2. Haz clic en "Conectar" en Google Calendar
3. Deberías ser redirigido a Google para autorizar
4. Después de autorizar, regresarás a la aplicación

## 🔍 Verificar Configuración

Si sigues teniendo problemas, verifica:

1. ✅ Archivo `.env.local` existe y tiene las variables correctas
2. ✅ Google Calendar API está habilitada
3. ✅ Credenciales OAuth 2.0 están configuradas
4. ✅ URI de redirección coincide exactamente
5. ✅ Servidor se reinició después de agregar variables de entorno

## 📝 Notas Importantes

- **Desarrollo**: Usa `http://localhost:3000` para desarrollo local
- **Producción**: Cambia las URIs a tu dominio de producción
- **Seguridad**: Nunca subas `.env.local` a Git (ya está en `.gitignore`)
- **Límites**: Google tiene límites de rate limiting para la API

## 🆘 Solución de Problemas

### Error: "redirect_uri_mismatch"
- Verifica que la URI en Google Cloud Console coincida exactamente con `GOOGLE_REDIRECT_URI`

### Error: "invalid_client"
- Verifica que el Client ID y Client Secret sean correctos

### Error: "access_denied"
- Verifica que los scopes estén configurados en la pantalla de consentimiento
