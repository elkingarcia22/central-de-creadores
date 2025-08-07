#!/bin/bash

echo "🎨 ABRIENDO STORYBOOK - SISTEMA DE DISEÑO VISUAL"
echo "=================================================="
echo ""

# Verificar si Storybook está funcionando
if curl -s http://localhost:6006 > /dev/null 2>&1; then
    echo "✅ Storybook está funcionando!"
    echo "🌐 Abriendo en el navegador..."
    echo ""
    
    # Intentar abrir en diferentes navegadores
    if command -v open > /dev/null; then
        echo "🚀 Abriendo con comando 'open'..."
        open http://localhost:6006
    elif command -v xdg-open > /dev/null; then
        echo "🚀 Abriendo con comando 'xdg-open'..."
        xdg-open http://localhost:6006
    else
        echo "💡 Abre manualmente: http://localhost:6006"
    fi
    
    echo ""
    echo "📋 RUTAS IMPORTANTES:"
    echo "   • Design System/Color System - Sistema de colores"
    echo "   • UI/SimpleButton - Componente botón"
    echo ""
    echo "🎯 SI LA PÁGINA ESTÁ EN BLANCO:"
    echo "   1. Espera 30-60 segundos más"
    echo "   2. Refresca la página (F5 o Cmd+R)"
    echo "   3. Verifica la consola del navegador (F12)"
    echo "   4. Intenta con otro navegador"
    echo ""
    echo "🔧 COMANDOS ÚTILES:"
    echo "   • npx storybook dev -p 6006"
    echo "   • node scripts/test-storybook.js"
    echo "   • pkill -f storybook (para detener)"
    
else
    echo "❌ Storybook no está funcionando"
    echo "🚀 Iniciando Storybook..."
    echo ""
    echo "⏳ Esto puede tomar 30-60 segundos..."
    echo "💡 Abre http://localhost:6006 cuando veas el mensaje de éxito"
    
    # Iniciar Storybook en segundo plano
    npx storybook dev -p 6006 &
    
    echo ""
    echo "🔄 Esperando que Storybook inicie..."
    sleep 30
    
    echo "🌐 Intentando abrir en el navegador..."
    if command -v open > /dev/null; then
        open http://localhost:6006
    elif command -v xdg-open > /dev/null; then
        xdg-open http://localhost:6006
    else
        echo "💡 Abre manualmente: http://localhost:6006"
    fi
fi

echo ""
echo "�� ¡Disfruta explorando el sistema de diseño!"
