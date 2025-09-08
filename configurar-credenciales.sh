#!/bin/bash

# ====================================
# CONFIGURADOR INTERACTIVO DE GOOGLE CALENDAR
# ====================================

echo "🔧 Configurador de Google Calendar - Central de Creadores"
echo "=================================================="
echo ""

# Verificar si .env.local existe
if [ ! -f ".env.local" ]; then
    echo "❌ Error: No se encontró el archivo .env.local"
    echo "Ejecuta primero: ./setup-google-calendar.sh"
    exit 1
fi

echo "📋 PASO 1: Configurar Google Cloud Console"
echo ""
echo "1. 🌐 Ve a: https://console.cloud.google.com/"
echo "2. 📁 Crea un proyecto o selecciona uno existente"
echo "3. 🔌 Habilita Google Calendar API:"
echo "   - Ve a 'APIs y servicios' > 'Biblioteca'"
echo "   - Busca 'Google Calendar API'"
echo "   - Haz clic en 'Habilitar'"
echo ""
echo "4. 🔑 Crea credenciales OAuth 2.0:"
echo "   - Ve a 'APIs y servicios' > 'Credenciales'"
echo "   - Haz clic en 'Crear credenciales' > 'ID de cliente OAuth 2.0'"
echo "   - Selecciona 'Aplicación web'"
echo "   - Configura:"
echo "     * Nombre: Central de Creadores"
echo "     * Orígenes JavaScript autorizados: http://localhost:3000"
echo "     * URI de redirección autorizadas: http://localhost:3000/api/auth/google/callback"
echo ""
echo "5. 📋 Copia las credenciales que aparecen"
echo ""

# Solicitar Client ID
echo "📝 PASO 2: Ingresar Credenciales"
echo ""
read -p "🔑 Ingresa tu Google Client ID: " CLIENT_ID

if [ -z "$CLIENT_ID" ]; then
    echo "❌ Error: Client ID no puede estar vacío"
    exit 1
fi

# Solicitar Client Secret
read -p "🔐 Ingresa tu Google Client Secret: " CLIENT_SECRET

if [ -z "$CLIENT_SECRET" ]; then
    echo "❌ Error: Client Secret no puede estar vacío"
    exit 1
fi

echo ""
echo "🔄 Actualizando archivo .env.local..."

# Crear backup del archivo actual
cp .env.local .env.local.backup
echo "✅ Backup creado: .env.local.backup"

# Actualizar las variables
sed -i.tmp "s/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=$CLIENT_ID/" .env.local
sed -i.tmp "s/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$CLIENT_SECRET/" .env.local

# Limpiar archivo temporal
rm .env.local.tmp

echo "✅ Variables actualizadas en .env.local"
echo ""

# Verificar la configuración
echo "🔍 Verificando configuración..."
echo ""
echo "Client ID: $CLIENT_ID"
echo "Client Secret: ${CLIENT_SECRET:0:10}..." # Solo mostrar primeros 10 caracteres por seguridad
echo "Redirect URI: http://localhost:3000/api/auth/google/callback"
echo ""

echo "📋 PASO 3: Configurar Pantalla de Consentimiento"
echo ""
echo "1. 🎯 Ve a 'APIs y servicios' > 'Pantalla de consentimiento OAuth'"
echo "2. 📝 Configura:"
echo "   - Tipo de usuario: Externo"
echo "   - Nombre de la aplicación: Central de Creadores"
echo "   - Correo de soporte: Tu email"
echo "   - Dominio autorizado: localhost"
echo ""
echo "3. 🔗 Ve a 'Scopes' y agrega:"
echo "   - https://www.googleapis.com/auth/calendar"
echo "   - https://www.googleapis.com/auth/calendar.events"
echo ""

echo "🚀 PASO 4: Probar la Integración"
echo ""
echo "1. 🔄 Reinicia el servidor:"
echo "   npm run dev"
echo ""
echo "2. 🧪 Prueba la conexión:"
echo "   - Ve a: http://localhost:3000/configuraciones/conexiones"
echo "   - Haz clic en 'Conectar' en Google Calendar"
echo ""

echo "✅ ¡Configuración completada!"
echo ""
echo "📖 Si tienes problemas, consulta: configurar-google-calendar.md"
echo "🔄 Para restaurar configuración anterior: cp .env.local.backup .env.local"
