# Configuración de Google Cloud Speech-to-Text

## Para habilitar transcripción real (opcional):

### 1. Crear proyecto en Google Cloud Console
- Ve a [Google Cloud Console](https://console.cloud.google.com/)
- Crea un nuevo proyecto o selecciona uno existente

### 2. Habilitar Speech-to-Text API
- Ve a "APIs & Services" > "Library"
- Busca "Cloud Speech-to-Text API"
- Haz clic en "Enable"

### 3. Crear cuenta de servicio
- Ve a "IAM & Admin" > "Service Accounts"
- Haz clic en "Create Service Account"
- Asigna el rol "Cloud Speech Client"
- Descarga el archivo JSON de credenciales

### 4. Configurar variables de entorno
Agrega estas variables a tu archivo `.env.local`:

```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

### 5. Reiniciar el servidor
```bash
npm run dev
```

## Estado actual:
- ✅ **Transcripción simulada funcionando**
- ⚠️ **Google Cloud no configurado** (usando simulación)
- ✅ **Audio se graba correctamente**
- ✅ **Transcripción se guarda en BD**
- ✅ **UI se actualiza correctamente**

## Para continuar sin Google Cloud:
La transcripción simulada ya está funcionando correctamente y genera texto variado basado en la duración del audio.
