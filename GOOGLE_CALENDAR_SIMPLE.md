# 🚀 Google Calendar - Configuración Simple (Sin OAuth)

## ✅ Ventajas de esta Implementación:
- **Sin autorización del usuario**: No necesitas que cada usuario autorice
- **Más simple**: Solo necesitas configurar una vez
- **Más confiable**: No depende de tokens que expiran
- **Automático**: Las sesiones se sincronizan automáticamente

## 🔧 Configuración Paso a Paso

### 1. 🌐 Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita **Google Calendar API**

### 2. 🔑 Crear Service Account
1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"Crear credenciales"** → **"Cuenta de servicio"**
3. Configura:
   - **Nombre**: `Central de Creadores Calendar`
   - **Descripción**: `Service account para sincronización de calendario`
4. Haz clic en **"Crear y continuar"**
5. **Rol**: `Editor` (o `Calendar Admin` si está disponible)
6. Haz clic en **"Listo"**

### 3. 📋 Generar Clave JSON
1. En la lista de cuentas de servicio, haz clic en la que acabas de crear
2. Ve a la pestaña **"Claves"**
3. Haz clic en **"Agregar clave"** → **"Crear nueva clave"**
4. Selecciona **"JSON"**
5. Haz clic en **"Crear"**
6. Se descargará un archivo JSON

### 4. 📝 Configurar Variables de Entorno
Abre el archivo JSON descargado y copia estos valores:

```bash
# En .env.local, reemplaza las variables de Google Calendar:
GOOGLE_SERVICE_ACCOUNT_EMAIL=tu-service-account@proyecto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_PRIVATE_KEY_AQUI\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=primary
```

**Ejemplo real:**
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=central-creadores@mi-proyecto-123.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=primary
```

### 5. 🔗 Compartir Calendario (Opcional)
Si quieres que las sesiones aparezcan en un calendario específico:

1. Ve a [Google Calendar](https://calendar.google.com/)
2. Crea un nuevo calendario: **"Central de Creadores"**
3. Ve a **"Configuración del calendario"**
4. En **"Compartir con usuarios específicos"**:
   - Agrega el email de tu Service Account
   - Permisos: **"Hacer cambios en los eventos"**
5. Copia el **ID del calendario** (algo como: `abc123@group.calendar.google.com`)
6. Actualiza en `.env.local`:
   ```bash
   GOOGLE_CALENDAR_ID=abc123@group.calendar.google.com
   ```

### 6. 🧪 Probar la Conexión
1. Reinicia el servidor: `npm run dev`
2. Ve a `/configuraciones/conexiones`
3. Haz clic en **"Conectar"** en Google Calendar
4. Debería mostrar: **"Conexión exitosa con Google Calendar"**

## 🎯 Funcionalidades Automáticas

### ✅ Sincronización Automática
- **Crear sesión** → Se crea evento en Google Calendar
- **Editar sesión** → Se actualiza evento en Google Calendar
- **Eliminar sesión** → Se elimina evento de Google Calendar

### ✅ Información Sincronizada
- **Título** de la sesión
- **Fecha y hora** programada
- **Duración** de la sesión
- **Ubicación** (sala/ubicación)
- **Participantes** (como invitados)
- **Descripción** de la sesión

## 🔍 Verificación

### ✅ Checklist de Configuración:
- [ ] Proyecto creado en Google Cloud Console
- [ ] Google Calendar API habilitada
- [ ] Service Account creada
- [ ] Clave JSON descargada
- [ ] Variables configuradas en `.env.local`
- [ ] Servidor reiniciado
- [ ] Conexión probada exitosamente

### 🧪 Probar Manualmente:
```bash
# Probar la API directamente:
curl http://localhost:3000/api/google-calendar/test

# Respuesta esperada:
{
  "success": true,
  "message": "Conexión con Google Calendar exitosa",
  "calendars": 1
}
```

## 🆘 Solución de Problemas

### Error: "Google Service Account credentials not configured"
- ✅ **Solución:** Verifica que las variables estén en `.env.local`
- ✅ **Verificar:** Que no haya espacios extra en las variables

### Error: "Invalid credentials"
- ✅ **Solución:** Verifica que el email y private key sean correctos
- ✅ **Verificar:** Que el archivo JSON se copió completamente

### Error: "Calendar not found"
- ✅ **Solución:** Verifica que el `GOOGLE_CALENDAR_ID` sea correcto
- ✅ **Verificar:** Que el calendario esté compartido con el Service Account

## 🎉 ¡Ventajas de esta Implementación!

### ✅ Para el Usuario:
- **Sin pasos extra**: No necesita autorizar nada
- **Automático**: Las sesiones se sincronizan solas
- **Confiable**: No hay tokens que expiren

### ✅ Para el Desarrollador:
- **Más simple**: Una sola configuración
- **Más estable**: No depende de OAuth flows
- **Más rápido**: No hay redirecciones

**¡Esta es la forma más simple y confiable de integrar Google Calendar!** 🚀
