#!/bin/bash

# MCP Utils - Utilidades adicionales para MCP Maestro
# ==================================================

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con colores
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}🔧 $1${NC}"
}

# Función para crear backup automático
create_backup() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_dir="backups/mcp_${timestamp}"
    
    log_step "Creando backup automático..."
    mkdir -p "$backup_dir"
    
    # Copiar archivos importantes
    cp -r src/ "$backup_dir/"
    cp package.json "$backup_dir/"
    cp next.config.js "$backup_dir/" 2>/dev/null || true
    cp tsconfig.json "$backup_dir/" 2>/dev/null || true
    
    log_success "Backup creado en: $backup_dir"
}

# Función para verificar archivos importantes
check_important_files() {
    log_step "Verificando archivos importantes..."
    
    local important_files=(
        "src/pages/api/empresas/[id].ts"
        "package.json"
        "next.config.js"
        "tsconfig.json"
    )
    
    for file in "${important_files[@]}"; do
        if [ -f "$file" ]; then
            log_success "✓ $file"
        else
            log_warning "⚠ $file (no encontrado)"
        fi
    done
}

# Función para ejecutar verificaciones antes del commit
pre_commit_checks() {
    log_step "Ejecutando verificaciones pre-commit..."
    
    # Verificar si hay errores de linting
    if command -v npm &> /dev/null; then
        log_info "Ejecutando linting..."
        if npm run lint --silent; then
            log_success "Linting pasado"
        else
            log_error "Errores de linting encontrados"
            return 1
        fi
    fi
    
    # Verificar tipos TypeScript
    if command -v npm &> /dev/null; then
        log_info "Verificando tipos TypeScript..."
        if npm run type-check --silent 2>/dev/null; then
            log_success "Verificación de tipos exitosa"
        else
            log_warning "Advertencias de tipos encontradas"
        fi
    fi
    
    return 0
}

# Función para crear rama de feature
create_feature_branch() {
    local feature_name="$1"
    if [ -z "$feature_name" ]; then
        log_error "Debes proporcionar un nombre para la feature"
        return 1
    fi
    
    # Limpiar nombre de feature
    local clean_name=$(echo "$feature_name" | tr ' ' '_' | tr '[:upper:]' '[:lower:]')
    local branch_name="feature/$clean_name"
    
    log_step "Creando rama de feature: $branch_name"
    
    # Verificar si ya existe la rama
    if git show-ref --verify --quiet refs/heads/"$branch_name"; then
        log_warning "La rama $branch_name ya existe"
        read -p "¿Quieres cambiar a esa rama? (y/N): " response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            git checkout "$branch_name"
            log_success "Cambiado a rama $branch_name"
        fi
    else
        git checkout -b "$branch_name"
        log_success "Rama $branch_name creada y activada"
    fi
}

# Función para hacer commit inteligente
smart_commit() {
    local message="$1"
    local type="$2"
    
    if [ -z "$message" ]; then
        log_error "Debes proporcionar un mensaje de commit"
        return 1
    fi
    
    # Crear backup antes del commit
    create_backup
    
    # Ejecutar verificaciones pre-commit
    if ! pre_commit_checks; then
        log_error "Verificaciones pre-commit fallaron. Commit cancelado."
        return 1
    fi
    
    # Formatear mensaje según tipo
    local formatted_message
    case $type in
        "feat")
            formatted_message="feat: $message"
            ;;
        "fix")
            formatted_message="fix: $message"
            ;;
        "docs")
            formatted_message="docs: $message"
            ;;
        "style")
            formatted_message="style: $message"
            ;;
        "refactor")
            formatted_message="refactor: $message"
            ;;
        "test")
            formatted_message="test: $message"
            ;;
        "chore")
            formatted_message="chore: $message"
            ;;
        *)
            formatted_message="$message"
            ;;
    esac
    
    log_step "Haciendo commit: $formatted_message"
    
    git add .
    git commit -m "$formatted_message"
    
    log_success "Commit realizado exitosamente"
}

# Función para mostrar estadísticas del repositorio
show_repo_stats() {
    log_step "Estadísticas del repositorio:"
    
    echo "📊 Información general:"
    echo "  - Rama actual: $(git branch --show-current)"
    echo "  - Total de commits: $(git rev-list --count HEAD)"
    echo "  - Último commit: $(git log -1 --format='%h - %s (%cr)')"
    echo ""
    
    echo "📁 Archivos modificados recientemente:"
    git log --name-only --pretty=format: --since="1 week ago" | sort | uniq -c | sort -nr | head -10
    echo ""
    
    echo "👥 Contribuidores recientes:"
    git shortlog -sn --since="1 month ago" | head -5
}

# Función para limpiar archivos temporales
cleanup_temp_files() {
    log_step "Limpiando archivos temporales..."
    
    # Eliminar archivos .DS_Store
    find . -name ".DS_Store" -delete 2>/dev/null
    
    # Eliminar archivos de backup antiguos (más de 7 días)
    if [ -d "backups" ]; then
        find backups -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null
    fi
    
    # Limpiar node_modules si es necesario
    if [ -d "node_modules" ] && [ ! -f "package-lock.json" ]; then
        log_warning "node_modules encontrado sin package-lock.json"
        read -p "¿Quieres eliminar node_modules? (y/N): " response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            rm -rf node_modules
            log_success "node_modules eliminado"
        fi
    fi
    
    log_success "Limpieza completada"
}

# Función para mostrar ayuda
show_help() {
    echo "🔧 MCP Utils - Comandos disponibles:"
    echo "====================================="
    echo "backup              - Crear backup automático"
    echo "check-files         - Verificar archivos importantes"
    echo "pre-commit          - Ejecutar verificaciones pre-commit"
    echo "feature <nombre>    - Crear rama de feature"
    echo "commit <msg> [tipo] - Commit inteligente"
    echo "stats               - Mostrar estadísticas del repo"
    echo "cleanup             - Limpiar archivos temporales"
    echo "help                - Mostrar esta ayuda"
    echo ""
    echo "Tipos de commit: feat, fix, docs, style, refactor, test, chore"
}

# Función principal
main() {
    local command="$1"
    local arg1="$2"
    local arg2="$3"
    
    case $command in
        "backup")
            create_backup
            ;;
        "check-files")
            check_important_files
            ;;
        "pre-commit")
            pre_commit_checks
            ;;
        "feature")
            create_feature_branch "$arg1"
            ;;
        "commit")
            smart_commit "$arg1" "$arg2"
            ;;
        "stats")
            show_repo_stats
            ;;
        "cleanup")
            cleanup_temp_files
            ;;
        "help"|"")
            show_help
            ;;
        *)
            log_error "Comando desconocido: $command"
            show_help
            exit 1
            ;;
    esac
}

# Ejecutar función principal con argumentos
main "$@"
