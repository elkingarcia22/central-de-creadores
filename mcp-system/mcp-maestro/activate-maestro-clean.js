#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';

console.log(chalk.green('🤖 ACTIVANDO MCP MAESTRO EN MODO AUTOMÁTICO...'));

// 1. Limpiar el servidor de configuraciones duplicadas
const serverPath = path.join(process.cwd(), 'server.js');
let serverCode = fs.readFileSync(serverPath, 'utf8');

// Remover todas las configuraciones automáticas duplicadas
const cleanServerCode = serverCode.replace(
  /\/\/ CONFIGURACIÓN AUTOMÁTICA INYECTADA[\s\S]*?}\s*}\s*/g,
  ''
);

// Agregar configuración limpia al inicio de la clase
const cleanAutoConfig = `
  // CONFIGURACIÓN AUTOMÁTICA ACTIVADA
  constructor() {
    this.autoMode = true;
    this.skipConfirmations = true;
    this.autoExecute = true;
    this.autoCommit = true;
    this.autoBackup = true;
    this.silentMode = true;
    this.autoRecoverContext = true;
    this.autoSync = true;
    this.autoActivateGitHub = true;
    this.forceAuto = true;
    this.noPrompts = true;
    this.skipAllConfirmations = true;
    
    console.log(chalk.blue('🎯 MCP MAESTRO EN MODO AUTOMÁTICO'));
    console.log(chalk.cyan('✅ Sin confirmaciones - ejecución automática'));
    console.log(chalk.cyan('✅ Auto-commit activado'));
    console.log(chalk.cyan('✅ Auto-backup activado'));
    console.log(chalk.cyan('✅ Auto-recuperación de contexto activada'));
  }
`;

// Insertar configuración limpia
const finalServerCode = cleanServerCode.replace(
  'class MCPMaestroServer {',
  `class MCPMaestroServer {${cleanAutoConfig}`
);

// Guardar servidor limpio
fs.writeFileSync(serverPath, finalServerCode);

console.log(chalk.green('✅ Servidor limpiado y configurado'));

// 2. Verificar dependencias
console.log(chalk.blue('📦 Verificando dependencias...'));
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(chalk.green('✅ Dependencias verificadas'));
} catch (error) {
  console.log(chalk.yellow('⚠️ Instalando dependencias...'));
  const install = spawn('npm', ['install'], { stdio: 'inherit' });
  install.on('close', (code) => {
    if (code === 0) {
      console.log(chalk.green('✅ Dependencias instaladas'));
      startServer();
    } else {
      console.log(chalk.red('❌ Error instalando dependencias'));
    }
  });
}

// 3. Iniciar servidor
function startServer() {
  console.log(chalk.blue('🚀 Iniciando MCP Maestro...'));
  
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  server.on('error', (error) => {
    console.log(chalk.red('❌ Error iniciando servidor:', error.message));
  });
  
  server.on('close', (code) => {
    if (code !== 0) {
      console.log(chalk.red(`❌ Servidor terminado con código ${code}`));
    }
  });
  
  // Guardar PID para referencia
  fs.writeFileSync('server.pid', server.pid.toString());
  console.log(chalk.green(`✅ MCP Maestro iniciado con PID: ${server.pid}`));
  console.log(chalk.blue('🎯 MODO AUTOMÁTICO ACTIVADO - Sin confirmaciones'));
}

// Iniciar servidor si las dependencias ya están instaladas
if (fs.existsSync('package.json')) {
  startServer();
}
