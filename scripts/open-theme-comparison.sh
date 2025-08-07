#!/bin/bash

echo "🌙 ABRIENDO APLICACIÓN CON COMPARACIÓN DE TEMAS"
echo "==============================================="
echo ""

# Obtener la ruta absoluta del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_PATH="$PROJECT_DIR/public/design-system-app/index.html"

echo "✅ Aplicación con comparación de temas creada exitosamente!"
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
echo "🌙 NUEVAS FUNCIONALIDADES DE TEMA:"
echo "   • ☀️/🌙 Toggle de tema en el header"
echo "   • 📊 Comparación lado a lado"
echo "   • 🎨 Colores en modo claro y oscuro"
echo "   • 🧩 Componentes en ambos temas"
echo "   • 📝 Tipografía en ambos temas"
echo ""
echo "📋 CÓMO USAR:"
echo "   1. Ve a la sección 'Colores'"
echo "   2. Verás la comparación automática"
echo "   3. Usa el toggle ☀️/🌙 para cambiar tema"
echo "   4. Compara cómo se ven los elementos"
echo "   5. Prueba en otras secciones: Botones, Inputs, Cards"
echo ""
echo "🎯 SECCIONES CON COMPARACIÓN:"
echo "   • 🌈 Colores - Comparación de paleta"
echo "   • 🔘 Botones - Comparación de variantes"
echo "   • 📝 Inputs - Comparación de estados"
echo "   • 🃏 Cards - Comparación de estilos"
echo "   • 📝 Tipografía - Comparación de texto"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "   • ./scripts/open-theme-comparison.sh - Abrir con temas"
echo "   • ./scripts/open-design-system-app.sh - Abrir aplicación completa"
echo "   • open public/design-system-app/index.html - Abrir directamente"
echo ""
echo "🎨 ¡Disfruta comparando los temas!"
