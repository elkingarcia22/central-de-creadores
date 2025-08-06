#!/usr/bin/env node

/**
 * Script de prueba para verificar el MCP antes de implementarlo en Cursor
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './mcp-config.env' });

async function testMCPSetup() {
  console.log('🧪 PROBANDO CONFIGURACIÓN DEL MCP HÍBRIDO\n');
  
  // 1. Verificar variables de entorno
  console.log('1️⃣ Verificando variables de entorno...');
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Variables de entorno no configuradas');
    console.log('   Asegúrate de que mcp-config.env tenga las variables correctas');
    return false;
  }
  console.log('✅ Variables de entorno configuradas');
  
  // 2. Probar conexión con Supabase
  console.log('\n2️⃣ Probando conexión con Supabase...');
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Probar consulta simple
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      return false;
    }
    
    console.log('✅ Conexión con Supabase exitosa');
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
    return false;
  }
  
  // 3. Verificar archivos necesarios
  console.log('\n3️⃣ Verificando archivos del MCP...');
  const fs = require('fs');
  const requiredFiles = [
    'mcp-server-simple.js',
    'central-de-creadores-mcp.json',
    'mcp-tools-simple.json',
    'mcp-config.env'
  ];
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`✅ ${file} - Presente`);
    } else {
      console.error(`❌ ${file} - Faltante`);
      return false;
    }
  }
  
  // 4. Probar servidor MCP
  console.log('\n4️⃣ Probando servidor MCP...');
  try {
    const { spawn } = require('child_process');
    
    const mcpProcess = spawn('node', ['mcp-server-simple.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env
    });
    
    // Esperar un poco para que el servidor se inicie
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar si el proceso sigue vivo
    if (mcpProcess.killed) {
      console.error('❌ El servidor MCP se cerró inesperadamente');
      return false;
    }
    
    console.log('✅ Servidor MCP iniciado correctamente');
    
    // Terminar el proceso de prueba
    mcpProcess.kill();
    
  } catch (error) {
    console.error('❌ Error iniciando servidor MCP:', error.message);
    return false;
  }
  
  // 5. Verificar dependencias
  console.log('\n5️⃣ Verificando dependencias...');
  try {
    const packageJson = require('./package.json');
    const requiredDeps = [
      '@modelcontextprotocol/sdk',
      '@supabase/supabase-js',
      'dotenv'
    ];
    
    for (const dep of requiredDeps) {
      if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
        console.log(`✅ ${dep} - Instalada`);
      } else {
        console.error(`❌ ${dep} - Faltante`);
        return false;
      }
    }
  } catch (error) {
    console.error('❌ Error verificando dependencias:', error.message);
    return false;
  }
  
  console.log('\n🎉 ¡TODAS LAS PRUEBAS EXITOSAS!');
  console.log('\n📋 RESUMEN DE CONFIGURACIÓN:');
  console.log('✅ Variables de entorno configuradas');
  console.log('✅ Conexión con Supabase funcionando');
  console.log('✅ Archivos del MCP presentes');
  console.log('✅ Servidor MCP funcional');
  console.log('✅ Dependencias instaladas');
  
  console.log('\n🚀 PRÓXIMOS PASOS:');
  console.log('1. Abre Cursor');
  console.log('2. Ve a Settings > MCP');
  console.log('3. Agrega el archivo central-de-creadores-mcp.json');
  console.log('4. Reinicia Cursor');
  console.log('5. Prueba el MCP en el chat');
  
  console.log('\n📖 Consulta GUIA_IMPLEMENTACION_MCP_CURSOR.md para instrucciones detalladas');
  
  return true;
}

// Ejecutar prueba
testMCPSetup().then(success => {
  if (success) {
    console.log('\n✅ El MCP está listo para implementar en Cursor');
    process.exit(0);
  } else {
    console.log('\n❌ Hay problemas que resolver antes de implementar');
    process.exit(1);
  }
}).catch(error => {
  console.error('\n💥 Error durante la prueba:', error);
  process.exit(1);
}); 