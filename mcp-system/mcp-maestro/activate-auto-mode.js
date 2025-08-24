#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Cargar configuración automática
const configPath = path.join(process.cwd(), 'auto-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log(chalk.green('🤖 MCP Maestro iniciando en modo automático...'));

// Modificar el comportamiento del servidor para modo automático
const originalServerPath = path.join(process.cwd(), 'server.js');
let serverCode = fs.readFileSync(originalServerPath, 'utf8');

// Agregar configuración automática al servidor
const autoConfigInjection = `
// CONFIGURACIÓN AUTOMÁTICA INYECTADA
const AUTO_CONFIG = ${JSON.stringify(config, null, 2)};

// Modificar comportamiento para modo automático
if (AUTO_CONFIG.autoMode) {
  console.log(chalk.blue('🎯 MODO AUTOMÁTICO ACTIVADO'));
  console.log(chalk.cyan('✅ Sin confirmaciones - ejecución automática'));
  console.log(chalk.cyan('✅ Auto-commit activado'));
  console.log(chalk.cyan('✅ Auto-backup activado'));
  console.log(chalk.cyan('✅ Auto-recuperación de contexto activada'));
}

`;

// Insertar configuración automática al inicio de la clase
serverCode = serverCode.replace(
  'class MCPMaestroServer {',
  `class MCPMaestroServer {
  ${autoConfigInjection}`
);

// Guardar servidor modificado
fs.writeFileSync(originalServerPath, serverCode);

console.log(chalk.green('✅ MCP Maestro configurado en modo automático'));
console.log(chalk.blue('🎯 El servidor ahora funcionará sin confirmaciones'));
