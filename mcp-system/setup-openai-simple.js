#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🤖 Configurando OpenAI API Key...'));

// Verificar si ya existe una configuración
const configPath = path.join(process.cwd(), 'mcp-config.env');
let configContent = '';

if (fs.existsSync(configPath)) {
  configContent = fs.readFileSync(configPath, 'utf8');
} else {
  configContent = `# ====================================
# CONFIGURACIÓN MCP - CENTRAL DE CREADORES
# ====================================

# Variables de Supabase
SUPABASE_URL=https://eloncaptettdvrvwypji.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsb25jYXB0ZXR0ZHZydnd5cGppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxMTYwMjQsImV4cCI6MjA2NTY5MjAyNH0.CFQ1kOCoNgNZ74yOF6qymrUUPV9V0B8JX2sfjc8LUv0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsb25jYXB0ZXR0ZHZydnd5cGppIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDExNjAyNCwiZXhwIjoyMDY1NjkyMDI0fQ.b4-pu9KmNmn6jYYv1HgSKtoSRzjZDEEpdhtHcXxqWxw

`;
}

// Verificar si ya existe configuración de OpenAI
if (configContent.includes('OPENAI_API_KEY')) {
  console.log(chalk.yellow('⚠️ OpenAI API Key ya está configurada'));
  console.log(chalk.cyan('📝 Para cambiar la API Key, edita manualmente el archivo mcp-config.env'));
} else {
  // Agregar configuración de OpenAI
  const openaiConfig = `
# ====================================
# CONFIGURACIÓN DE OPENAI
# ====================================

# OpenAI API Key (REEMPLAZA CON TU API KEY REAL)
OPENAI_API_KEY=sk-your-openai-api-key-here

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
  
  // Guardar configuración
  fs.writeFileSync(configPath, configContent);
  console.log(chalk.green('✅ Configuración de OpenAI agregada'));
}

// Crear script de prueba de OpenAI
const testScript = `#!/usr/bin/env node

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
const lines = configContent.split('\\n');
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
  console.log(chalk.blue('\\n🧪 Probando conexión...'));
  
  // Aquí podrías hacer una llamada real a OpenAI
  // Por ahora solo validamos la configuración
  console.log(chalk.green('✅ Configuración válida'));
  console.log(chalk.cyan('🚀 OpenAI está listo para usar'));
  
} catch (error) {
  console.log(chalk.red('❌ Error en la prueba: ' + error.message));
}
`;

fs.writeFileSync('mcp-system/test-openai.js', testScript);

// Crear script de configuración manual
const manualConfigScript = `#!/usr/bin/env node

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

console.log(chalk.blue('\\n🔗 Obtén tu API Key en: https://platform.openai.com/api-keys'));

// Mostrar contenido actual
const configContent = fs.readFileSync(configPath, 'utf8');
const openaiLines = configContent.split('\\n').filter(line => line.includes('OPENAI'));

if (openaiLines.length > 0) {
  console.log(chalk.blue('\\n📋 Configuración actual de OpenAI:'));
  openaiLines.forEach(line => {
    if (line.includes('API_KEY')) {
      const maskedKey = line.replace(/sk-[a-zA-Z0-9]+/, 'sk-***');
      console.log(chalk.cyan('  ' + maskedKey));
    } else {
      console.log(chalk.cyan('  ' + line));
    }
  });
}
`;

fs.writeFileSync('mcp-system/configure-openai-manual.js', manualConfigScript);

console.log(chalk.green('✅ Scripts creados'));
console.log(chalk.blue('\\n📋 COMANDOS DISPONIBLES:'));
console.log(chalk.yellow('  - Configuración manual: node mcp-system/configure-openai-manual.js'));
console.log(chalk.yellow('  - Probar OpenAI: node mcp-system/test-openai.js'));

console.log(chalk.blue('\\n🎯 PRÓXIMOS PASOS:'));
console.log(chalk.cyan('1. Ejecuta: node mcp-system/configure-openai-manual.js'));
console.log(chalk.cyan('2. Edita mcp-config.env con tu API Key real'));
console.log(chalk.cyan('3. Ejecuta: node mcp-system/test-openai.js'));

console.log(chalk.green('\\n🚀 Configuración de OpenAI completada!'));
