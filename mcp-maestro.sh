#!/bin/bash

# MCP Maestro - Script para cambios controlados con Git
# ===================================================

echo "🚀 MCP Maestro activado"
echo "📁 Directorio actual: $(pwd)"
echo "🌿 Rama actual: $(git branch --show-current)"
echo ""

# Función para mostrar el estado actual
show_status() {
    echo "📊 Estado actual del repositorio:"
    git status --short
    echo ""
}

# Función para hacer commit de cambios
commit_changes() {
    local message="$1"
    if [ -z "$message" ]; then
        echo "❌ Error: Debes proporcionar un mensaje de commit"
        return 1
    fi
    
    echo "📝 Agregando cambios..."
    git add .
    
    echo "💾 Haciendo commit con mensaje: '$message'"
    git commit -m "$message"
    
    echo "✅ Commit realizado exitosamente"
    echo ""
}

# Función para deshacer cambios
undo_changes() {
    echo "⚠️  ¿Estás seguro de que quieres deshacer todos los cambios? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🔄 Deshaciendo cambios..."
        git checkout -- .
        echo "✅ Cambios deshechos"
    else
        echo "❌ Operación cancelada"
    fi
    echo ""
}

# Función para mostrar historial reciente
show_history() {
    echo "📜 Historial reciente de commits:"
    git log --oneline -10
    echo ""
}

# Función para hacer push
push_changes() {
    echo "🚀 Subiendo cambios al repositorio remoto..."
    git push
    echo "✅ Cambios subidos exitosamente"
    echo ""
}

# Función para crear una nueva rama
create_branch() {
    local branch_name="$1"
    if [ -z "$branch_name" ]; then
        echo "❌ Error: Debes proporcionar un nombre para la rama"
        return 1
    fi
    
    echo "🌿 Creando nueva rama: $branch_name"
    git checkout -b "$branch_name"
    echo "✅ Rama '$branch_name' creada y activada"
    echo ""
}

# Función para cambiar de rama
switch_branch() {
    local branch_name="$1"
    if [ -z "$branch_name" ]; then
        echo "❌ Error: Debes proporcionar el nombre de la rama"
        return 1
    fi
    
    echo "🔄 Cambiando a rama: $branch_name"
    git checkout "$branch_name"
    echo "✅ Cambiado a rama '$branch_name'"
    echo ""
}

# Función para mostrar menú principal
show_menu() {
    echo "🎯 MCP Maestro - Menú Principal"
    echo "================================"
    echo "1. 📊 Mostrar estado actual"
    echo "2. 📝 Hacer commit de cambios"
    echo "3. 🔄 Deshacer cambios"
    echo "4. 📜 Mostrar historial"
    echo "5. 🚀 Hacer push"
    echo "6. 🌿 Crear nueva rama"
    echo "7. 🔄 Cambiar de rama"
    echo "8. ❌ Salir"
    echo ""
}

# Función principal
main() {
    while true; do
        show_menu
        read -p "Selecciona una opción (1-8): " choice
        
        case $choice in
            1)
                show_status
                ;;
            2)
                read -p "📝 Ingresa el mensaje del commit: " commit_message
                commit_changes "$commit_message"
                ;;
            3)
                undo_changes
                ;;
            4)
                show_history
                ;;
            5)
                push_changes
                ;;
            6)
                read -p "🌿 Ingresa el nombre de la nueva rama: " new_branch
                create_branch "$new_branch"
                ;;
            7)
                read -p "🔄 Ingresa el nombre de la rama: " branch_name
                switch_branch "$branch_name"
                ;;
            8)
                echo "👋 ¡Hasta luego!"
                exit 0
                ;;
            *)
                echo "❌ Opción inválida. Por favor selecciona 1-8."
                echo ""
                ;;
        esac
        
        read -p "Presiona Enter para continuar..."
        clear
    done
}

# Verificar si estamos en un repositorio git
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: No estás en un repositorio git"
    exit 1
fi

# Ejecutar función principal
main
