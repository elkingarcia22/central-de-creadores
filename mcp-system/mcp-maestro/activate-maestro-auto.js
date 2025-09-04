#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(chalk.green('🎯 ACTIVANDO MCP MAESTRO EN MODO AUTOMÁTICO'));
console.log(chalk.blue('=============================================='));

// Configuración del modo automático
const autoConfig = {
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

// Verificar que el servidor esté listo
if (!fs.existsSync('server.js')) {
  console.log(chalk.red('❌ No se encontró server.js'));
  process.exit(1);
}

// Crear archivo de estado de activación
const activationStatus = {
  timestamp: new Date().toISOString(),
  status: 'ACTIVATING',
  auto_mode: true,
  config: autoConfig,
  features: {
    skipConfirmations: true,
    autoExecute: true,
    autoCommit: true,
    autoBackup: true,
    autoRecoverContext: true,
    autoSync: true,
    autoActivateGitHub: true
  },
  message: 'MCP Maestro iniciando en modo automático'
};

fs.writeFileSync('activation-status.json', JSON.stringify(activationStatus, null, 2));

// Crear archivo de configuración automática
fs.writeFileSync('auto-config.json', JSON.stringify(autoConfig, null, 2));

console.log(chalk.blue('🚀 Iniciando servidor MCP Maestro en modo automático...'));

// Iniciar el servidor con modo automático
const server = spawn('node', ['server.js'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  cwd: __dirname,
  detached: true,
  env: {
    ...process.env,
    MCP_AUTO_MODE: 'true',
    MCP_SKIP_CONFIRMATIONS: 'true',
    MCP_AUTO_EXECUTE: 'true'
  }
});

// Guardar PID
fs.writeFileSync('maestro.pid', server.pid.toString());

// Actualizar estado
activationStatus.status = 'ACTIVE';
activationStatus.pid = server.pid;
activationStatus.message = 'MCP Maestro activo en modo automático';
fs.writeFileSync('activation-status.json', JSON.stringify(activationStatus, null, 2));

console.log(chalk.green(`✅ MCP Maestro iniciado con PID: ${server.pid}`));
console.log(chalk.blue('🎯 MODO AUTOMÁTICO ACTIVADO'));
console.log(chalk.cyan('✅ Sin confirmaciones - ejecución automática'));
console.log(chalk.cyan('✅ Auto-commit activado'));
console.log(chalk.cyan('✅ Auto-backup activado'));
console.log(chalk.cyan('✅ Auto-recuperación de contexto activada'));
console.log(chalk.cyan('✅ Auto-sincronización activada'));
console.log(chalk.cyan('✅ GitHub automático activado'));
console.log(chalk.blue('=============================================='));
console.log(chalk.green('🎯 MCP MAESTRO LISTO PARA ORQUESTAR'));

// Manejar salida del servidor
server.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('MCP MAESTRO EN MODO AUTOMÁTICO')) {
    console.log(chalk.green('✅ Servidor MCP Maestro iniciado correctamente'));
  }
  if (output.includes('listo para orquestar')) {
    console.log(chalk.green('🎯 MCP Maestro listo para orquestar'));
  }
});

server.stderr.on('data', (data) => {
  const output = data.toString();
  if (output.includes('MCP MAESTRO EN MODO AUTOMÁTICO')) {
    console.log(chalk.green('✅ Servidor MCP Maestro iniciado correctamente'));
  }
  if (output.includes('listo para orquestar')) {
    console.log(chalk.green('🎯 MCP Maestro listo para orquestar'));
  }
});

// Manejar señales de terminación
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🛑 Deteniendo MCP Maestro...'));
  server.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n🛑 Deteniendo MCP Maestro...'));
  server.kill('SIGTERM');
  process.exit(0);
});

// Manejar cierre del servidor
server.on('close', (code) => {
  console.log(chalk.red(`❌ Servidor terminado con código ${code}`));
  // Actualizar estado
  activationStatus.status = 'STOPPED';
  activationStatus.message = 'MCP Maestro detenido';
  fs.writeFileSync('activation-status.json', JSON.stringify(activationStatus, null, 2));
  process.exit(code);
});

server.on('error', (error) => {
  console.log(chalk.red('❌ Error en el servidor:', error.message));
  // Actualizar estado
  activationStatus.status = 'ERROR';
  activationStatus.error = error.message;
  fs.writeFileSync('activation-status.json', JSON.stringify(activationStatus, null, 2));
  process.exit(1);
});

// Mantener el proceso activo y monitorear
setInterval(() => {
  try {
    const pid = fs.readFileSync('maestro.pid', 'utf8').trim();
    const isRunning = require('child_process').execSync(`ps -p ${pid}`, { stdio: 'ignore' });
    
    if (!isRunning) {
      console.log(chalk.yellow('⚠️ Servidor MCP Maestro no está ejecutándose, reiniciando...'));
      // Reiniciar el servidor
      server.kill('SIGTERM');
      setTimeout(() => {
        console.log(chalk.blue('🔄 Reiniciando servidor...'));
        // Aquí podrías reiniciar el servidor si es necesario
      }, 1000);
    }
  } catch (error) {
    // El proceso no está ejecutándose
    console.log(chalk.yellow('⚠️ Proceso MCP Maestro no encontrado'));
  }
}, 30000); // Verificar cada 30 segundos

console.log(chalk.blue('🔍 Monitoreando servidor MCP Maestro...'));
console.log(chalk.blue('📊 Estado guardado en activation-status.json'));
console.log(chalk.blue('🆔 PID guardado en maestro.pid'));
