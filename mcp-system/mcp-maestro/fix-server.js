#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.yellow('🔧 Limpiando y corrigiendo server.js...'));

// Leer el archivo original
const serverPath = path.join(process.cwd(), 'server.js');
let serverCode = fs.readFileSync(serverPath, 'utf8');

// Eliminar todas las inyecciones de configuración automática
const patternsToRemove = [
  /\/\/ CONFIGURACIÓN AUTOMÁTICA INYECTADA[\s\S]*?if \(AUTO_CONFIG\.autoMode\) \{[\s\S]*?\}/g,
  /const AUTO_CONFIG = \{[\s\S]*?\};/g,
  /\/\/ Modificar comportamiento para modo automático[\s\S]*?console\.log\(chalk\.cyan\('✅ Auto-recuperación de contexto activada'\)\);/g
];

patternsToRemove.forEach(pattern => {
  serverCode = serverCode.replace(pattern, '');
});

// Limpiar líneas vacías múltiples
serverCode = serverCode.replace(/\n\s*\n\s*\n/g, '\n\n');

// Buscar la clase MCPMaestroServer y agregar el constructor correctamente
const classPattern = /class MCPMaestroServer \{/;
if (classPattern.test(serverCode)) {
  const constructorCode = `
  constructor() {
    // CONFIGURACIÓN AUTOMÁTICA
    this.AUTO_CONFIG = {
      "autoMode": true,
      "skipConfirmations": true,
      "autoExecute": true,
      "autoCommit": true,
      "autoBackup": true,
      "silentMode": true,
      "autoRecoverContext": true,
      "autoSync": true,
      "autoActivateGitHub": true,
      "forceAuto": true,
      "noPrompts": true,
      "skipAllConfirmations": true
    };

    // Modificar comportamiento para modo automático
    if (this.AUTO_CONFIG.autoMode) {
      console.log(chalk.blue('🎯 MODO AUTOMÁTICO ACTIVADO'));
      console.log(chalk.cyan('✅ Sin confirmaciones - ejecución automática'));
      console.log(chalk.cyan('✅ Auto-commit activado'));
      console.log(chalk.cyan('✅ Auto-backup activado'));
      console.log(chalk.cyan('✅ Auto-recuperación de contexto activada'));
    }
  }`;

  serverCode = serverCode.replace(
    'class MCPMaestroServer {',
    `class MCPMaestroServer {${constructorCode}`
  );
}

// Guardar el archivo corregido
fs.writeFileSync(serverPath, serverCode);

console.log(chalk.green('✅ server.js limpiado y corregido exitosamente'));
console.log(chalk.blue('🎯 MCP Maestro listo para modo automático'));
