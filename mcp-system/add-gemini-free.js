#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🤖 Configurando Google Gemini (Gratuito para nube)...'));

// Verificar configuración actual
const configPath = path.join(process.cwd(), 'mcp-config.env');
let configContent = '';

if (fs.existsSync(configPath)) {
  configContent = fs.readFileSync(configPath, 'utf8');
}

// Agregar configuración de Gemini
const geminiConfig = `
# ====================================
# CONFIGURACIÓN DE GOOGLE GEMINI (GRATUITO)
# ====================================

# Google Gemini API Key (Gratuito)
GEMINI_API_KEY=your-gemini-api-key-here

# Modelo de Gemini a usar
GEMINI_MODEL=gemini-pro

# Configuración de límites gratuitos
GEMINI_DAILY_LIMIT=15000
GEMINI_RATE_LIMIT=60

# Configuración de respuestas
GEMINI_MAX_TOKENS=2048
GEMINI_TEMPERATURE=0.7

# Configuración de seguridad
GEMINI_SAFETY_SETTINGS=block_none

`;

// Verificar si ya existe configuración de Gemini
if (configContent.includes('GEMINI_API_KEY')) {
  console.log(chalk.yellow('⚠️ Gemini ya está configurado'));
} else {
  configContent += geminiConfig;
  fs.writeFileSync(configPath, configContent);
  console.log(chalk.green('✅ Configuración de Gemini agregada'));
}

// Crear script para configurar Gemini API Key
const setGeminiKeyScript = `#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

// Obtener la API Key del argumento
const apiKey = process.argv[3];

if (!apiKey) {
  console.log(chalk.red('❌ Error: Debes proporcionar tu Gemini API Key'));
  console.log(chalk.yellow('📝 Uso: node mcp-system/set-gemini-key.js --key tu-api-key-aqui'));
  console.log(chalk.cyan('🔗 Obtén tu API Key en: https://makersuite.google.com/app/apikey'));
  process.exit(1);
}

console.log(chalk.blue('🔧 Configurando Gemini API Key...'));

// Leer configuración actual
const configPath = path.join(process.cwd(), 'mcp-config.env');
let configContent = fs.readFileSync(configPath, 'utf8');

// Reemplazar o agregar la API Key
if (configContent.includes('GEMINI_API_KEY')) {
  configContent = configContent.replace(
    /GEMINI_API_KEY=.*/g,
    \`GEMINI_API_KEY=\${apiKey}\`
  );
  console.log(chalk.green('✅ API Key actualizada'));
} else {
  console.log(chalk.red('❌ Configuración de Gemini no encontrada'));
  process.exit(1);
}

// Guardar configuración
fs.writeFileSync(configPath, configContent);
console.log(chalk.green('✅ Gemini API Key configurada'));
console.log(chalk.cyan('🔑 API Key: ' + apiKey.substring(0, 10) + '...'));
`;

fs.writeFileSync('mcp-system/set-gemini-key.js', setGeminiKeyScript);

// Crear script de prueba de Gemini
const testGeminiScript = `#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🧪 Probando conexión con Google Gemini...'));

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

const apiKey = config.GEMINI_API_KEY;
const model = config.GEMINI_MODEL || 'gemini-pro';

if (!apiKey || apiKey === 'your-gemini-api-key-here') {
  console.log(chalk.red('❌ Gemini API Key no configurada'));
  console.log(chalk.yellow('📝 Ejecuta: node mcp-system/set-gemini-key.js --key tu-api-key-aqui'));
  console.log(chalk.cyan('🔗 Obtén tu API Key en: https://makersuite.google.com/app/apikey'));
  process.exit(1);
}

console.log(chalk.green('✅ API Key configurada correctamente'));
console.log(chalk.cyan('🔑 API Key: ' + apiKey.substring(0, 10) + '...'));
console.log(chalk.cyan('🤖 Modelo: ' + model));

// Hacer prueba real con Gemini
async function testGemini() {
  try {
    console.log(chalk.blue('\\n🧪 Haciendo prueba real con Gemini...'));
    
    const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${model}:generateContent?key=\${apiKey}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Responde solo con "OK" si puedes leer este mensaje.'
          }]
        }],
        generationConfig: {
          maxOutputTokens: 10,
          temperature: 0
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(chalk.red('❌ Error en la respuesta de Gemini:'));
      console.log(chalk.red('   Status: ' + response.status));
      console.log(chalk.red('   Error: ' + (errorData.error?.message || 'Error desconocido')));
      return;
    }

    const data = await response.json();
    const message = data.candidates[0]?.content?.parts[0]?.text;
    
    if (message && message.trim().toLowerCase().includes('ok')) {
      console.log(chalk.green('✅ Conexión exitosa con Gemini!'));
      console.log(chalk.cyan('🤖 Respuesta: ' + message));
      console.log(chalk.cyan('🚀 Gemini está funcionando correctamente'));
    } else {
      console.log(chalk.yellow('⚠️ Respuesta inesperada: ' + message));
    }

  } catch (error) {
    console.log(chalk.red('❌ Error de conexión: ' + error.message));
  }
}

testGemini();
`;

fs.writeFileSync('mcp-system/test-gemini.js', testGeminiScript);

// Crear documentación de Gemini
const geminiDocs = `# 🤖 GOOGLE GEMINI (GRATUITO PARA NUBE)

## ✅ Ventajas de Gemini:

- 🆓 **100% Gratuito** con límites generosos
- ☁️ **Funciona en la nube** (perfecto para producción)
- 🚀 **Muy rápido** y confiable
- 🔒 **Seguro** (Google)
- 📊 **15,000 requests gratuitos por día**
- 🌍 **Disponible globalmente**

## 🔑 Cómo obtener API Key:

1. Ve a: https://makersuite.google.com/app/apikey
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Create API Key"
4. Copia la API Key

## ⚙️ Configuración:

\`\`\`bash
# Configurar API Key
node mcp-system/set-gemini-key.js --key tu-api-key-aqui

# Probar conexión
node mcp-system/test-gemini.js
\`\`\`

## 📊 Límites Gratuitos:

- **Requests por día:** 15,000
- **Requests por minuto:** 60
- **Tokens por request:** 2,048
- **Modelos disponibles:** gemini-pro, gemini-pro-vision

## 🎯 Comparación con OpenAI:

| Característica | OpenAI | Gemini |
|----------------|--------|--------|
| Costo | $0.03/1K tokens | Gratuito |
| Límite diario | $5 crédito | 15K requests |
| Velocidad | Media | Muy rápida |
| Calidad | Alta | Alta |
| Nube | ✅ | ✅ |

## 🚀 Recomendación:

**Para producción:** Gemini es la mejor opción gratuita
**Para desarrollo:** Combinar OpenAI + Gemini
`;

fs.writeFileSync('mcp-system/GEMINI_SETUP.md', geminiDocs);

console.log(chalk.green('✅ Gemini configurado exitosamente'));
console.log(chalk.blue('\\n📋 COMANDOS DISPONIBLES:'));
console.log(chalk.yellow('  - Configurar API Key: node mcp-system/set-gemini-key.js --key tu-api-key'));
console.log(chalk.yellow('  - Probar Gemini: node mcp-system/test-gemini.js'));

console.log(chalk.blue('\\n🎯 PRÓXIMOS PASOS:'));
console.log(chalk.cyan('1. Ve a: https://makersuite.google.com/app/apikey'));
console.log(chalk.cyan('2. Crea tu API Key gratuita'));
console.log(chalk.cyan('3. Ejecuta: node mcp-system/set-gemini-key.js --key tu-api-key'));
console.log(chalk.cyan('4. Prueba: node mcp-system/test-gemini.js'));

console.log(chalk.green('\\n🚀 ¡Gemini listo para usar en la nube!'));
