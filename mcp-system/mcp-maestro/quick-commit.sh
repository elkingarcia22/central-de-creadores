#!/bin/bash

# QUICK COMMIT - Script rápido para commit y reversión
# Uso: ./quick-commit.sh [comando] [opciones]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar ayuda
show_help() {
    echo -e "${BLUE}🤖 QUICK COMMIT - Sistema rápido de commit y reversión${NC}"
    echo ""
    echo "Comandos disponibles:"
    echo "  ${GREEN}commit${NC} [mensaje]     - Crear commit automático"
    echo "  ${GREEN}add${NC}                  - Agregar todos los cambios"
    echo "  ${GREEN}status${NC}               - Mostrar estado del repositorio"
    echo "  ${GREEN}revert${NC}               - Revertir al commit anterior"
    echo "  ${GREEN}history${NC} [número]     - Mostrar historial de commits"
    echo "  ${GREEN}backup${NC}               - Crear backup manual"
    echo "  ${GREEN}restore${NC} [hash]       - Restaurar a commit específico"
    echo "  ${GREEN}help${NC}                 - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  ./quick-commit.sh commit 'Mejoras en la interfaz'"
    echo "  ./quick-commit.sh revert"
    echo "  ./quick-commit.sh history 10"
}

# Función para mostrar estado
show_status() {
    echo -e "${BLUE}📋 Estado del repositorio:${NC}"
    git status --short
    echo ""
    echo -e "${BLUE}📊 Resumen:${NC}"
    git status --porcelain | wc -l | xargs echo "Cambios pendientes:"
}

# Función para agregar cambios
add_changes() {
    echo -e "${BLUE}➕ Agregando cambios...${NC}"
    git add .
    echo -e "${GREEN}✅ Cambios agregados${NC}"
}

# Función para crear commit
create_commit() {
    local message="$1"
    
    if [ -z "$message" ]; then
        message="🤖 Auto-commit: $(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"
    fi
    
    echo -e "${BLUE}📝 Creando commit...${NC}"
    echo -e "${YELLOW}Mensaje:${NC} $message"
    
    # Crear backup antes del commit
    ./quick-commit.sh backup
    
    # Agregar cambios
    git add .
    
    # Crear commit
    git commit -m "$message"
    
    # Push automático
    echo -e "${BLUE}🚀 Enviando a GitHub...${NC}"
    git push
    
    echo -e "${GREEN}✅ Commit creado y enviado exitosamente${NC}"
}

# Función para revertir
revert_changes() {
    echo -e "${YELLOW}⚠️ ¿Estás seguro de que quieres revertir al commit anterior? (y/N)${NC}"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🔄 Revertiendo al commit anterior...${NC}"
        
        # Crear backup antes de revertir
        ./quick-commit.sh backup
        
        # Obtener hash del commit anterior
        previous_hash=$(git rev-parse HEAD~1)
        echo -e "${YELLOW}Hash anterior:${NC} $previous_hash"
        
        # Revertir
        git reset --hard "$previous_hash"
        
        echo -e "${GREEN}✅ Revertido al commit anterior${NC}"
    else
        echo -e "${YELLOW}❌ Reversión cancelada${NC}"
    fi
}

# Función para mostrar historial
show_history() {
    local limit="${1:-10}"
    echo -e "${BLUE}📋 Historial de commits (últimos $limit):${NC}"
    git log --oneline -"$limit"
}

# Función para crear backup
create_backup() {
    echo -e "${BLUE}💾 Creando backup...${NC}"
    
    # Crear directorio de backups si no existe
    mkdir -p storage/backups
    
    # Generar nombre de archivo con timestamp
    timestamp=$(date -u +"%Y-%m-%dT%H-%M-%S.000Z")
    backup_file="storage/backups/backup-$timestamp.json"
    
    # Crear backup con información del commit actual
    cat > "$backup_file" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")",
  "commit_hash": "$(git rev-parse HEAD)",
  "branch": "$(git branch --show-current)",
  "status": "$(git status --porcelain | wc -l | xargs echo "cambios")",
  "files": [
$(git status --porcelain | sed 's/^/    "/' | sed 's/$/",/' | sed '$ s/,$//')
  ]
}
EOF
    
    echo -e "${GREEN}✅ Backup creado:${NC} $backup_file"
}

# Función para restaurar
restore_commit() {
    local hash="$1"
    
    if [ -z "$hash" ]; then
        echo -e "${RED}❌ Error: Debes especificar un hash de commit${NC}"
        echo "Uso: ./quick-commit.sh restore <hash>"
        exit 1
    fi
    
    echo -e "${YELLOW}⚠️ ¿Estás seguro de que quieres restaurar al commit $hash? (y/N)${NC}"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🔄 Restaurando al commit $hash...${NC}"
        
        # Crear backup antes de restaurar
        ./quick-commit.sh backup
        
        # Restaurar
        git reset --hard "$hash"
        
        echo -e "${GREEN}✅ Restaurado al commit $hash${NC}"
    else
        echo -e "${YELLOW}❌ Restauración cancelada${NC}"
    fi
}

# Función principal
main() {
    local command="$1"
    local option="$2"
    
    case "$command" in
        "help"|"-h"|"--help")
            show_help
            ;;
        "status")
            show_status
            ;;
        "add")
            add_changes
            ;;
        "commit")
            create_commit "$option"
            ;;
        "revert")
            revert_changes
            ;;
        "history")
            show_history "$option"
            ;;
        "backup")
            create_backup
            ;;
        "restore")
            restore_commit "$option"
            ;;
        "")
            show_help
            ;;
        *)
            echo -e "${RED}❌ Comando desconocido: $command${NC}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@"
