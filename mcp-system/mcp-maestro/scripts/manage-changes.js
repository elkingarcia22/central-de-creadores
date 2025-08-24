#!/usr/bin/env node

/**
 * Script de comando para gestionar cambios con MCP Maestro
 * Uso: node scripts/manage-changes.js [comando] [opciones]
 */

import ChangeManager from '../tools/change-manager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../../');

const changeManager = new ChangeManager(projectRoot);

const command = process.argv[2];
const options = process.argv.slice(3);

async function main() {
  switch (command) {
    case 'status':
      showStatus();
      break;
    case 'backup':
      await createBackup(options[0] || 'Backup manual');
      break;
    case 'undo':
      await undoLastChange();
      break;
    case 'commit':
      await commitWithBackup(options[0] || 'Commit con backup');
      break;
    case 'history':
      showHistory();
      break;
    case 'help':
    default:
      showHelp();
      break;
  }
}

function showStatus() {
  const status = changeManager.getSystemStatus();
  if (status) {
    console.log('🎯 Estado del Sistema MCP Maestro:');
    console.log('=====================================');
    console.log(`📁 Archivos modificados: ${status.modified_files}`);
    console.log(`💾 Último backup: ${status.last_backup || 'Ninguno'}`);
    console.log(`📊 Total de cambios: ${status.total_changes}`);
    console.log(`🔄 Auto-backup: ${status.auto_backup_enabled ? 'Activado' : 'Desactivado'}`);
  }
}

async function createBackup(description) {
  console.log('💾 Creando backup...');
  const backupPath = await changeManager.createBackup(description);
  if (backupPath) {
    console.log(`✅ Backup creado exitosamente en: ${backupPath}`);
  } else {
    console.log('ℹ️ No hay cambios para respaldar');
  }
}

async function undoLastChange() {
  console.log('🔄 Deshaciendo último cambio...');
  const success = await changeManager.undoLastChange();
  if (!success) {
    console.log('❌ No se pudo deshacer el cambio');
  }
}

async function commitWithBackup(message) {
  console.log('📝 Realizando commit con backup...');
  const success = await changeManager.commitWithBackup(message);
  if (!success) {
    console.log('❌ Error en el commit');
  }
}

function showHistory() {
  const history = changeManager.getChangesHistory();
  console.log('📋 Historial de Cambios:');
  console.log('========================');
  
  if (history.length === 0) {
    console.log('ℹ️ No hay cambios registrados');
    return;
  }
  
  history.slice(-10).reverse().forEach((change, index) => {
    const date = new Date(change.timestamp).toLocaleString('es-ES');
    console.log(`${index + 1}. [${change.type.toUpperCase()}] ${date}`);
    if (change.description) {
      console.log(`   📝 ${change.description}`);
    }
    if (change.message) {
      console.log(`   💬 ${change.message}`);
    }
    if (change.files && change.files.length > 0) {
      console.log(`   📁 ${change.files.length} archivos`);
    }
    console.log('');
  });
}

function showHelp() {
  console.log('🎯 MCP Maestro - Gestor de Cambios');
  console.log('===================================');
  console.log('');
  console.log('Comandos disponibles:');
  console.log('');
  console.log('  status                    - Mostrar estado del sistema');
  console.log('  backup [descripción]      - Crear backup de cambios actuales');
  console.log('  undo                      - Deshacer último cambio');
  console.log('  commit [mensaje]          - Hacer commit con backup automático');
  console.log('  history                   - Mostrar historial de cambios');
  console.log('  help                      - Mostrar esta ayuda');
  console.log('');
  console.log('Ejemplos:');
  console.log('  node scripts/manage-changes.js status');
  console.log('  node scripts/manage-changes.js backup "Antes de refactorizar"');
  console.log('  node scripts/manage-changes.js commit "Nueva funcionalidad"');
  console.log('  node scripts/manage-changes.js undo');
}

main().catch(console.error);
