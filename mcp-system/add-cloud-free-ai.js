#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('☁️ Agregando IA gratuita para la nube...'));

// Leer configuración actual
const configPath = path.join(process.cwd(), 'mcp-config.env');
let configContent = '';

if (fs.existsSync(configPath)) {
  configContent = fs.readFileSync(configPath, 'utf8');
}

// Agregar configuración de IA gratuita para nube
const cloudAIConfig = `
# ====================================
# CONFIGURACIÓN DE IA GRATUITA PARA NUBE
# ====================================

# Opción 1: Hugging Face (Gratuito - Funciona en nube)
HUGGINGFACE_API_KEY=your-huggingface-key-here
HUGGINGFACE_MODEL=microsoft/DialoGPT-medium
HUGGINGFACE_ENABLED=true

# Opción 2: Groq (Gratuito con límites - Funciona en nube)
GROQ_API_KEY=your-groq-key-here
GROQ_MODEL=llama2-70b-4096
GROQ_ENABLED=false

# Opción 3: Together AI (Gratuito con límites - Funciona en nube)
TOGETHER_API_KEY=your-together-key-here
TOGETHER_MODEL=togethercomputer/llama-2-70b
TOGETHER_ENABLED=false

# Configuración por defecto para nube
DEFAULT_CLOUD_AI_PROVIDER=huggingface
AI_FALLBACK_PROVIDER=groq

# Límites gratuitos
FREE_AI_DAILY_LIMIT=100
FREE_AI_RATE_LIMIT=10

`;

// Verificar si ya existe configuración de IA gratuita
if (configContent.includes('HUGGINGFACE_ENABLED')) {
  console.log(chalk.yellow('⚠️ Configuración de IA gratuita ya existe'));
} else {
  configContent += cloudAIConfig;
  fs.writeFileSync(configPath, configContent);
  console.log(chalk.green('✅ Configuración de IA gratuita para nube agregada'));
}

// Crear script de configuración de Hugging Face
const huggingfaceSetupScript = `#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🤗 Configurando Hugging Face (IA Gratuita para Nube)...'));

console.log(chalk.yellow('📝 INSTRUCCIONES PARA HUGGING FACE:'));
console.log(chalk.cyan('1. Ve a: https://huggingface.co/settings/tokens'));
console.log(chalk.cyan('2. Crea una cuenta gratuita'));
console.log(chalk.cyan('3. Crea un nuevo token'));
console.log(chalk.cyan('4. Copia el token'));
console.log(chalk.cyan('5. Ejecuta: node mcp-system/set-huggingface-key.js --key tu-token-aqui'));

console.log(chalk.blue('\\n🎯 VENTAJAS DE HUGGING FACE:'));
console.log(chalk.green('✅ 100% gratuito'));
console.log(chalk.green('✅ Funciona en la nube'));
console.log(chalk.green('✅ Sin límites estrictos'));
console.log(chalk.green('✅ Muchos modelos disponibles'));
console.log(chalk.green('✅ API estable'));

console.log(chalk.blue('\\n📊 LÍMITES GRATUITOS:'));
console.log(chalk.cyan('• 30,000 requests por mes'));
console.log(chalk.cyan('• Modelos de hasta 7B parámetros'));
console.log(chalk.cyan('• Sin tarjeta de crédito requerida'));
`;

fs.writeFileSync('mcp-system/setup-huggingface.js', huggingfaceSetupScript);

// Crear script para configurar Hugging Face
const setHuggingfaceScript = `#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const apiKey = process.argv[3];

if (!apiKey) {
  console.log(chalk.red('❌ Error: Debes proporcionar tu token de Hugging Face'));
  console.log(chalk.yellow('📝 Uso: node mcp-system/set-huggingface-key.js --key hf-tu-token-aqui'));
  console.log(chalk.cyan('🔗 Obtén tu token en: https://huggingface.co/settings/tokens'));
  process.exit(1);
}

if (!apiKey.startsWith('hf_')) {
  console.log(chalk.red('❌ Error: El token debe empezar con "hf_"'));
  process.exit(1);
}

console.log(chalk.blue('🔧 Configurando Hugging Face API Key...'));

const configPath = path.join(process.cwd(), 'mcp-config.env');
let configContent = '';

if (fs.existsSync(configPath)) {
  configContent = fs.readFileSync(configPath, 'utf8');
}

// Actualizar o agregar la API Key
if (configContent.includes('HUGGINGFACE_API_KEY')) {
  configContent = configContent.replace(
    /HUGGINGFACE_API_KEY=.*/g,
    \`HUGGINGFACE_API_KEY=\${apiKey}\`
  );
  console.log(chalk.green('✅ API Key actualizada'));
} else {
  console.log(chalk.red('❌ Configuración de Hugging Face no encontrada'));
  console.log(chalk.yellow('📝 Ejecuta primero: node mcp-system/add-cloud-free-ai.js'));
  process.exit(1);
}

fs.writeFileSync(configPath, configContent);

console.log(chalk.green('✅ Hugging Face configurado exitosamente'));
console.log(chalk.cyan('🔑 Token: ' + apiKey.substring(0, 10) + '...'));

console.log(chalk.blue('\\n🧪 Para probar:'));
console.log(chalk.yellow('  node mcp-system/test-huggingface.js'));
`;

fs.writeFileSync('mcp-system/set-huggingface-key.js', setHuggingfaceScript);

// Crear script de prueba de Hugging Face
const testHuggingfaceScript = `#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🧪 Probando Hugging Face (IA Gratuita)...'));

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

const apiKey = config.HUGGINGFACE_API_KEY;
const model = config.HUGGINGFACE_MODEL || 'microsoft/DialoGPT-medium';

if (!apiKey || apiKey === 'your-huggingface-key-here') {
  console.log(chalk.red('❌ Hugging Face API Key no configurada'));
  console.log(chalk.yellow('📝 Ejecuta: node mcp-system/setup-huggingface.js'));
  process.exit(1);
}

if (!apiKey.startsWith('hf_')) {
  console.log(chalk.red('❌ Token inválido (debe empezar con hf_)'));
  process.exit(1);
}

console.log(chalk.green('✅ Token configurado correctamente'));
console.log(chalk.cyan('🔑 Token: ' + apiKey.substring(0, 10) + '...'));
console.log(chalk.cyan('🤖 Modelo: ' + model));

// Hacer una prueba real
async function testHuggingFace() {
  try {
    console.log(chalk.blue('\\n🧪 Probando conexión con Hugging Face...'));
    
    const response = await fetch(\`https://api-inference.huggingface.co/models/\${model}\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${apiKey}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: 'Hola, ¿cómo estás?'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(chalk.red('❌ Error en la respuesta:'));
      console.log(chalk.red('   Status: ' + response.status));
      console.log(chalk.red('   Error: ' + (errorData.error || 'Error desconocido')));
      return;
    }

    const data = await response.json();
    console.log(chalk.green('✅ Conexión exitosa con Hugging Face!'));
    console.log(chalk.cyan('🤖 Respuesta: ' + JSON.stringify(data[0]?.generated_text || data)));
    console.log(chalk.cyan('🚀 Hugging Face está funcionando correctamente'));

  } catch (error) {
    console.log(chalk.red('❌ Error de conexión: ' + error.message));
  }
}

testHuggingFace();
`;

fs.writeFileSync('mcp-system/test-huggingface.js', testHuggingfaceScript);

console.log(chalk.green('✅ Scripts de IA gratuita para nube creados'));
console.log(chalk.blue('\\n📋 COMANDOS DISPONIBLES:'));
console.log(chalk.yellow('  - Configurar Hugging Face: node mcp-system/setup-huggingface.js'));
console.log(chalk.yellow('  - Probar Hugging Face: node mcp-system/test-huggingface.js'));

console.log(chalk.blue('\\n🎯 PRÓXIMOS PASOS:'));
console.log(chalk.cyan('1. Ejecuta: node mcp-system/setup-huggingface.js'));
console.log(chalk.cyan('2. Crea cuenta en Hugging Face'));
console.log(chalk.cyan('3. Configura tu token'));
console.log(chalk.cyan('4. Prueba: node mcp-system/test-huggingface.js'));

console.log(chalk.green('\\n☁️ ¡IA gratuita para nube configurada!'));
