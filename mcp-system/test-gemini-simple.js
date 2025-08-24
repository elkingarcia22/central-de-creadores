#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🧪 Probando Gemini directamente...'));

// Cargar configuración
const configPath = path.join(process.cwd(), 'mcp-config.env');
const configContent = fs.readFileSync(configPath, 'utf8');
const lines = configContent.split('\n');
const config = {};

lines.forEach(line => {
  if (line.includes('=') && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    config[key.trim()] = value.trim();
  }
});

const apiKey = config.GEMINI_API_KEY;

if (!apiKey || apiKey === 'your-gemini-api-key-here') {
  console.log(chalk.red('❌ Gemini API Key no configurada'));
  process.exit(1);
}

console.log(chalk.green('✅ API Key encontrada'));
console.log(chalk.cyan('🔑 API Key: ' + apiKey.substring(0, 10) + '...'));

// Probar Gemini
async function testGemini() {
  try {
    console.log(chalk.blue('\n🧪 Haciendo prueba con Gemini...'));
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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

    console.log(chalk.cyan('📡 Status: ' + response.status));

    if (!response.ok) {
      const errorData = await response.json();
      console.log(chalk.red('❌ Error: ' + JSON.stringify(errorData, null, 2)));
      return;
    }

    const data = await response.json();
    console.log(chalk.cyan('📦 Respuesta completa: ' + JSON.stringify(data, null, 2)));

    const message = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (message) {
      console.log(chalk.green('✅ Gemini funciona correctamente!'));
      console.log(chalk.cyan('🤖 Respuesta: ' + message));
    } else {
      console.log(chalk.yellow('⚠️ Respuesta inesperada'));
    }

  } catch (error) {
    console.log(chalk.red('❌ Error de conexión: ' + error.message));
  }
}

testGemini();
