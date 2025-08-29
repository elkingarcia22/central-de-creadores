#!/usr/bin/env node

/**
 * Script para arreglar la persistencia del ancho del buscador en todos los componentes
 * 
 * Este script aplica las siguientes mejoras:
 * 1. Agrega useCallback para los manejadores de eventos
 * 2. Cambia w-[700px] por !w-[700px] para forzar el ancho
 * 3. Mejora la estabilidad del estado del buscador
 */

const fs = require('fs');
const path = require('path');

// Componentes a actualizar
const components = [
  'src/components/participantes/ParticipantesUnifiedContainer.tsx',
  'src/components/reclutamiento/ReclutamientoUnifiedContainer.tsx',
  'src/components/roles/RolesUnifiedContainer.tsx',
  'src/components/usuarios/UsuariosUnifiedContainer.tsx'
];

// Función para actualizar un componente
function updateComponent(filePath) {
  console.log(`🔄 Actualizando ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Agregar useCallback al import
    if (!content.includes('useCallback')) {
      content = content.replace(
        /import React, { useState, useMemo, useEffect } from 'react';/,
        "import React, { useState, useMemo, useEffect, useCallback } from 'react';"
      );
    }
    
    // 2. Agregar callbacks después del useEffect del Escape
    const escapeEffectPattern = /useEffect\(\(\) => \{\s*const handleEscape = \(e: KeyboardEvent\) => \{[\s\S]*?\}, \[isSearchExpanded\]\);/;
    
    if (escapeEffectPattern.test(content) && !content.includes('handleExpandSearch')) {
      const callbacks = `
  // Callbacks para manejar el estado del buscador
  const handleExpandSearch = useCallback(() => {
    setIsSearchExpanded(true);
  }, []);

  const handleCollapseSearch = useCallback(() => {
    setIsSearchExpanded(false);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, [setSearchTerm]);`;
      
      content = content.replace(
        escapeEffectPattern,
        (match) => match + callbacks
      );
    }
    
    // 3. Cambiar w-[700px] por !w-[700px] para forzar el ancho
    content = content.replace(
      /className="w-\[700px\] pl-10 pr-10 py-2"/g,
      'className="!w-[700px] pl-10 pr-10 py-2"'
    );
    
    // 4. Cambiar w-[600px] por !w-[600px] para usuarios
    content = content.replace(
      /className="w-\[600px\] pl-10 pr-10 py-2"/g,
      'className="!w-[600px] pl-10 pr-10 py-2"'
    );
    
    // 5. Actualizar los onClick handlers
    content = content.replace(
      /onClick=\{\(\) => setIsSearchExpanded\(true\)\}/g,
      'onClick={handleExpandSearch}'
    );
    
    content = content.replace(
      /onClick=\{\(\) => setIsSearchExpanded\(false\)\}/g,
      'onClick={handleCollapseSearch}'
    );
    
    // 6. Actualizar el onChange del input
    content = content.replace(
      /onChange=\{e => setSearchTerm\(e\.target\.value\)\}/g,
      'onChange={handleSearchChange}'
    );
    
    // Escribir el archivo actualizado
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath} actualizado correctamente`);
    
  } catch (error) {
    console.error(`❌ Error actualizando ${filePath}:`, error.message);
  }
}

// Función principal
function main() {
  console.log('🚀 Iniciando actualización de componentes para persistencia del ancho del buscador...\n');
  
  components.forEach(component => {
    const filePath = path.join(process.cwd(), component);
    if (fs.existsSync(filePath)) {
      updateComponent(filePath);
    } else {
      console.log(`⚠️  Archivo no encontrado: ${filePath}`);
    }
  });
  
  console.log('\n🎯 Actualización completada!');
  console.log('\n📋 Resumen de cambios aplicados:');
  console.log('1. ✅ Agregado useCallback para mejor rendimiento');
  console.log('2. ✅ Cambiado w-[700px] por !w-[700px] para forzar ancho');
  console.log('3. ✅ Cambiado w-[600px] por !w-[600px] para usuarios');
  console.log('4. ✅ Mejorados los manejadores de eventos');
  console.log('5. ✅ Optimizado el estado del buscador');
  
  console.log('\n🔧 Para verificar los cambios:');
  console.log('1. Reinicia el servidor de desarrollo');
  console.log('2. Prueba expandir el buscador en diferentes módulos');
  console.log('3. Verifica que el ancho se mantenga consistente');
  console.log('4. Prueba navegar entre páginas y volver');
}

// Ejecutar el script
if (require.main === module) {
  main();
}

module.exports = { updateComponent };
