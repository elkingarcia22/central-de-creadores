#!/bin/bash

echo "🔧 Actualizando variables para OAuth 2.0..."

# Crear backup
cp .env.local .env.local.service-account-backup

# Actualizar variables OAuth
sed -i.tmp 's/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=TU_CLIENT_ID_AQUI/' .env.local
sed -i.tmp 's/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=TU_CLIENT_SECRET_AQUI/' .env.local

# Comentar variables de Service Account
sed -i.tmp 's/^GOOGLE_SERVICE_ACCOUNT_EMAIL/#GOOGLE_SERVICE_ACCOUNT_EMAIL/' .env.local
sed -i.tmp 's/^GOOGLE_PRIVATE_KEY/#GOOGLE_PRIVATE_KEY/' .env.local
sed -i.tmp 's/^GOOGLE_CALENDAR_ID/#GOOGLE_CALENDAR_ID/' .env.local

# Limpiar archivo temporal
rm .env.local.tmp

echo "✅ Variables actualizadas para OAuth 2.0"
echo ""
echo "📋 Próximos pasos:"
echo "1. Copia tu Client ID y Client Secret de Google Cloud Console"
echo "2. Reemplaza en .env.local:"
echo "   - TU_CLIENT_ID_AQUI → Tu Client ID real"
echo "   - TU_CLIENT_SECRET_AQUI → Tu Client Secret real"
echo ""
echo "🔄 Para restaurar Service Account: cp .env.local.service-account-backup .env.local"
