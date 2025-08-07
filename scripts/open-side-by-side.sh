#!/bin/bash

echo "🔄 ABRIENDO APLICACIÓN CON COMPARACIÓN LADO A LADO"
echo "=================================================="
echo ""

# Obtener la ruta absoluta del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_PATH="$PROJECT_DIR/public/design-system-app/index.html"

echo "✅ Aplicación con comparación lado a lado creada exitosamente!"
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
echo "🔄 COMPARACIÓN LADO A LADO:"
echo "   • ☀️ Modo Claro - Izquierda"
echo "   • 🌙 Modo Oscuro - Derecha"
echo "   • 📊 Vista simultánea"
echo "   • 🎨 Comparación visual directa"
echo ""
echo "📋 SECCIONES CON COMPARACIÓN:"
echo "   • 🌈 Colores - Paleta en ambos temas"
echo "   • 🔘 Botones - Variantes en ambos temas"
echo "   • 📝 Inputs - Estados en ambos temas"
echo "   • 🃏 Cards - Estilos en ambos temas"
echo ""
echo "🎯 CÓMO USAR:"
echo "   1. Ve a la sección 'Botones'"
echo "   2. Verás automáticamente la comparación"
echo "   3. Modo claro a la izquierda"
echo "   4. Modo oscuro a la derecha"
echo "   5. Compara visualmente cada elemento"
echo "   6. Prueba en otras secciones"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "   • ./scripts/open-side-by-side.sh - Abrir comparación lado a lado"
echo "   • ./scripts/open-theme-comparison.sh - Abrir con temas"
echo "   • ./scripts/open-design-system-app.sh - Abrir aplicación completa"
echo "   • open public/design-system-app/index.html - Abrir directamente"
echo ""
echo "🔄 ¡Disfruta comparando los elementos lado a lado!"
