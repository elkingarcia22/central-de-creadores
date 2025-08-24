#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🆓 Configurando alternativas gratuitas de IA...'));

const configPath = path.join(process.cwd(), 'mcp-config.env');
let configContent = '';

if (fs.existsSync(configPath)) {
  configContent = fs.readFileSync(configPath, 'utf8');
}

const freeAIConfig = `
# ====================================
# CONFIGURACIÓN DE IA GRATUITA
# ====================================

# Ollama (Completamente gratuito - Local)
OLLAMA_ENABLED=true
OLLAMA_MODEL=llama2
OLLAMA_BASE_URL=http://localhost:11434

# Hugging Face (Gratuito con límites)
HUGGINGFACE_API_KEY=your-huggingface-key-here
HUGGINGFACE_MODEL=microsoft/DialoGPT-medium

# Groq (Gratuito con límites)
GROQ_API_KEY=your-groq-key-here
GROQ_MODEL=llama2-70b-4096

# Configuración por defecto
DEFAULT_AI_PROVIDER=ollama
AI_FALLBACK_PROVIDER=huggingface
`;

if (!configContent.includes('OLLAMA_ENABLED')) {
  configContent += freeAIConfig;
  fs.writeFileSync(configPath, configContent);
  console.log(chalk.green('✅ Configuración de IA gratuita agregada'));
}

console.log(chalk.blue('\\n📋 OPCIONES GRATUITAS DISPONIBLES:'));
console.log(chalk.green('1. 🐳 Ollama - Completamente gratuito (Recomendado)'));
console.log(chalk.green('2. 🤗 Hugging Face - API gratuita'));
console.log(chalk.green('3. 🚀 Groq - Muy rápido, límites gratuitos'));

console.log(chalk.blue('\\n🎯 PARA INSTALAR OLLAMA:'));
console.log(chalk.yellow('curl -fsSL https://ollama.ai/install.sh | sh'));
console.log(chalk.yellow('ollama pull llama2'));

console.log(chalk.green('\\n🚀 ¡IA gratuita configurada!'));
