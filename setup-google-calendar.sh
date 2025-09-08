#!/bin/bash

# ====================================
# SCRIPT DE CONFIGURACIÓN GOOGLE CALENDAR
# ====================================

echo "🔧 Configurando Google Calendar para Central de Creadores..."
echo ""

# Verificar si existe .env.local
if [ ! -f ".env.local" ]; then
    echo "📝 Creando archivo .env.local..."
    cat > .env.local << 'EOF'
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
NEXTAUTH_SECRET=central-de-creadores-secret-key
EOF
    echo "✅ Archivo .env.local creado"
else
    echo "⚠️  Archivo .env.local ya existe"
fi

echo ""
echo "📋 INSTRUCCIONES PARA COMPLETAR LA CONFIGURACIÓN:"
echo ""
echo "1. 🌐 Ve a Google Cloud Console:"
echo "   https://console.cloud.google.com/"
echo ""
echo "2. 📁 Crea un nuevo proyecto o selecciona uno existente"
echo ""
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
echo "5. 📝 Copia las credenciales:"
echo "   - Copia el Client ID y Client Secret"
echo "   - Reemplaza en .env.local:"
echo "     * TU_CLIENT_ID_AQUI → Tu Client ID"
echo "     * TU_CLIENT_SECRET_AQUI → Tu Client Secret"
echo ""
echo "6. 🎯 Configura pantalla de consentimiento:"
echo "   - Ve a 'APIs y servicios' > 'Pantalla de consentimiento OAuth'"
echo "   - Configura tipo de usuario: Externo"
echo "   - Agrega scopes:"
echo "     * https://www.googleapis.com/auth/calendar"
echo "     * https://www.googleapis.com/auth/calendar.events"
echo ""
echo "7. 🔄 Reinicia el servidor:"
echo "   npm run dev"
echo ""
echo "8. 🧪 Prueba la integración:"
echo "   - Ve a /configuraciones/conexiones"
echo "   - Haz clic en 'Conectar' en Google Calendar"
echo ""
echo "📖 Para más detalles, consulta: GOOGLE_CALENDAR_SETUP.md"
echo ""
echo "✅ ¡Configuración inicial completada!"
