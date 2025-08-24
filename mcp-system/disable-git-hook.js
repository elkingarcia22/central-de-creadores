#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🔧 Gestión de Git Hooks...'));

const hookPath = path.join(process.cwd(), '.git', 'hooks', 'pre-commit');
const backupPath = path.join(process.cwd(), '.git', 'hooks', 'pre-commit.backup');

function disableHook() {
  try {
    if (fs.existsSync(hookPath)) {
      // Crear backup
      fs.copyFileSync(hookPath, backupPath);
      console.log(chalk.green('✅ Backup del hook creado'));
      
      // Deshabilitar hook
      fs.unlinkSync(hookPath);
      console.log(chalk.yellow('⚠️ Hook de pre-commit deshabilitado'));
      console.log(chalk.cyan('📝 Para reactivarlo: node mcp-system/disable-git-hook.js --enable'));
    } else {
      console.log(chalk.yellow('⚠️ No hay hook de pre-commit activo'));
    }
  } catch (error) {
    console.log(chalk.red('❌ Error:', error.message));
  }
}

function enableHook() {
  try {
    if (fs.existsSync(backupPath)) {
      // Restaurar hook
      fs.copyFileSync(backupPath, hookPath);
      console.log(chalk.green('✅ Hook de pre-commit reactivado'));
    } else {
      console.log(chalk.yellow('⚠️ No hay backup del hook'));
    }
  } catch (error) {
    console.log(chalk.red('❌ Error:', error.message));
  }
}

function checkStatus() {
  const hookExists = fs.existsSync(hookPath);
  const backupExists = fs.existsSync(backupPath);
  
  console.log(chalk.blue('📊 Estado de Git Hooks:'));
  console.log(chalk.cyan(`   Hook activo: ${hookExists ? '✅' : '❌'}`));
  console.log(chalk.cyan(`   Backup disponible: ${backupExists ? '✅' : '❌'}`));
  
  if (hookExists) {
    console.log(chalk.green('🎯 Auto-commit habilitado'));
  } else {
    console.log(chalk.yellow('⚠️ Auto-commit deshabilitado'));
  }
}

// Procesar argumentos
const args = process.argv.slice(2);

if (args.includes('--disable')) {
  disableHook();
} else if (args.includes('--enable')) {
  enableHook();
} else if (args.includes('--status')) {
  checkStatus();
} else {
  console.log(chalk.blue('📋 Comandos disponibles:'));
  console.log(chalk.yellow('  --disable  - Deshabilitar auto-commit'));
  console.log(chalk.yellow('  --enable   - Habilitar auto-commit'));
  console.log(chalk.yellow('  --status   - Ver estado actual'));
  
  // Mostrar estado por defecto
  checkStatus();
}
