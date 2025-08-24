#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Obtener la API Key del argumento de línea de comandos
const apiKey = process.argv[3];

if (!apiKey) {
  console.log(chalk.red('❌ Error: Debes proporcionar tu API Key'));
  console.log(chalk.yellow('📝 Uso: node mcp-system/set-openai-key.js --key sk-tu-api-key-aqui'));
  console.log(chalk.cyan('🔗 Obtén tu API Key en: https://platform.openai.com/api-keys'));
  process.exit(1);
}

if (!apiKey.startsWith('sk-')) {
  console.log(chalk.red('❌ Error: La API Key debe empezar con "sk-"'));
  process.exit(1);
}

console.log(chalk.blue('🔧 Configurando OpenAI API Key...'));

// Leer el archivo de configuración actual
const configPath = path.join(process.cwd(), 'mcp-config.env');
let configContent = '';

if (fs.existsSync(configPath)) {
  configContent = fs.readFileSync(configPath, 'utf8');
}

// Verificar si ya existe configuración de OpenAI
if (configContent.includes('OPENAI_API_KEY')) {
  // Reemplazar la API Key existente
  configContent = configContent.replace(
    /OPENAI_API_KEY=.*/g,
    `OPENAI_API_KEY=${apiKey}`
  );
  console.log(chalk.green('✅ API Key actualizada'));
} else {
  // Agregar configuración completa de OpenAI
  const openaiConfig = `
# ====================================
# CONFIGURACIÓN DE OPENAI
# ====================================

# OpenAI API Key
OPENAI_API_KEY=${apiKey}

# Modelo de OpenAI a usar (gpt-4, gpt-3.5-turbo, etc.)
OPENAI_MODEL=gpt-4

# Temperatura para generación (0.0 - 2.0)
OPENAI_TEMPERATURE=0.7

# Máximo de tokens por respuesta
OPENAI_MAX_TOKENS=2000

# Timeout para requests a OpenAI (en milisegundos)
OPENAI_TIMEOUT=30000

`;
  configContent += openaiConfig;
  console.log(chalk.green('✅ Configuración de OpenAI agregada'));
}

// Guardar la configuración
fs.writeFileSync(configPath, configContent);

console.log(chalk.green('✅ API Key configurada exitosamente'));
console.log(chalk.cyan('🔑 API Key: ' + apiKey.substring(0, 10) + '...'));

// Probar la configuración
console.log(chalk.blue('\n🧪 Probando configuración...'));

try {
  // Verificar que el archivo se guardó correctamente
  const savedContent = fs.readFileSync(configPath, 'utf8');
  if (savedContent.includes(apiKey)) {
    console.log(chalk.green('✅ Configuración guardada correctamente'));
    console.log(chalk.cyan('🚀 OpenAI está listo para usar'));
  } else {
    console.log(chalk.red('❌ Error al guardar la configuración'));
  }
} catch (error) {
  console.log(chalk.red('❌ Error: ' + error.message));
}

console.log(chalk.blue('\n📋 Para probar la conexión:'));
console.log(chalk.yellow('  node mcp-system/test-openai.js'));
