#!/bin/bash

echo "🧩 ABRIENDO COMPONENTES INTERACTIVOS"
echo "===================================="
echo ""

# Obtener la ruta absoluta del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPONENTS_PATH="$PROJECT_DIR/public/design-system/components.html"

echo "✅ Componentes Interactivos creados exitosamente!"
echo "🌐 Abriendo en el navegador..."
echo ""

# Intentar abrir en diferentes navegadores
if command -v open > /dev/null; then
    echo "🚀 Abriendo con comando 'open'..."
    open "$COMPONENTS_PATH"
elif command -v xdg-open > /dev/null; then
    echo "🚀 Abriendo con comando 'xdg-open'..."
    xdg-open "$COMPONENTS_PATH"
else
    echo "💡 Abre manualmente: $COMPONENTS_PATH"
fi

echo ""
echo "📋 LO QUE PUEDES PROBAR:"
echo "   • 🔘 Botones (diferentes variantes y tamaños)"
echo "   • 📝 Inputs (estados y validación)"
echo "   • 🃏 Cards (con acciones interactivas)"
echo "   • 🏷️ Badges (click para efectos)"
echo "   • ⚠️ Alertas (generación dinámica)"
echo "   • 📊 Barras de progreso (control interactivo)"
echo "   • 🔘 Switches (toggle switches)"
echo "   • 🪟 Modal (abrir/cerrar)"
echo ""
echo "🎯 FUNCIONALIDADES INTERACTIVAS:"
echo "   • Click en botones para ver alertas"
echo "   • Escribe en inputs para ver cambios en tiempo real"
echo "   • Controla barras de progreso con el slider"
echo "   • Toggle switches para cambiar estados"
echo "   • Abre modales con diferentes contenidos"
echo "   • Cambia temas de color"
echo "   • Muestra/oculta secciones"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "   • ./scripts/open-components.sh - Abrir componentes interactivos"
echo "   • ./scripts/open-design-system.sh - Abrir sistema de colores"
echo "   • open public/design-system/components.html - Abrir directamente"
echo ""
echo "🎨 ¡Disfruta probando los componentes!"
