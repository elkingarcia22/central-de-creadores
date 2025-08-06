#!/usr/bin/env node
/**
 * Script de prueba para verificar las funciones del MCP
 */

// Cargar variables de entorno
require('dotenv').config({ path: './mcp-config.env' });

// Importar las funciones del MCP
const mcpFunctions = require('./mcp-server-simple.js');

async function testMCPFunctions() {
  console.log('🧪 **PRUEBAS DEL MCP SERVER**\n');
  
  try {
    // 1. Probar conexión
    console.log('1️⃣ Probando conexión con Supabase...');
    const connectionResult = await mcpFunctions.testConnection();
    console.log(connectionResult);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 2. Analizar estructura de usuarios
    console.log('2️⃣ Analizando estructura de usuarios...');
    const structureResult = await mcpFunctions.analyzeUserStructure();
    console.log(structureResult);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 3. Optimizar consultas
    console.log('3️⃣ Optimizando consultas de usuarios...');
    const optimizeResult = await mcpFunctions.optimizeUserQueries();
    console.log(optimizeResult);
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 4. Generar documentación
    console.log('4️⃣ Generando documentación del sistema...');
    const docResult = await mcpFunctions.documentUserSystem();
    console.log(docResult);
    console.log('\n' + '='.repeat(50) + '\n');
    
    console.log('✅ **Todas las pruebas completadas exitosamente**');
    
  } catch (error) {
    console.error('❌ **Error en las pruebas**:', error.message);
  }
}

// Ejecutar pruebas
testMCPFunctions(); 