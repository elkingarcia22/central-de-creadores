#!/usr/bin/env node

import { AutoExecutionSystem } from './auto-execution-system.js';
import chalk from 'chalk';

console.log(chalk.blue('🧪 Probando ejecución automática...'));

async function test() {
  const auto = new AutoExecutionSystem();
  
  // Ejecutar tarea automáticamente
  const result = await auto.executeTask({
    type: 'code_analysis',
    description: 'Análisis automático de código',
    target: 'src/App.tsx'
  });
  
  console.log(chalk.green('✅ Resultado: ' + result.success));
  if (result.summary) {
    console.log(chalk.cyan(result.summary));
  }
}

test();
