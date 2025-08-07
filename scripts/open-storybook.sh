#!/bin/bash

echo "🎨 ABRIENDO STORYBOOK - SISTEMA DE DISEÑO VISUAL"
echo "=================================================="
echo ""

# Verificar si Storybook está ejecutándose
if curl -s http://localhost:6006 > /dev/null 2>&1; then
    echo "✅ Storybook está funcionando!"
    echo "🌐 Abriendo en el navegador..."
    echo ""
    echo "📋 RUTAS IMPORTANTES:"
    echo "   • Design System/Overview - Vista completa del sistema"
    echo "   • Design System/Component Library - Biblioteca de componentes"
    echo "   • Design System/Colors - Paleta de colores"
    echo ""
    echo "🎯 FUNCIONALIDADES:"
    echo "   • Ver todos los colores del sistema"
    echo "   • Explorar componentes disponibles"
    echo "   • Probar en diferentes dispositivos"
    echo "   • Documentación interactiva"
    echo ""
    
    # Abrir en el navegador
    if command -v open > /dev/null; then
        open http://localhost:6006
    elif command -v xdg-open > /dev/null; then
        xdg-open http://localhost:6006
    else
        echo "💡 Abre manualmente: http://localhost:6006"
    fi
else
    echo "❌ Storybook no está ejecutándose"
    echo "🚀 Iniciando Storybook..."
    echo ""
    echo "💡 Comandos útiles:"
    echo "   • npm run storybook"
    echo "   • npx storybook dev -p 6006"
    echo ""
    echo "⏳ Espera unos segundos y vuelve a ejecutar este script"
    
    # Intentar iniciar Storybook
    npx storybook dev -p 6006 &
    
    echo ""
    echo "🔄 Storybook se está iniciando..."
    echo "📱 Abre http://localhost:6006 en tu navegador"
fi

echo ""
echo "🎨 ¡Disfruta explorando el sistema de diseño!"
