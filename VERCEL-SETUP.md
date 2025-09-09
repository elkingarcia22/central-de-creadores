# Configuración de Vercel para Central de Creadores

## 🚀 Variables de Entorno Requeridas

Para que la aplicación funcione correctamente en Vercel, necesitas configurar las siguientes variables de entorno:

### Variables Obligatorias

1. **NEXT_PUBLIC_SUPABASE_URL**
   - Valor: `https://eloncaptettdvrvwypji.supabase.co`
   - Descripción: URL de tu proyecto Supabase

2. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Valor: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsb25jYXB0ZXR0ZHZydnd5cGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMTYwMjQsImV4cCI6MjA2NTY5MjAyNH0.CFQ1kOCoNgNZ74yOF6qymrUUPV9V0B8JX2sfjc8LUv0`
   - Descripción: Clave anónima de Supabase

3. **SUPABASE_SERVICE_ROLE_KEY**
   - Valor: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsb25jYXB0ZXR0ZHZydnd5cGppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDExNjAyNCwiZXhwIjoyMDY1NjkyMDI0fQ.b4-pu9KmNmn6jYYv1HgSKtoSRzjZDEEpdhtHcXxqWxw`
   - Descripción: Clave de servicio de Supabase (para operaciones del servidor)

### Variables Opcionales (para Google Calendar)

4. **GOOGLE_CLIENT_ID**
   - Valor: `542316059756-6de64bu...`
   - Descripción: ID del cliente de Google OAuth

5. **GOOGLE_CLIENT_SECRET**
   - Valor: `GOCSPX-cVtbXTvd4bxDi...`
   - Descripción: Secreto del cliente de Google OAuth

## 📋 Pasos para Configurar en Vercel

### 1. Acceder a la Configuración del Proyecto
1. Ve a tu dashboard de Vercel
2. Selecciona el proyecto "central-de-creadores"
3. Ve a la pestaña "Settings"
4. Haz clic en "Environment Variables"

### 2. Agregar Variables de Entorno
Para cada variable de entorno:

1. Haz clic en "Add New"
2. Ingresa el **Name** (ej: `NEXT_PUBLIC_SUPABASE_URL`)
3. Ingresa el **Value** (el valor correspondiente)
4. Selecciona los **Environments** (Production, Preview, Development)
5. Haz clic en "Save"

### 3. Verificar Configuración
Después de agregar todas las variables:

1. Ve a la pestaña "Deployments"
2. Haz clic en "Redeploy" en el último deployment
3. O haz un nuevo push a la rama para trigger un nuevo deploy

## 🔧 Solución de Problemas

### Error 500 en API metricas-reclutamientos

Si sigues viendo el error 500, verifica:

1. **Variables de entorno configuradas**: Todas las variables deben estar en Vercel
2. **Permisos de Supabase**: La SERVICE_ROLE_KEY debe tener permisos completos
3. **RLS (Row Level Security)**: Verificar que las políticas de Supabase permitan las consultas
4. **Logs de Vercel**: Revisar los logs del deployment para ver errores específicos

### Verificar Logs en Vercel

1. Ve a tu proyecto en Vercel
2. Haz clic en la pestaña "Functions"
3. Busca la función `metricas-reclutamientos`
4. Revisa los logs para ver errores específicos

## 🚨 Importante

- **NUNCA** subas las variables de entorno al repositorio
- **SIEMPRE** usa las variables de entorno en Vercel
- **VERIFICA** que todas las variables estén configuradas antes del deploy

## 📞 Soporte

Si tienes problemas con la configuración, revisa:
1. Los logs de Vercel
2. Los logs de Supabase
3. La configuración de RLS en Supabase
4. Los permisos de la SERVICE_ROLE_KEY
