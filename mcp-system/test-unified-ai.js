#!/usr/bin/env node

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

    if (!stats.geminiConfigured && !stats.openaiConfigured) {
      console.log(chalk.red('❌ No hay API Keys configuradas'));
      return;
    }

    console.log(chalk.blue('\n🧪 Probando análisis con IA...'));
    const result = await ai.analyzeWithAI('Responde solo con "OK" si puedes leer este mensaje');
    
    console.log(chalk.green('✅ Funciona con: ' + result.provider));
    console.log(chalk.cyan('🤖 Respuesta: ' + result.response));
    
  } catch (error) {
    console.log(chalk.red('❌ Error: ' + error.message));
  }
}

test();
