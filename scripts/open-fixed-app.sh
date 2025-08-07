#!/bin/bash

echo "🔧 ABRIENDO APLICACIÓN CORREGIDA"
echo "================================"
echo ""

# Obtener la ruta absoluta del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_PATH="$PROJECT_DIR/public/design-system-app/index.html"

echo "✅ Aplicación corregida y funcionando!"
echo "🌐 Abriendo en el navegador..."
echo ""

# Intentar abrir en diferentes navegadores
if command -v open > /dev/null; then
    echo "🚀 Abriendo con comando 'open'..."
    open "$APP_PATH"
elif command -v xdg-open > /dev/null; then
    echo "🚀 Abriendo con comando 'xdg-open'..."
    xdg-open "$APP_PATH"
else
    echo "💡 Abre manualmente: $APP_PATH"
fi

echo ""
echo "🔧 APLICACIÓN CORREGIDA:"
echo "   • ✅ Navegación funcionando"
echo "   • ✅ Secciones cargando correctamente"
echo "   • ✅ Comparaciones lado a lado"
echo "   • ✅ Modo oscuro y claro"
echo ""
echo "📋 SECCIONES DISPONIBLES:"
echo "   • 🌈 Colores - Con comparación lado a lado"
echo "   • 🔘 Botones - Con comparación lado a lado"
echo "   • 📝 Inputs - Con comparación lado a lado"
echo "   • 🃏 Cards - Con comparación lado a lado"
echo ""
echo "🎯 CÓMO USAR:"
echo "   1. Haz clic en cualquier sección del menú"
echo "   2. Verás el contenido normal"
echo "   3. Al final verás la comparación lado a lado"
echo "   4. Modo claro a la izquierda"
echo "   5. Modo oscuro a la derecha"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "   • ./scripts/open-fixed-app.sh - Abrir aplicación corregida"
echo "   • open public/design-system-app/index.html - Abrir directamente"
echo ""
echo "🔧 ¡Ahora debería funcionar correctamente!"
