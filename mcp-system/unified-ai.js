#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

console.log(chalk.blue('🤖 Creando sistema de IA unificado (OpenAI + Gemini)...'));

// Sistema de IA unificado simple
const unifiedAI = `class UnifiedAISystem {
  constructor() {
    this.config = this.loadConfig();
    this.currentProvider = this.config.DEFAULT_AI_PROVIDER || 'gemini';
  }

  loadConfig() {
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

    return config;
  }

  async analyzeWithAI(prompt, options = {}) {
    const provider = options.provider || this.currentProvider;
    
    try {
      if (provider === 'openai') {
        return await this.analyzeWithOpenAI(prompt, options);
      } else if (provider === 'gemini') {
        return await this.analyzeWithGemini(prompt, options);
      }
    } catch (error) {
      // Fallback automático
      if (provider === 'openai' && this.config.GEMINI_API_KEY) {
        return await this.analyzeWithGemini(prompt, options);
      } else if (provider === 'gemini' && this.config.OPENAI_API_KEY) {
        return await this.analyzeWithOpenAI(prompt, options);
      }
      throw error;
    }
  }

  async analyzeWithOpenAI(prompt, options = {}) {
    const apiKey = this.config.OPENAI_API_KEY;
    const model = options.model || this.config.OPENAI_MODEL || 'gpt-4';
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${apiKey}\`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7
      })
    });

    const data = await response.json();
    return {
      provider: 'openai',
      response: data.choices[0]?.message?.content
    };
  }

  async analyzeWithGemini(prompt, options = {}) {
    const apiKey = this.config.GEMINI_API_KEY;
    const model = options.model || this.config.GEMINI_MODEL || 'gemini-pro';
    
    const response = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/\${model}:generateContent?key=\${apiKey}\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: options.maxTokens || 2048,
          temperature: options.temperature || 0.7
        }
      })
    });

    const data = await response.json();
    return {
      provider: 'gemini',
      response: data.candidates[0]?.content?.parts[0]?.text
    };
  }

  setProvider(provider) {
    this.currentProvider = provider;
  }

  getUsageStats() {
    return {
      currentProvider: this.currentProvider,
      openaiConfigured: !!(this.config.OPENAI_API_KEY && this.config.OPENAI_API_KEY !== 'sk-your-openai-api-key-here'),
      geminiConfigured: !!(this.config.GEMINI_API_KEY && this.config.GEMINI_API_KEY !== 'your-gemini-api-key-here')
    };
  }
}

export { UnifiedAISystem };
`;

fs.writeFileSync('mcp-system/unified-ai-system.js', unifiedAI);

// Crear script de prueba
const testScript = `#!/usr/bin/env node

import { UnifiedAISystem } from './unified-ai-system.js';
import chalk from 'chalk';

console.log(chalk.blue('🧪 Probando sistema de IA unificado...'));

async function test() {
  try {
    const ai = new UnifiedAISystem();
    const stats = ai.getUsageStats();
    
    console.log(chalk.cyan('📊 Configuración:'));
    console.log(chalk.cyan('   OpenAI: ' + stats.openaiConfigured));
    console.log(chalk.cyan('   Gemini: ' + stats.geminiConfigured));
    console.log(chalk.cyan('   Actual: ' + stats.currentProvider));

    const result = await ai.analyzeWithAI('Responde solo con "OK" si funciona');
    console.log(chalk.green('✅ Funciona con: ' + result.provider));
    
  } catch (error) {
    console.log(chalk.red('❌ Error: ' + error.message));
  }
}

test();
`;

fs.writeFileSync('mcp-system/test-unified-ai.js', testScript);

console.log(chalk.green('✅ Sistema de IA unificado creado'));
console.log(chalk.blue('\\n📋 Para probar:'));
console.log(chalk.yellow('  node mcp-system/test-unified-ai.js'));

console.log(chalk.green('\\n🚀 ¡Ahora el MCP funciona con OpenAI Y Gemini!'));
