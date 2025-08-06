#!/usr/bin/env node

// ====================================
// PRUEBA DEL API DE DEPARTAMENTOS
// ====================================

const fetch = require('node-fetch');

async function probarAPI() {
  console.log('🧪 INICIANDO PRUEBAS DEL API...\n');

  const baseURL = 'http://localhost:3000';

  try {
    // PRUEBA 1: API de departamentos
    console.log('📋 PRUEBA 1: API /api/departamentos');
    const responseDepartamentos = await fetch(`${baseURL}/api/departamentos`);
    const dataDepartamentos = await responseDepartamentos.json();
    
    console.log('Status:', responseDepartamentos.status);
    console.log('Data:', JSON.stringify(dataDepartamentos, null, 2));
    console.log('✅ Departamento API:', responseDepartamentos.ok ? 'FUNCIONA' : 'FALLA');
    console.log('');

    // PRUEBA 2: API de participantes internos
    console.log('👥 PRUEBA 2: API /api/participantes-internos');
    const responseParticipantes = await fetch(`${baseURL}/api/participantes-internos`);
    const dataParticipantes = await responseParticipantes.json();
    
    console.log('Status:', responseParticipantes.status);
    console.log('Data:', JSON.stringify(dataParticipantes, null, 2));
    console.log('✅ Participantes API:', responseParticipantes.ok ? 'FUNCIONA' : 'FALLA');
    console.log('');

    // PRUEBA 3: Verificar estructura de datos
    if (dataDepartamentos && Array.isArray(dataDepartamentos)) {
      console.log('📊 ANÁLISIS DE DATOS DE DEPARTAMENTOS:');
      console.log('- Total departamentos:', dataDepartamentos.length);
      if (dataDepartamentos.length > 0) {
        console.log('- Primer departamento:', dataDepartamentos[0]);
        console.log('- Campos disponibles:', Object.keys(dataDepartamentos[0]));
      }
    }

    if (dataParticipantes && Array.isArray(dataParticipantes)) {
      console.log('\n📊 ANÁLISIS DE DATOS DE PARTICIPANTES:');
      console.log('- Total participantes:', dataParticipantes.length);
      if (dataParticipantes.length > 0) {
        console.log('- Primer participante:', dataParticipantes[0]);
        console.log('- Campos disponibles:', Object.keys(dataParticipantes[0]));
        
        // Verificar si tiene departamento
        const primerParticipante = dataParticipantes[0];
        if (primerParticipante.departamentos) {
          console.log('- Departamento del primer participante:', primerParticipante.departamentos);
        } else {
          console.log('- ❌ NO TIENE DEPARTAMENTO ASOCIADO');
        }
      }
    }

  } catch (error) {
    console.error('❌ ERROR EN LA PRUEBA:', error.message);
  }
}

// Ejecutar la prueba
probarAPI(); 