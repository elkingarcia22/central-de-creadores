#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { spawn } from 'child_process';

console.log(chalk.blue('🔍 VERIFICANDO MCP MAESTRO...'));

// Verificar archivos esenciales
const essentialFiles = [
  'server.js',
  'package.json',
  'tools/context-manager.js',
  'tools/mcp-dispatcher.js',
  'tools/session-manager.js',
  'tools/decision-tracker.js',
  'tools/project-analyzer.js',
  'tools/github-integration.js',
  'tools/mcp-sync-manager.js'
];

console.log(chalk.yellow('📁 Verificando archivos esenciales...'));
let allFilesExist = true;

essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(chalk.green(`✅ ${file}`));
  } else {
    console.log(chalk.red(`❌ ${file} - NO ENCONTRADO`));
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.log(chalk.red('❌ Faltan archivos esenciales. No se puede continuar.'));
  process.exit(1);
}

// Verificar dependencias
console.log(chalk.yellow('📦 Verificando dependencias...'));
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['@modelcontextprotocol/sdk', 'chalk'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(chalk.green(`✅ ${dep}`));
    } else {
      console.log(chalk.red(`❌ ${dep} - NO INSTALADO`));
    }
  });
} catch (error) {
  console.log(chalk.red('❌ Error leyendo package.json'));
}

// Verificar sintaxis del servidor
console.log(chalk.yellow('🔧 Verificando sintaxis del servidor...'));
try {
  const serverCode = fs.readFileSync('server.js', 'utf8');
  // Verificar que tenga las importaciones necesarias
  if (serverCode.includes('import { Server }') && 
      serverCode.includes('class MCPMaestroServer') &&
      serverCode.includes('this.server = new Server')) {
    console.log(chalk.green('✅ Sintaxis del servidor correcta'));
  } else {
    console.log(chalk.red('❌ Problemas en la estructura del servidor'));
  }
} catch (error) {
  console.log(chalk.red('❌ Error leyendo server.js'));
}

// Probar ejecución del servidor
console.log(chalk.yellow('🚀 Probando ejecución del servidor...'));
const testServer = spawn('node', ['server.js'], {
  stdio: 'pipe',
  cwd: process.cwd()
});

let serverOutput = '';
let serverError = '';

testServer.stdout.on('data', (data) => {
  serverOutput += data.toString();
});

testServer.stderr.on('data', (data) => {
  serverError += data.toString();
});

testServer.on('close', (code) => {
  if (code === 0) {
    console.log(chalk.green('✅ Servidor iniciado correctamente'));
    console.log(chalk.blue('📤 Salida del servidor:'));
    console.log(serverOutput);
  } else {
    console.log(chalk.red(`❌ Error iniciando servidor (código ${code})`));
    if (serverError) {
      console.log(chalk.red('📤 Error del servidor:'));
      console.log(serverError);
    }
  }
  
  // Crear archivo de estado
  const status = {
    timestamp: new Date().toISOString(),
    status: code === 0 ? 'ACTIVE' : 'ERROR',
    files_verified: allFilesExist,
    server_code: code,
    auto_mode: true,
    message: code === 0 ? 'MCP Maestro funcionando correctamente' : 'Error en el servidor'
  };
  
  fs.writeFileSync('maestro-status.json', JSON.stringify(status, null, 2));
  console.log(chalk.green('📄 Estado guardado en maestro-status.json'));
});

// Terminar el servidor de prueba después de 3 segundos
setTimeout(() => {
  testServer.kill();
}, 3000);
