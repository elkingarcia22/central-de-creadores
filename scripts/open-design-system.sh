#!/bin/bash

echo "🎨 ABRIENDO SISTEMA DE DISEÑO VISUAL"
echo "====================================="
echo ""

# Obtener la ruta absoluta del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DESIGN_SYSTEM_PATH="$PROJECT_DIR/public/design-system/index.html"

echo "✅ Sistema de Diseño creado exitosamente!"
echo "🌐 Abriendo en el navegador..."
echo ""

# Intentar abrir en diferentes navegadores
if command -v open > /dev/null; then
    echo "🚀 Abriendo con comando 'open'..."
    open "$DESIGN_SYSTEM_PATH"
elif command -v xdg-open > /dev/null; then
    echo "🚀 Abriendo con comando 'xdg-open'..."
    xdg-open "$DESIGN_SYSTEM_PATH"
else
    echo "💡 Abre manualmente: $DESIGN_SYSTEM_PATH"
fi

echo ""
echo "📋 LO QUE PUEDES VER:"
echo "   • 🌈 Paleta completa de colores (17 colores)"
echo "   • 🎯 Colores semánticos (Primary, Success, Error, Warning, Info)"
echo "   • �� Escala de grises completa (50-900)"
echo "   • �� Lista de componentes (50+ componentes)"
echo "   • 📊 Estadísticas del sistema"
echo "   • 📋 Información detallada"
echo ""
echo "🎯 FUNCIONALIDADES:"
echo "   • Click en cualquier color para copiar el código hexadecimal"
echo "   • Diseño responsive (móvil, tablet, desktop)"
echo "   • Visualización completa del sistema"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "   • ./scripts/open-design-system.sh - Abrir sistema de diseño"
echo "   • open public/design-system/index.html - Abrir directamente"
echo ""
echo "🎨 ¡Disfruta explorando el sistema de diseño!"
