# 🚀 Google Calendar OAuth 2.0 - Configuración por Usuario

## ✅ **Flujo Implementado:**
1. **Usuario hace clic** en "Conectar Google Calendar"
2. **Se abre ventana** de Google para autorizar
3. **Usuario elige** su cuenta de Google
4. **Autoriza** la aplicación
5. **Regresa** a la aplicación con su calendario conectado
6. **Sincronización automática** de sus sesiones

---

## 🔧 **Paso 1: Google Cloud Console**

### **1.1: Ir a Credenciales**
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto "Central de Creadores"
3. Ve a **"APIs y servicios"** → **"Credenciales"**

### **1.2: Crear Credenciales OAuth 2.0**
1. Haz clic en **"Crear credenciales"** (botón azul arriba)
2. Selecciona: **"ID de cliente OAuth 2.0"**

### **1.3: Configurar Pantalla de Consentimiento**
Si es la primera vez, te pedirá configurar:
1. **Tipo de usuario**: `Externo`
2. **Nombre de la aplicación**: `Central de Creadores`
3. **Correo de soporte**: Tu email
4. **Dominio autorizado**: `localhost`
5. **"Guardar y continuar"**

### **1.4: Configurar Aplicación Web**
1. **Tipo de aplicación**: `Aplicación web`
2. **Nombre**: `Central de Creadores`
3. **Orígenes JavaScript autorizados**:
   ```
   http://localhost:3000
   ```
4. **URI de redirección autorizadas**:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
5. Haz clic en **"Crear"**

### **1.5: Copiar Credenciales**
Después de crear, copia:
- **ID de cliente**: `123456789-abcdefg.apps.googleusercontent.com`
- **Secreto de cliente**: `GOCSPX-abcdefghijklmnop`

---

## 📝 **Paso 2: Configurar Variables de Entorno**

### **2.1: Actualizar .env.local**
Reemplaza en tu archivo `.env.local`:
```bash
# Cambiar estas líneas:
GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI
GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI

# Por tus credenciales reales:
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
```

### **2.2: Verificar Configuración**
Tu `.env.local` debería verse así:
```bash
# Variables OAuth (activas)
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# Variables Service Account (comentadas)
#GOOGLE_SERVICE_ACCOUNT_EMAIL=...
#GOOGLE_PRIVATE_KEY=...
#GOOGLE_CALENDAR_ID=primary
```

---

## 🎯 **Paso 3: Configurar Scopes (Opcional)**

### **3.1: Agregar Scopes**
1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento OAuth"**
2. Haz clic en **"Editar aplicación"**
3. Ve a la pestaña **"Scopes"**
4. Haz clic en **"Agregar o quitar scopes"**
5. Busca y selecciona:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
6. **"Actualizar"** → **"Guardar y continuar"**

---

## 🧪 **Paso 4: Probar la Integración**

### **4.1: Reiniciar Servidor**
```bash
# Detener servidor (Ctrl+C)
npm run dev
```

### **4.2: Probar Flujo Completo**
1. Ve a: `http://localhost:3000/configuraciones/conexiones`
2. Haz clic en **"Conectar"** en Google Calendar
3. **Se abrirá ventana de Google** para autorizar
4. **Elige tu cuenta** de Google
5. **Autoriza** la aplicación
6. **Regresarás** a la aplicación con Google Calendar conectado

---

## 🎉 **Resultado Esperado**

### **✅ Para el Usuario:**
1. **Clic en "Conectar"** → Se abre Google
2. **Elige cuenta** → Autoriza aplicación
3. **Regresa** → Ve "Conectado" en la interfaz
4. **Sincronización automática** de sus sesiones

### **✅ Para el Desarrollador:**
- **Código OAuth** ya implementado
- **Manejo de tokens** por usuario
- **Sincronización automática** con calendario personal
- **Interfaz simple** para conectar/desconectar

---

## 🆘 **Solución de Problemas**

### **Error: "redirect_uri_mismatch"**
- ✅ **Solución**: Verifica que la URI en Google Cloud Console sea exactamente:
  ```
  http://localhost:3000/api/auth/google/callback
  ```

### **Error: "invalid_client"**
- ✅ **Solución**: Verifica que el Client ID y Client Secret sean correctos
- ✅ **Verificar**: Que no haya espacios extra en las variables

### **Error: "access_denied"**
- ✅ **Solución**: Verifica que los scopes estén configurados
- ✅ **Verificar**: Que la pantalla de consentimiento esté configurada

---

## 🔄 **Restaurar Service Account (Si Necesitas)**

Si quieres volver al enfoque anterior:
```bash
cp .env.local.service-account-backup .env.local
```

---

## 🚀 **¡Listo para Usar!**

Una vez configurado:
- **Cada usuario** puede conectar su Google Calendar
- **Sincronización automática** de sesiones
- **Interfaz simple** y familiar
- **Sin configuración** adicional por usuario

**¡Este es el enfoque más sencillo y común para integraciones de Google Calendar!** 🎯
