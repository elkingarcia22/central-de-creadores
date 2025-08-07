#!/bin/bash

echo "🎯 ABRIENDO APLICACIÓN SIMPLE Y FUNCIONAL"
echo "=========================================="
echo ""

# Obtener la ruta absoluta del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_PATH="$PROJECT_DIR/public/design-system-app/index.html"

echo "✅ Aplicación simple y funcional creada!"
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
echo "🎯 APLICACIÓN SIMPLE Y FUNCIONAL:"
echo "   • ✅ Todo en un solo archivo HTML"
echo "   • ✅ CSS integrado"
echo "   • ✅ JavaScript simple"
echo "   • ✅ Comparación lado a lado"
echo "   • ✅ Navegación funcionando"
echo ""
echo "📋 SECCIONES DISPONIBLES:"
echo "   • 🌈 Colores - Comparación de paleta"
echo "   • 🔘 Botones - Comparación de tipos"
echo "   • 📝 Inputs - Comparación de estados"
echo "   • 🃏 Cards - Comparación de estilos"
echo ""
echo "🎯 CÓMO USAR:"
echo "   1. Haz clic en cualquier botón del menú"
echo "   2. Verás automáticamente la comparación"
echo "   3. Lado izquierdo: ☀️ Modo Claro"
echo "   4. Lado derecho: 🌙 Modo Oscuro"
echo "   5. Compara visualmente cada elemento"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "   • ./scripts/open-simple-comparison.sh - Abrir aplicación simple"
echo "   • open public/design-system-app/index.html - Abrir directamente"
echo ""
echo "🎯 ¡Ahora debería funcionar perfectamente!"
