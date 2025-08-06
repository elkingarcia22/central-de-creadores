#!/bin/bash

# SCRIPT DE RESTAURACIÓN AUTOMÁTICA - CENTRAL DE CREADORES
# Fecha: 6 de Agosto, 2025
# Uso: ./restore_backup.sh [opcion]
# Opciones: full, files, check, emergency

set -e  # Detener en cualquier error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes coloreados
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✅ OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠️  WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌ ERROR]${NC} $1"
}

print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Verificar que estamos en el directorio correcto
check_directory() {
    if [ ! -f "package.json" ] || [ ! -d "src" ]; then
        print_error "Este script debe ejecutarse desde el directorio raíz del proyecto central-de-creadores"
        exit 1
    fi
    print_success "Directorio correcto detectado"
}

# Verificar que existen los archivos de backup
check_backup_files() {
    print_section "VERIFICANDO ARCHIVOS DE BACKUP"
    
    local missing_files=0
    local backup_files=(
        "BACKUP_ver_reclutamiento_ESTABLE.tsx"
        "BACKUP_AgregarParticipanteModal_ESTABLE.tsx"
        "BACKUP_AsignarAgendamientoModal_ESTABLE.tsx"
        "BACKUP_actualizar_estados_ESTABLE.ts"
        "BACKUP_participantes_reclutamiento_ESTABLE.ts"
    )
    
    for file in "${backup_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Backup encontrado: $file"
        else
            print_error "Backup faltante: $file"
            ((missing_files++))
        fi
    done
    
    if [ $missing_files -gt 0 ]; then
        print_error "Faltan $missing_files archivos de backup críticos"
        return 1
    fi
    
    print_success "Todos los archivos de backup están disponibles"
    return 0
}

# Crear backup de archivos actuales antes de restaurar
backup_current_files() {
    print_section "CREANDO BACKUP DE ARCHIVOS ACTUALES"
    
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_dir="backup_before_restore_${timestamp}"
    
    mkdir -p "$backup_dir"
    
    # Backup de archivos que vamos a restaurar
    local files_to_backup=(
        "src/pages/reclutamiento/ver/[id].tsx:backup_current_ver_reclutamiento.tsx"
        "src/components/ui/AgregarParticipanteModal.tsx:backup_current_AgregarParticipanteModal.tsx"
        "src/components/ui/AsignarAgendamientoModal.tsx:backup_current_AsignarAgendamientoModal.tsx"
        "src/pages/api/actualizar-estados-reclutamiento.ts:backup_current_actualizar_estados.ts"
        "src/pages/api/participantes-reclutamiento.ts:backup_current_participantes_reclutamiento.ts"
    )
    
    for item in "${files_to_backup[@]}"; do
        local source=$(echo "$item" | cut -d':' -f1)
        local target=$(echo "$item" | cut -d':' -f2)
        
        if [ -f "$source" ]; then
            cp "$source" "$backup_dir/$target"
            print_success "Backup creado: $source -> $backup_dir/$target"
        else
            print_warning "Archivo no encontrado para backup: $source"
        fi
    done
    
    echo "$backup_dir" > .last_backup_dir
    print_success "Backup de archivos actuales completado en: $backup_dir"
}

# Restaurar archivos desde backup
restore_files() {
    print_section "RESTAURANDO ARCHIVOS DESDE BACKUP"
    
    local restore_map=(
        "BACKUP_ver_reclutamiento_ESTABLE.tsx:src/pages/reclutamiento/ver/[id].tsx"
        "BACKUP_AgregarParticipanteModal_ESTABLE.tsx:src/components/ui/AgregarParticipanteModal.tsx"
        "BACKUP_AsignarAgendamientoModal_ESTABLE.tsx:src/components/ui/AsignarAgendamientoModal.tsx"
        "BACKUP_actualizar_estados_ESTABLE.ts:src/pages/api/actualizar-estados-reclutamiento.ts"
        "BACKUP_participantes_reclutamiento_ESTABLE.ts:src/pages/api/participantes-reclutamiento.ts"
    )
    
    for item in "${restore_map[@]}"; do
        local source=$(echo "$item" | cut -d':' -f1)
        local target=$(echo "$item" | cut -d':' -f2)
        
        if [ -f "$source" ]; then
            cp "$source" "$target"
            print_success "Restaurado: $source -> $target"
        else
            print_error "Archivo de backup no encontrado: $source"
            return 1
        fi
    done
    
    print_success "Todos los archivos críticos han sido restaurados"
}

# Reiniciar servidor de desarrollo
restart_server() {
    print_section "REINICIANDO SERVIDOR DE DESARROLLO"
    
    # Matar procesos existentes
    print_status "Deteniendo procesos Node.js existentes..."
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "node.*next" 2>/dev/null || true
    sleep 2
    
    # Limpiar cache
    print_status "Limpiando cache..."
    rm -rf .next/ 2>/dev/null || true
    
    # Reinstalar dependencias si es necesario
    if [ "$1" = "full" ]; then
        print_status "Reinstalando dependencias..."
        rm -rf node_modules/ 2>/dev/null || true
        npm install
    fi
    
    # Iniciar servidor en background
    print_status "Iniciando servidor de desarrollo..."
    npm run dev > server.log 2>&1 &
    local server_pid=$!
    
    echo $server_pid > .server_pid
    print_success "Servidor iniciado con PID: $server_pid"
    
    # Esperar a que el servidor esté listo
    print_status "Esperando a que el servidor esté listo..."
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "http://localhost:3000" > /dev/null 2>&1; then
            print_success "Servidor responde correctamente"
            return 0
        fi
        
        sleep 2
        ((attempt++))
        echo -n "."
    done
    
    print_error "El servidor no respondió después de $max_attempts intentos"
    return 1
}

# Verificar funcionamiento del sistema restaurado
verify_system() {
    print_section "VERIFICANDO FUNCIONAMIENTO DEL SISTEMA"
    
    local tests_passed=0
    local total_tests=5
    
    # Test 1: Verificar página principal
    print_status "Test 1/5: Verificando página de reclutamiento..."
    if curl -s "http://localhost:3000/reclutamiento/ver/5a832297-4cca-4bad-abe6-3aad99b8b5f3" > /dev/null; then
        print_success "✅ Página de reclutamiento accesible"
        ((tests_passed++))
    else
        print_error "❌ Página de reclutamiento no accesible"
    fi
    
    # Test 2: Verificar API de participantes
    print_status "Test 2/5: Verificando API de participantes..."
    local participantes_count=$(curl -s "http://localhost:3000/api/participantes-reclutamiento?investigacion_id=5a832297-4cca-4bad-abe6-3aad99b8b5f3" 2>/dev/null | jq '.participantes | length' 2>/dev/null || echo "0")
    if [ "$participantes_count" -gt 0 ] 2>/dev/null; then
        print_success "✅ API participantes funcionando ($participantes_count participantes)"
        ((tests_passed++))
    else
        print_error "❌ API participantes con problemas"
    fi
    
    # Test 3: Verificar API de métricas
    print_status "Test 3/5: Verificando API de métricas..."
    if curl -s "http://localhost:3000/api/metricas-reclutamientos" | jq '.investigaciones' > /dev/null 2>&1; then
        print_success "✅ API métricas funcionando"
        ((tests_passed++))
    else
        print_error "❌ API métricas con problemas"
    fi
    
    # Test 4: Verificar archivos críticos
    print_status "Test 4/5: Verificando archivos críticos..."
    local critical_files=(
        "src/pages/reclutamiento/ver/[id].tsx"
        "src/components/ui/AgregarParticipanteModal.tsx"
        "src/components/ui/AsignarAgendamientoModal.tsx"
        "src/pages/api/actualizar-estados-reclutamiento.ts"
        "src/pages/api/participantes-reclutamiento.ts"
    )
    
    local files_ok=0
    for file in "${critical_files[@]}"; do
        if [ -f "$file" ]; then
            ((files_ok++))
        fi
    done
    
    if [ $files_ok -eq 5 ]; then
        print_success "✅ Todos los archivos críticos presentes (5/5)"
        ((tests_passed++))
    else
        print_error "❌ Faltan archivos críticos ($files_ok/5)"
    fi
    
    # Test 5: Verificar compilación sin errores
    print_status "Test 5/5: Verificando compilación..."
    if npm run build > build.log 2>&1; then
        print_success "✅ Compilación exitosa"
        ((tests_passed++))
    else
        print_error "❌ Errores de compilación (ver build.log)"
    fi
    
    # Resumen de tests
    print_section "RESUMEN DE VERIFICACIÓN"
    if [ $tests_passed -eq $total_tests ]; then
        print_success "🎉 TODOS LOS TESTS PASARON ($tests_passed/$total_tests)"
        print_success "La restauración fue exitosa y el sistema está funcionando correctamente"
        return 0
    else
        print_error "⚠️ ALGUNOS TESTS FALLARON ($tests_passed/$total_tests)"
        print_warning "El sistema puede no estar funcionando completamente"
        return 1
    fi
}

# Mostrar checklist manual
show_manual_checklist() {
    print_section "CHECKLIST MANUAL DE VERIFICACIÓN"
    echo ""
    echo "Por favor, verificar manualmente en el navegador:"
    echo ""
    echo "🌐 1. Página principal:"
    echo "   - Ir a: http://localhost:3000/reclutamiento/ver/5a832297-4cca-4bad-abe6-3aad99b8b5f3"
    echo "   - ✅ Debe mostrar skeleton de carga, luego contenido"
    echo "   - ❌ Si muestra 'Reclutamiento no encontrado' inmediatamente = PROBLEMA"
    echo ""
    echo "🎯 2. Modal 'Asignar Agendamiento':"
    echo "   - Hacer clic en botón 'Asignar Agendamiento'"
    echo "   - ✅ Modal debe abrir con lista de responsables"
    echo "   - ❌ Si modal aparece vacío = PROBLEMA"
    echo ""
    echo "✏️ 3. Editar Agendamiento Pendiente:"
    echo "   - Buscar card 'Agendamiento Pendiente'"
    echo "   - Hacer clic en 'Editar'"
    echo "   - ✅ Modal debe abrir con responsable pre-seleccionado"
    echo "   - ❌ Si responsable está vacío = PROBLEMA"
    echo ""
    echo "➕ 4. Agregar Participante:"
    echo "   - Desde card 'Agendamiento Pendiente', clic 'Agregar Participante'"
    echo "   - ✅ Modal debe abrir con responsable pre-seleccionado"
    echo "   - ✅ Debe poder crear sin eliminar otros participantes"
    echo "   - ❌ Si otros participantes desaparecen = PROBLEMA"
    echo ""
    echo "🏁 5. Estados de Reclutamiento:"
    echo "   - Verificar reclutamientos con estado 'Finalizado'"
    echo "   - ✅ Deben mantenerse 'Finalizado'"
    echo "   - ❌ Si cambian a 'En progreso' = PROBLEMA"
    echo ""
}

# Función principal
main() {
    local option=${1:-"check"}
    
    print_section "SCRIPT DE RESTAURACIÓN AUTOMÁTICA"
    print_status "Fecha: $(date)"
    print_status "Opción seleccionada: $option"
    
    # Verificar directorio
    check_directory
    
    case "$option" in
        "check")
            print_section "MODO: VERIFICACIÓN ÚNICAMENTE"
            check_backup_files
            if curl -s "http://localhost:3000" > /dev/null 2>&1; then
                verify_system
            else
                print_warning "Servidor no está corriendo. Usar './restore_backup.sh emergency' para restauración completa"
            fi
            show_manual_checklist
            ;;
            
        "files")
            print_section "MODO: RESTAURAR SOLO ARCHIVOS"
            check_backup_files || exit 1
            backup_current_files
            restore_files || exit 1
            print_success "Archivos restaurados. Reiniciar servidor manualmente con 'npm run dev'"
            ;;
            
        "full")
            print_section "MODO: RESTAURACIÓN COMPLETA"
            check_backup_files || exit 1
            backup_current_files
            restore_files || exit 1
            restart_server "full" || exit 1
            sleep 5
            verify_system
            show_manual_checklist
            ;;
            
        "emergency")
            print_section "MODO: RESTAURACIÓN DE EMERGENCIA"
            print_warning "⚠️ MODO DE EMERGENCIA: Restauración agresiva sin backups"
            
            check_backup_files || exit 1
            restore_files || exit 1
            
            # Reseteo completo
            print_status "Realizando reseteo completo..."
            pkill -f "node" 2>/dev/null || true
            rm -rf .next/ node_modules/ 2>/dev/null || true
            npm install || exit 1
            
            restart_server "full" || exit 1
            sleep 10
            verify_system
            show_manual_checklist
            ;;
            
        *)
            echo "Uso: $0 [opcion]"
            echo "Opciones disponibles:"
            echo "  check     - Verificar estado actual sin cambios"
            echo "  files     - Restaurar solo archivos críticos"
            echo "  full      - Restauración completa con reinicio de servidor"
            echo "  emergency - Restauración de emergencia (reseteo completo)"
            echo ""
            echo "Ejemplos:"
            echo "  $0 check     # Verificar estado"
            echo "  $0 files     # Restaurar archivos"
            echo "  $0 full      # Restauración completa"
            echo "  $0 emergency # Emergencia"
            exit 1
            ;;
    esac
}

# Ejecutar función principal con argumentos
main "$@"