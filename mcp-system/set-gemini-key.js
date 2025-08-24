#!/usr/bin/env node
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
  `GEMINI_API_KEY=${apiKey}`
);

fs.writeFileSync(configPath, configContent);
console.log(chalk.green('✅ Gemini API Key configurada'));
