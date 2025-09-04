#!/bin/bash

# 🚀 SCRIPT DE RESTAURACIÓN SEGURA - GITHUB
# Permite restaurar rápidamente el proyecto a un estado seguro

echo "🔒 SCRIPT DE RESTAURACIÓN SEGURA ACTIVADO"
echo "=========================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}📋 COMANDOS DISPONIBLES:${NC}"
    echo ""
    echo -e "${GREEN}1. Ver estado actual:${NC}"
    echo "   ./restore-seguro.sh status"
    echo ""
    echo -e "${GREEN}2. Ver puntos de restauración:${NC}"
    echo "   ./restore-seguro.sh points"
    echo ""
    echo -e "${GREEN}3. Restaurar a un commit específico:${NC}"
    echo "   ./restore-seguro.sh restore <commit-hash>"
    echo ""
    echo -e "${GREEN}4. Restaurar a un tag de seguridad:${NC}"
    echo "   ./restore-seguro.sh tag <tag-name>"
    echo ""
    echo -e "${GREEN}5. Cambiar a rama de backup:${NC}"
    echo "   ./restore-seguro.sh backup"
    echo ""
    echo -e "${GREEN}6. Crear punto de seguridad:${NC}"
    echo "   ./restore-seguro.sh save"
    echo ""
    echo -e "${GREEN}7. Ver historial de cambios:${NC}"
    echo "   ./restore-seguro.sh history"
    echo ""
    echo -e "${YELLOW}⚠️  ADVERTENCIA: La restauración puede perder cambios no guardados${NC}"
}

# Función para mostrar estado actual
show_status() {
    echo -e "${BLUE}📊 ESTADO ACTUAL DEL PROYECTO:${NC}"
    echo "=========================================="
    git status --short
    echo ""
    echo -e "${BLUE}📍 RAMA ACTUAL:${NC}"
    git branch --show-current
    echo ""
    echo -e "${BLUE}🔄 ÚLTIMO COMMIT:${NC}"
    git log --oneline -1
}

# Función para mostrar puntos de restauración
show_points() {
    echo -e "${BLUE}🔒 PUNTOS DE RESTAURACIÓN DISPONIBLES:${NC}"
    echo "================================================"
    echo ""
    echo -e "${GREEN}📋 TAGS DE SEGURIDAD:${NC}"
    git tag -l | grep -E "(PUNTO-SEGURO|SECURE-POINT|SAFE-POINT)" | head -10
    echo ""
    echo -e "${GREEN}📋 COMMITS RECIENTES:${NC}"
    git log --oneline -10
    echo ""
    echo -e "${GREEN}📋 RAMAS DE BACKUP:${NC}"
    git branch -a | grep -E "(backup|develop)"
}

# Función para restaurar a un commit
restore_commit() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Error: Debes especificar un commit hash${NC}"
        echo "Uso: ./restore-seguro.sh restore <commit-hash>"
        exit 1
    fi
    
    echo -e "${YELLOW}⚠️  ADVERTENCIA: Esto restaurará el proyecto al commit $1${NC}"
    echo -e "${YELLOW}⚠️  Todos los cambios posteriores se perderán${NC}"
    echo ""
    read -p "¿Estás seguro? (s/N): " confirm
    
    if [[ $confirm == [sS] ]]; then
        echo -e "${BLUE}🔄 Restaurando al commit $1...${NC}"
        git reset --hard "$1"
        echo -e "${GREEN}✅ Restauración completada${NC}"
    else
        echo -e "${YELLOW}❌ Restauración cancelada${NC}"
    fi
}

# Función para restaurar a un tag
restore_tag() {
    if [ -z "$1" ]; then
        echo -e "${RED}❌ Error: Debes especificar un tag${NC}"
        echo "Uso: ./restore-seguro.sh tag <tag-name>"
        exit 1
    fi
    
    echo -e "${YELLOW}⚠️  ADVERTENCIA: Esto restaurará el proyecto al tag $1${NC}"
    echo -e "${YELLOW}⚠️  Todos los cambios posteriores se perderán${NC}"
    echo ""
    read -p "¿Estás seguro? (s/N): " confirm
    
    if [[ $confirm == [sS] ]]; then
        echo -e "${BLUE}🔄 Restaurando al tag $1...${NC}"
        git checkout "$1"
        echo -e "${GREEN}✅ Restauración al tag completada${NC}"
        echo -e "${YELLOW}💡 Para volver a main: git checkout main${NC}"
    else
        echo -e "${YELLOW}❌ Restauración cancelada${NC}"
    fi
}

# Función para cambiar a rama de backup
switch_backup() {
    echo -e "${BLUE}🔄 Cambiando a rama de backup...${NC}"
    git checkout backup/estado-estable
    echo -e "${GREEN}✅ Cambio a rama de backup completado${NC}"
    echo -e "${YELLOW}💡 Para volver a main: git checkout main${NC}"
}

# Función para crear punto de seguridad
create_save_point() {
    echo -e "${BLUE}🔒 Creando punto de seguridad...${NC}"
    timestamp=$(date +%Y%m%d-%H%M%S)
    tag_name="PUNTO-SEGURO-$(date +%Y%m%d-%H%M%S)"
    
    git add .
    git commit -m "🔒 Punto de seguridad automático: $timestamp"
    git tag "$tag_name"
    
    echo -e "${GREEN}✅ Punto de seguridad creado: $tag_name${NC}"
    echo -e "${BLUE}💡 Para restaurar: ./restore-seguro.sh tag $tag_name${NC}"
}

# Función para mostrar historial
show_history() {
    echo -e "${BLUE}📚 HISTORIAL DE CAMBIOS:${NC}"
    echo "================================"
    git log --oneline --graph --decorate -20
}

# Función principal
main() {
    case "$1" in
        "status")
            show_status
            ;;
        "points")
            show_points
            ;;
        "restore")
            restore_commit "$2"
            ;;
        "tag")
            restore_tag "$2"
            ;;
        "backup")
            switch_backup
            ;;
        "save")
            create_save_point
            ;;
        "history")
            show_history
            ;;
        "help"|"--help"|"-h"|"")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Comando no reconocido: $1${NC}"
            echo "Usa './restore-seguro.sh help' para ver comandos disponibles"
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@"
