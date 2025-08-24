#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🧪 Probando auto-commit del MCP Maestro...'));

try {
  // 1. Verificar estado actual de git
  console.log(chalk.cyan('📊 Estado actual de git:'));
  const status = execSync('git status --porcelain', { encoding: 'utf8' });
  console.log(status || 'No hay cambios pendientes');
  
  // 2. Crear un archivo de prueba
  const testFile = path.join(process.cwd(), 'test-auto-commit.txt');
  const timestamp = new Date().toISOString();
  fs.writeFileSync(testFile, `Test auto-commit: ${timestamp}`);
  console.log(chalk.green('✅ Archivo de prueba creado'));
  
  // 3. Verificar que el archivo se detecte
  console.log(chalk.cyan('📊 Estado después de crear archivo:'));
  const newStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  console.log(newStatus);
  
  // 4. Ejecutar auto-commit
  console.log(chalk.cyan('🤖 Ejecutando auto-commit...'));
  execSync('node mcp-system/auto-commit.js', { stdio: 'inherit' });
  
  // 5. Verificar estado final
  console.log(chalk.cyan('📊 Estado final:'));
  const finalStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  console.log(finalStatus || 'No hay cambios pendientes');
  
  // 6. Limpiar archivo de prueba
  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
    console.log(chalk.green('✅ Archivo de prueba eliminado'));
  }
  
  console.log(chalk.green('\n✅ Prueba de auto-commit completada'));
  
} catch (error) {
  console.log(chalk.red('❌ Error en prueba de auto-commit:'), error.message);
}
