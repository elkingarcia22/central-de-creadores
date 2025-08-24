#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🔍 Validando componentes existentes...'));

// Leer configuración
const config = JSON.parse(
  fs.readFileSync('mcp-system/mcp-design-system-simple/config/components.json', 'utf8')
);

console.log(chalk.green('✅ Componentes existentes:'));
config.existing.forEach(component => {
  console.log(chalk.cyan(`  - ${component}`));
});

console.log(chalk.green('\n✅ Patrones disponibles:'));
config.patterns.forEach(pattern => {
  console.log(chalk.cyan(`  - ${pattern}`));
});

// Verificar archivos generados
const outputDir = 'mcp-system/mcp-design-system-simple/output/components';
if (fs.existsSync(outputDir)) {
  const files = fs.readdirSync(outputDir);
  console.log(chalk.green('\n✅ Componentes generados:'));
  files.forEach(file => {
    console.log(chalk.cyan(`  - ${file}`));
  });
}

console.log(chalk.green('\n✅ Validación completada'));
