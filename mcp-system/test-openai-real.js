#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🧪 Probando conexión real con OpenAI...'));

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
const model = config.OPENAI_MODEL || 'gpt-4';

if (!apiKey || apiKey === 'sk-your-openai-api-key-here') {
  console.log(chalk.red('❌ OpenAI API Key no configurada'));
  console.log(chalk.yellow('📝 Ejecuta: node mcp-system/set-openai-key.js --key sk-tu-api-key-aqui'));
  console.log(chalk.cyan('🔗 Obtén tu API Key en: https://platform.openai.com/api-keys'));
  process.exit(1);
}

if (!apiKey.startsWith('sk-')) {
  console.log(chalk.red('❌ API Key inválida (debe empezar con sk-)'));
  process.exit(1);
}

console.log(chalk.green('✅ API Key configurada correctamente'));
console.log(chalk.cyan('🔑 API Key: ' + apiKey.substring(0, 10) + '...'));
console.log(chalk.cyan('🤖 Modelo: ' + model));

// Hacer una prueba real con OpenAI
async function testOpenAI() {
  try {
    console.log(chalk.blue('\n🧪 Haciendo prueba real con OpenAI...'));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: 'Responde solo con "OK" si puedes leer este mensaje.'
          }
        ],
        max_tokens: 10,
        temperature: 0
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log(chalk.red('❌ Error en la respuesta de OpenAI:'));
      console.log(chalk.red('   Status: ' + response.status));
      console.log(chalk.red('   Error: ' + (errorData.error?.message || 'Error desconocido')));
      
      if (response.status === 401) {
        console.log(chalk.yellow('🔑 La API Key parece ser inválida'));
      } else if (response.status === 429) {
        console.log(chalk.yellow('⏰ Límite de rate excedido'));
      }
      return;
    }

    const data = await response.json();
    const message = data.choices[0]?.message?.content;
    
    if (message && message.trim().toLowerCase().includes('ok')) {
      console.log(chalk.green('✅ Conexión exitosa con OpenAI!'));
      console.log(chalk.cyan('🤖 Respuesta: ' + message));
      console.log(chalk.cyan('🚀 OpenAI está funcionando correctamente'));
    } else {
      console.log(chalk.yellow('⚠️ Respuesta inesperada: ' + message));
    }

  } catch (error) {
    console.log(chalk.red('❌ Error de conexión: ' + error.message));
    
    if (error.message.includes('fetch')) {
      console.log(chalk.yellow('🌐 Verifica tu conexión a internet'));
    }
  }
}

// Ejecutar la prueba
testOpenAI();
