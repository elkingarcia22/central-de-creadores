#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';

console.log(chalk.green('🎯 INICIANDO MCP MAESTRO EN MODO AUTOMÁTICO'));
console.log(chalk.blue('=============================================='));

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

// Iniciar el servidor
console.log(chalk.blue('🚀 Iniciando servidor MCP Maestro...'));

const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: process.cwd(),
  detached: true
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

// Mantener el proceso activo
server.on('close', (code) => {
  console.log(chalk.red(`❌ Servidor terminado con código ${code}`));
  process.exit(code);
});

server.on('error', (error) => {
  console.log(chalk.red('❌ Error en el servidor:', error.message));
  process.exit(1);
});
