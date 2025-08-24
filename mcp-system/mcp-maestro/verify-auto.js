#!/usr/bin/env node

import chalk from 'chalk';

console.log(chalk.blue('🚀 MCP MAESTRO - MODO AUTOMÁTICO FORZADO'));
console.log(chalk.green('✅ SIN CONFIRMACIONES - EJECUCIÓN AUTOMÁTICA'));

const config = {
  autoMode: true,
  skipConfirmations: true,
  autoExecute: true,
  autoCommit: true,
  autoBackup: true,
  silentMode: true,
  forceAuto: true,
  noPrompts: true
};

console.log(chalk.cyan('🎯 Configuración forzada:'));
Object.entries(config).forEach(([key, value]) => {
  console.log(chalk.cyan('  ' + key + ': ' + value));
});

console.log(chalk.green('\n✅ MCP Maestro configurado para NO pedir confirmaciones'));
console.log(chalk.blue('🎯 Todas las tareas se ejecutarán automáticamente'));
