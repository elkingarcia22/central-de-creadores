# 🎯 GUÍA VISUAL - Configurar Google Calendar

## ❌ Error Actual:
```
The OAuth client was not found.
Error 401: invalid_client
```

## 🔍 Diagnóstico:
El `client_id` en `.env.local` es `TU_CLIENT_ID_AQUI` (placeholder), no una credencial real de Google.

---

## 📋 PASO A PASO - Google Cloud Console

### 1. 🌐 Ir a Google Cloud Console
**URL:** https://console.cloud.google.com/

### 2. 📁 Crear/Seleccionar Proyecto
- **Si no tienes proyecto:**
  - Haz clic en el selector de proyecto (arriba izquierda)
  - "Nuevo proyecto"
  - Nombre: `Central de Creadores`
  - "Crear"

- **Si ya tienes proyecto:**
  - Selecciona tu proyecto existente

### 3. 🔌 Habilitar Google Calendar API
1. En el menú lateral: **"APIs y servicios"** → **"Biblioteca"**
2. Busca: `Google Calendar API`
3. Haz clic en **"Habilitar"**
4. Espera a que se habilite (puede tomar unos segundos)

### 4. 🔑 Crear Credenciales OAuth 2.0
1. En el menú lateral: **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"Crear credenciales"** (botón azul arriba)
3. Selecciona: **"ID de cliente OAuth 2.0"**
4. Si te pide configurar pantalla de consentimiento:
   - **Tipo de usuario:** `Externo`
   - **Nombre de la aplicación:** `Central de Creadores`
   - **Correo de soporte:** Tu email
   - **Dominio autorizado:** `localhost`
   - "Guardar y continuar"

### 5. ⚙️ Configurar Aplicación Web
1. **Tipo de aplicación:** `Aplicación web`
2. **Nombre:** `Central de Creadores`
3. **Orígenes JavaScript autorizados:**
   ```
   http://localhost:3000
   ```
4. **URI de redirección autorizadas:**
   ```
   http://localhost:3000/api/auth/google/callback
   ```
5. Haz clic en **"Crear"**

### 6. 📋 Copiar Credenciales
Después de crear, verás una ventana con:
- **ID de cliente:** `123456789-abcdefg.apps.googleusercontent.com`
- **Secreto de cliente:** `GOCSPX-abcdefghijklmnop`

**¡COPIA ESTOS VALORES!**

### 7. 🎯 Configurar Scopes (Opcional pero Recomendado)
1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento OAuth"**
2. Haz clic en **"Editar aplicación"**
3. Ve a la pestaña **"Scopes"**
4. Haz clic en **"Agregar o quitar scopes"**
5. Busca y selecciona:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
6. **"Actualizar"** → **"Guardar y continuar"**

---

## 🔧 CONFIGURAR VARIABLES DE ENTORNO

### Opción A: Script Automático
```bash
./configurar-credenciales.sh
```

### Opción B: Manual
Edita el archivo `.env.local` y reemplaza:
```bash
# Cambiar esto:
GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI
GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI

# Por esto (tus credenciales reales):
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
```

---

## 🧪 PROBAR LA INTEGRACIÓN

### 1. 🔄 Reiniciar Servidor
```bash
# Detener servidor (Ctrl+C)
npm run dev
```

### 2. 🌐 Ir a Conexiones
URL: `http://localhost:3000/configuraciones/conexiones`

### 3. 🔗 Conectar Google Calendar
- Haz clic en **"Conectar"** en la tarjeta de Google Calendar
- Deberías ser redirigido a Google para autorizar
- Después de autorizar, regresarás a la aplicación

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "The OAuth client was not found"
- ✅ **Solución:** Verifica que el Client ID sea correcto en `.env.local`
- ✅ **Verificar:** Que el proyecto en Google Cloud Console esté activo

### Error: "redirect_uri_mismatch"
- ✅ **Solución:** Verifica que la URI en Google Cloud Console sea exactamente:
  ```
  http://localhost:3000/api/auth/google/callback
  ```

### Error: "access_denied"
- ✅ **Solución:** Verifica que los scopes estén configurados
- ✅ **Verificar:** Que la pantalla de consentimiento esté configurada

### Error: "invalid_client"
- ✅ **Solución:** Verifica que el Client Secret sea correcto
- ✅ **Verificar:** Que no haya espacios extra en las variables

---

## 📞 VERIFICACIÓN RÁPIDA

### ✅ Checklist:
- [ ] Proyecto creado en Google Cloud Console
- [ ] Google Calendar API habilitada
- [ ] Credenciales OAuth 2.0 creadas
- [ ] URI de redirección configurada: `http://localhost:3000/api/auth/google/callback`
- [ ] Orígenes autorizados: `http://localhost:3000`
- [ ] Variables actualizadas en `.env.local`
- [ ] Servidor reiniciado
- [ ] Pantalla de consentimiento configurada (opcional)

### 🔍 Verificar Variables:
```bash
# Verificar que las variables estén configuradas:
grep "GOOGLE_CLIENT_ID" .env.local
# Debe mostrar: GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
# NO debe mostrar: GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI
```

---

## 🎉 ¡ÉXITO!

Si todo está configurado correctamente:
1. El botón "Conectar" te llevará a Google
2. Autorizarás la aplicación
3. Regresarás a la aplicación con Google Calendar conectado
4. Podrás sincronizar sesiones con Google Calendar

**¡La integración estará funcionando!** 🚀
