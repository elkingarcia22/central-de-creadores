#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🔧 Corrigiendo MCP Maestro para modo automático...'));

// Configuración automática forzada
const AUTO_CONFIG = {
  autoMode: true,
  skipConfirmations: true,
  autoExecute: true,
  autoCommit: true,
  autoBackup: true,
  silentMode: true,
  autoRecoverContext: true,
  autoSync: true,
  autoActivateGitHub: true,
  forceAuto: true,
  noPrompts: true,
  skipAllConfirmations: true
};

// 1. Actualizar mcp-config.json
const mcpConfigPath = path.join(process.cwd(), 'mcp-config.json');
if (fs.existsSync(mcpConfigPath)) {
  const mcpConfig = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'));
  mcpConfig.mcp_maestro.configuracion.confirmar_cambios = false;
  fs.writeFileSync(mcpConfigPath, JSON.stringify(mcpConfig, null, 2));
  console.log(chalk.green('✅ mcp-config.json actualizado'));
}

// 2. Actualizar auto-config.json del MCP Maestro
const autoConfigPath = path.join(process.cwd(), 'mcp-system', 'mcp-maestro', 'auto-config.json');
if (fs.existsSync(autoConfigPath)) {
  fs.writeFileSync(autoConfigPath, JSON.stringify(AUTO_CONFIG, null, 2));
  console.log(chalk.green('✅ auto-config.json actualizado'));
}

// 3. Crear archivo de estado
const statusPath = path.join(process.cwd(), 'mcp-system', 'mcp-maestro', 'auto-status.json');
const status = {
  timestamp: new Date().toISOString(),
  status: 'AUTO_MODE_FORCED',
  config: AUTO_CONFIG,
  message: 'MCP Maestro configurado para NO pedir confirmaciones'
};
fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));

// 4. Verificar que el servidor tenga la configuración correcta
const serverPath = path.join(process.cwd(), 'mcp-system', 'mcp-maestro', 'server.js');
if (fs.existsSync(serverPath)) {
  let serverContent = fs.readFileSync(serverPath, 'utf8');
  
  // Asegurar que la configuración automática esté presente
  if (!serverContent.includes('"autoMode": true')) {
    console.log(chalk.yellow('⚠️ Configuración automática no encontrada en server.js'));
  } else {
    console.log(chalk.green('✅ Server.js ya tiene configuración automática'));
  }
}

console.log(chalk.blue('\n🎯 CONFIGURACIÓN AUTOMÁTICA FORZADA:'));
Object.entries(AUTO_CONFIG).forEach(([key, value]) => {
  console.log(chalk.cyan(`  ${key}: ${value}`));
});

console.log(chalk.green('\n✅ MCP Maestro configurado para NO pedir confirmaciones'));
console.log(chalk.blue('🎯 Todas las tareas se ejecutarán automáticamente'));
console.log(chalk.yellow('💡 Auto-commit activado'));
console.log(chalk.yellow('💡 Auto-backup activado'));

console.log(chalk.green('\n🚀 ¡MCP Maestro listo para funcionar sin confirmaciones!'));
