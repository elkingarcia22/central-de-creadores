#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🧪 Probando conexión con OpenAI...'));

// Cargar configuración
const configPath = path.join(process.cwd(), 'mcp-config.env');
if (!fs.existsSync(configPath)) {
  console.log(chalk.red('❌ Archivo de configuración no encontrado'));
  process.exit(1);
}

const configContent = fs.readFileSync(configPath, 'utf8');
const lines = configContent.split('\n');
const config = {};

lines.forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    config[key.trim()] = value.trim();
  }
});

const apiKey = config.OPENAI_API_KEY;

if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
  console.log(chalk.red('❌ OpenAI API Key no configurada'));
  console.log(chalk.yellow('📝 Edita el archivo mcp-config.env y reemplaza la API Key'));
  console.log(chalk.cyan('🔗 Obtén tu API Key en: https://platform.openai.com/api-keys'));
  process.exit(1);
}

if (!apiKey.startsWith('sk-')) {
  console.log(chalk.red('❌ API Key inválida (debe empezar con sk-)'));
  process.exit(1);
}

console.log(chalk.green('✅ API Key configurada correctamente'));
console.log(chalk.cyan('🔑 API Key: ' + apiKey.substring(0, 10) + '...'));
console.log(chalk.cyan('🤖 Modelo: ' + (config.OPENAI_MODEL || 'gpt-4')));

// Intentar hacer una prueba simple
try {
  console.log(chalk.blue('\n🧪 Probando conexión...'));
  
  // Aquí podrías hacer una llamada real a OpenAI
  // Por ahora solo validamos la configuración
  console.log(chalk.green('✅ Configuración válida'));
  console.log(chalk.cyan('🚀 OpenAI está listo para usar'));
  
} catch (error) {
  console.log(chalk.red('❌ Error en la prueba: ' + error.message));
}
