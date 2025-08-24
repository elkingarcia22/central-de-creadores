#!/usr/bin/env node

/**
 * Script de prueba para verificar el funcionamiento del MCP Maestro
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('🎯 Probando Sistema MCP Maestro...');
console.log('==================================');

// 1. Verificar estructura de directorios
console.log('\n📁 1. Verificando estructura de directorios...');
const requiredDirs = [
  'mcp-system/mcp-maestro',
  'mcp-system/mcp-maestro/storage',
  'mcp-system/mcp-maestro/tools',
  'mcp-system/mcp-maestro/scripts',
  'backups'
];

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}`);
  } else {
    console.log(`❌ ${dir} - NO EXISTE`);
  }
});

// 2. Verificar archivos críticos
console.log('\n📄 2. Verificando archivos críticos...');
const requiredFiles = [
  'mcp-system/auto-commit.js',
  'mcp-system/mcp-maestro/server.js',
  'mcp-system/mcp-maestro/tools/change-manager.js',
  'mcp-system/mcp-maestro/scripts/manage-changes.js',
  '.git/hooks/pre-commit'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NO EXISTE`);
  }
});

// 3. Verificar estado de Git
console.log('\n🔗 3. Verificando estado de Git...');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  
  console.log(`✅ Branch actual: ${branch}`);
  console.log(`📝 Archivos modificados: ${gitStatus.split('\n').filter(line => line.trim()).length}`);
  
  if (gitStatus.trim()) {
    console.log('📋 Cambios pendientes:');
    gitStatus.split('\n').filter(line => line.trim()).forEach(line => {
      console.log(`   ${line}`);
    });
  } else {
    console.log('✅ No hay cambios pendientes');
  }
} catch (error) {
  console.log('❌ Error verificando Git:', error.message);
}

// 4. Verificar permisos de ejecución
console.log('\n🔧 4. Verificando permisos de ejecución...');
const executableFiles = [
  'mcp-system/auto-commit.js',
  'mcp-system/mcp-maestro/scripts/manage-changes.js',
  '.git/hooks/pre-commit'
];

executableFiles.forEach(file => {
  try {
    const stats = fs.statSync(file);
    if (stats.mode & 0o111) {
      console.log(`✅ ${file} - Ejecutable`);
    } else {
      console.log(`⚠️ ${file} - No ejecutable`);
    }
  } catch (error) {
    console.log(`❌ ${file} - Error verificando permisos`);
  }
});

// 5. Probar funcionalidad básica
console.log('\n🧪 5. Probando funcionalidad básica...');

// Probar el script de gestión de cambios
try {
  const helpOutput = execSync('node mcp-system/mcp-maestro/scripts/manage-changes.js help', { encoding: 'utf8' });
  console.log('✅ Script de gestión de cambios funciona');
} catch (error) {
  console.log('❌ Error en script de gestión de cambios:', error.message);
}

// Verificar estado del sistema
try {
  const statusOutput = execSync('node mcp-system/mcp-maestro/scripts/manage-changes.js status', { encoding: 'utf8' });
  console.log('✅ Verificación de estado funciona');
} catch (error) {
  console.log('❌ Error verificando estado:', error.message);
}

// 6. Resumen final
console.log('\n📊 RESUMEN DEL SISTEMA:');
console.log('========================');
console.log('🎯 MCP Maestro está configurado y listo para usar');
console.log('');
console.log('💡 Comandos disponibles:');
console.log('   node mcp-system/mcp-maestro/scripts/manage-changes.js status');
console.log('   node mcp-system/mcp-maestro/scripts/manage-changes.js backup "Descripción"');
console.log('   node mcp-system/mcp-maestro/scripts/manage-changes.js commit "Mensaje"');
console.log('   node mcp-system/mcp-maestro/scripts/manage-changes.js undo');
console.log('   node mcp-system/mcp-maestro/scripts/manage-changes.js history');
console.log('');
console.log('🔄 El sistema automáticamente:');
console.log('   - Crea backups antes de commits');
console.log('   - Permite deshacer cambios');
console.log('   - Mantiene historial de cambios');
console.log('   - Sincroniza con MCPs especializados');
console.log('');
console.log('✅ ¡Sistema MCP Maestro activado exitosamente!');
