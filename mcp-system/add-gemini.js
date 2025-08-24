#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🤖 Agregando Google Gemini (Gratuito para nube)...'));

// Leer configuración actual
const configPath = path.join(process.cwd(), 'mcp-config.env');
let configContent = fs.readFileSync(configPath, 'utf8');

// Agregar configuración de Gemini
const geminiConfig = `
# ====================================
# CONFIGURACIÓN DE GOOGLE GEMINI (GRATUITO)
# ====================================

# Google Gemini API Key (Gratuito - 15K requests/día)
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-pro
GEMINI_DAILY_LIMIT=15000
GEMINI_RATE_LIMIT=60

`;

// Verificar si ya existe
if (configContent.includes('GEMINI_API_KEY')) {
  console.log(chalk.yellow('⚠️ Gemini ya está configurado'));
} else {
  configContent += geminiConfig;
  fs.writeFileSync(configPath, configContent);
  console.log(chalk.green('✅ Gemini agregado a la configuración'));
}

// Crear script simple para configurar
const setKeyScript = `#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const apiKey = process.argv[3];
if (!apiKey) {
  console.log(chalk.red('❌ Uso: node mcp-system/set-gemini-key.js --key tu-api-key'));
  console.log(chalk.cyan('🔗 Obtén tu API Key en: https://makersuite.google.com/app/apikey'));
  process.exit(1);
}

const configPath = path.join(process.cwd(), 'mcp-config.env');
let configContent = fs.readFileSync(configPath, 'utf8');

configContent = configContent.replace(
  /GEMINI_API_KEY=.*/g,
  \`GEMINI_API_KEY=\${apiKey}\`
);

fs.writeFileSync(configPath, configContent);
console.log(chalk.green('✅ Gemini API Key configurada'));
`;

fs.writeFileSync('mcp-system/set-gemini-key.js', setKeyScript);

console.log(chalk.green('✅ Gemini configurado'));
console.log(chalk.blue('\\n📋 Para configurar:'));
console.log(chalk.cyan('1. Ve a: https://makersuite.google.com/app/apikey'));
console.log(chalk.cyan('2. Crea tu API Key gratuita'));
console.log(chalk.cyan('3. Ejecuta: node mcp-system/set-gemini-key.js --key tu-api-key'));

console.log(chalk.green('\\n🚀 ¡Gemini listo para la nube!'));
