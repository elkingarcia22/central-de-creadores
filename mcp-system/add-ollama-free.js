#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🐳 Agregando Ollama como alternativa gratuita...'));

// Leer configuración actual
const configPath = path.join(process.cwd(), 'mcp-config.env');
let configContent = '';

if (fs.existsSync(configPath)) {
  configContent = fs.readFileSync(configPath, 'utf8');
}

// Verificar si ya existe configuración de Ollama
if (configContent.includes('OLLAMA_ENABLED')) {
  console.log(chalk.yellow('⚠️ Ollama ya está configurado'));
} else {
  // Agregar configuración de Ollama
  const ollamaConfig = `
# ====================================
# CONFIGURACIÓN DE OLLAMA (IA GRATUITA)
# ====================================

# Ollama - IA Local Completamente Gratuita
OLLAMA_ENABLED=true
OLLAMA_MODEL=llama2
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_TIMEOUT=30000

# Configuración de fallback
AI_FALLBACK_TO_OLLAMA=true
AI_PROVIDER_PRIORITY=openai,ollama

`;

  configContent += ollamaConfig;
  fs.writeFileSync(configPath, configContent);
  console.log(chalk.green('✅ Configuración de Ollama agregada'));
}

// Crear script de instalación de Ollama
const installScript = `#!/usr/bin/env node

import { execSync } from 'child_process';
import chalk from 'chalk';

console.log(chalk.blue('🐳 Instalando Ollama (IA Local Gratuita)...'));

try {
  const platform = process.platform;
  
  if (platform === 'darwin') {
    console.log(chalk.cyan('🍎 Instalando en macOS...'));
    execSync('curl -fsSL https://ollama.ai/install.sh | sh', { stdio: 'inherit' });
  } else if (platform === 'linux') {
    console.log(chalk.cyan('🐧 Instalando en Linux...'));
    execSync('curl -fsSL https://ollama.ai/install.sh | sh', { stdio: 'inherit' });
  } else {
    console.log(chalk.yellow('🪟 Para Windows: https://ollama.ai/download'));
    process.exit(1);
  }
  
  console.log(chalk.green('✅ Ollama instalado'));
  console.log(chalk.blue('📥 Descargando modelo...'));
  execSync('ollama pull llama2', { stdio: 'inherit' });
  console.log(chalk.green('🚀 Ollama listo!'));
  
} catch (error) {
  console.log(chalk.red('❌ Error: ' + error.message));
}
`;

fs.writeFileSync('mcp-system/install-ollama.js', installScript);

// Crear script de prueba de Ollama
const testScript = `#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🧪 Probando Ollama...'));

const configPath = path.join(process.cwd(), 'mcp-config.env');
const configContent = fs.readFileSync(configPath, 'utf8');
const lines = configContent.split('\\n');
const config = {};

lines.forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    config[key.trim()] = value.trim();
  }
});

if (config.OLLAMA_ENABLED === 'true') {
  console.log(chalk.green('✅ Ollama habilitado'));
  console.log(chalk.cyan('🤖 Modelo: ' + config.OLLAMA_MODEL));
  console.log(chalk.cyan('🌐 URL: ' + config.OLLAMA_BASE_URL));
  
  // Verificar si Ollama está corriendo
  try {
    const { execSync } = await import('child_process');
    execSync('ollama list', { stdio: 'pipe' });
    console.log(chalk.green('✅ Ollama está funcionando'));
  } catch (error) {
    console.log(chalk.yellow('⚠️ Ollama no está corriendo'));
    console.log(chalk.cyan('💡 Ejecuta: ollama serve'));
  }
} else {
  console.log(chalk.red('❌ Ollama no configurado'));
}
`;

fs.writeFileSync('mcp-system/test-ollama.js', testScript);

console.log(chalk.green('✅ Ollama agregado como alternativa gratuita'));
console.log(chalk.blue('\\n📋 COMANDOS:'));
console.log(chalk.yellow('  - Instalar: node mcp-system/install-ollama.js'));
console.log(chalk.yellow('  - Probar: node mcp-system/test-ollama.js'));

console.log(chalk.blue('\\n🎯 VENTAJAS DE OLLAMA:'));
console.log(chalk.cyan('✅ 100% gratuito'));
console.log(chalk.cyan('✅ Sin límites de uso'));
console.log(chalk.cyan('✅ Funciona offline'));
console.log(chalk.cyan('✅ Modelos locales'));

console.log(chalk.green('\\n🚀 ¡Ollama agregado exitosamente!'));
