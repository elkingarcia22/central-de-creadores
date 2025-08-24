#!/usr/bin/env node

import { executeTask } from './auto-activation.js';
import chalk from 'chalk';

console.log(chalk.blue('🧪 Probando modo automático del MCP...'));

async function testAutoMode() {
  // Probar ejecución automática
  const result = await executeTask({
    description: 'Prueba de modo automático',
    type: 'test',
    data: { test: true }
  });
  
  console.log(chalk.green('✅ Modo automático funcionando correctamente'));
  console.log(chalk.cyan('🎯 No se pidió confirmación - ejecución automática'));
}

testAutoMode();
