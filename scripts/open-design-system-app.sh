#!/bin/bash

echo "🎨 ABRIENDO APLICACIÓN COMPLETA DEL SISTEMA DE DISEÑO"
echo "====================================================="
echo ""

# Obtener la ruta absoluta del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_PATH="$PROJECT_DIR/public/design-system-app/index.html"

echo "✅ Aplicación del Sistema de Diseño creada exitosamente!"
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
echo "📋 SECCIONES DISPONIBLES:"
echo "   • 🌈 Colores - Paleta completa con copia al portapapeles"
echo "   • 📝 Tipografía - Jerarquía y estilos de texto"
echo "   • 📏 Espaciado - Escala de espaciado consistente"
echo "   • 🌫️ Sombras - Sistema de sombras"
echo "   • 🔘 Botones - Variantes y tamaños"
echo "   • 📝 Inputs - Estados y validación"
echo "   • 🃏 Cards - Diferentes tipos"
echo "   • 🪟 Modales - Ventanas modales"
echo "   • ⚠️ Alertas - Notificaciones"
echo "   • 🏷️ Badges - Etiquetas"
echo "   • 📊 Progreso - Barras de progreso"
echo "   • 🔘 Switches - Toggle switches"
echo "   • 🎮 Playground - Área de experimentación"
echo "   • ⚙️ Generador - Crea componentes"
echo "   • 📤 Exportar - Exporta el sistema"
echo ""
echo "🎯 FUNCIONALIDADES:"
echo "   • Menú de navegación lateral"
echo "   • Copia de colores al portapapeles"
echo "   • Componentes interactivos"
echo "   • Generador de componentes"
echo "   • Exportación en múltiples formatos"
echo "   • Playground para experimentación"
echo "   • Diseño responsive"
echo "   • Temas claro/oscuro"
echo ""
echo "🔧 COMANDOS ÚTILES:"
echo "   • ./scripts/open-design-system-app.sh - Abrir aplicación completa"
echo "   • ./scripts/open-design-system.sh - Abrir solo colores"
echo "   • ./scripts/open-components.sh - Abrir solo componentes"
echo "   • open public/design-system-app/index.html - Abrir directamente"
echo ""
echo "🎨 ¡Disfruta explorando el sistema de diseño completo!"
