#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🔧 Configuración Manual de OpenAI API Key'));

const configPath = path.join(process.cwd(), 'mcp-config.env');

if (!fs.existsSync(configPath)) {
  console.log(chalk.red('❌ Archivo de configuración no encontrado'));
  process.exit(1);
}

console.log(chalk.yellow('📝 INSTRUCCIONES:'));
console.log(chalk.cyan('1. Abre el archivo: mcp-config.env'));
console.log(chalk.cyan('2. Busca la línea: OPENAI_API_KEY=sk-your-openai-api-key-here'));
console.log(chalk.cyan('3. Reemplaza con tu API Key real'));
console.log(chalk.cyan('4. Guarda el archivo'));
console.log(chalk.cyan('5. Ejecuta: node mcp-system/test-openai.js'));

console.log(chalk.blue('\n🔗 Obtén tu API Key en: https://platform.openai.com/api-keys'));

// Mostrar contenido actual
const configContent = fs.readFileSync(configPath, 'utf8');
const openaiLines = configContent.split('\n').filter(line => line.includes('OPENAI'));

if (openaiLines.length > 0) {
  console.log(chalk.blue('\n📋 Configuración actual de OpenAI:'));
  openaiLines.forEach(line => {
    if (line.includes('API_KEY')) {
      const maskedKey = line.replace(/sk-[a-zA-Z0-9]+/, 'sk-***');
      console.log(chalk.cyan('  ' + maskedKey));
    } else {
      console.log(chalk.cyan('  ' + line));
    }
  });
}
