const fs = require('fs');
const path = require('path');

class TokenTransformer {
  constructor() {
    this.primitiveTokens = {};
    this.semanticTokens = {};
    this.componentTokens = {};
  }

  // Cargar tokens primitivos
  loadPrimitiveTokens() {
    try {
      const primitivePath = path.join(__dirname, '../tokens/colors/primitive.json');
      const primitiveData = JSON.parse(fs.readFileSync(primitivePath, 'utf8'));
      this.primitiveTokens = primitiveData.color.primitive;
      console.log('✅ Tokens primitivos cargados');
    } catch (error) {
      console.error('❌ Error cargando tokens primitivos:', error.message);
    }
  }

  // Cargar tokens semánticos
  loadSemanticTokens() {
    try {
      const semanticPath = path.join(__dirname, '../tokens/colors/semantic.json');
      const semanticData = JSON.parse(fs.readFileSync(semanticPath, 'utf8'));
      this.semanticTokens = semanticData.color.semantic;
      console.log('✅ Tokens semánticos cargados');
    } catch (error) {
      console.error('❌ Error cargando tokens semánticos:', error.message);
    }
  }

  // Cargar tokens de componentes
  loadComponentTokens() {
    try {
      const componentPath = path.join(__dirname, '../tokens/colors/component.json');
      const componentData = JSON.parse(fs.readFileSync(componentPath, 'utf8'));
      this.componentTokens = componentData.color.component;
      console.log('✅ Tokens de componentes cargados');
    } catch (error) {
      console.error('❌ Error cargando tokens de componentes:', error.message);
    }
  }

  // Resolver referencias en tokens
  resolveReferences(tokenValue) {
    if (typeof tokenValue === 'string' && tokenValue.includes('{')) {
      // Extraer la referencia del token
      const reference = tokenValue.match(/\{([^}]+)\}/)?.[1];
      if (reference) {
        const parts = reference.split('.');
        let current = this.primitiveTokens;
        
        for (const part of parts.slice(2)) { // Saltar 'color.primitive'
          if (current[part]) {
            current = current[part];
          } else {
            return tokenValue; // Si no se encuentra, devolver el valor original
          }
        }
        
        if (current.value) {
          return current.value;
        }
      }
    }
    return tokenValue;
  }

  // Generar CSS variables con valores resueltos
  generateCSSVariables() {
    let css = ':root {\n';
    
    // Generar variables para modo claro
    css += '  /* === MODO CLARO === */\n';
    for (const [key, value] of Object.entries(this.semanticTokens.light)) {
      const resolvedValue = this.resolveReferences(value.value);
      css += `  --${key}: ${resolvedValue};\n`;
    }
    
    css += '\n  /* === MODO OSCURO === */\n';
    css += '  .dark {\n';
    for (const [key, value] of Object.entries(this.semanticTokens.dark)) {
      const resolvedValue = this.resolveReferences(value.value);
      css += `    --${key}: ${resolvedValue};\n`;
    }
    css += '  }\n';
    css += '}\n';
    
    return css;
  }

  // Generar configuración de Tailwind
  generateTailwindConfig() {
    let config = 'module.exports = {\n';
    config += '  theme: {\n';
    config += '    extend: {\n';
    config += '      colors: {\n';
    
    // Agregar colores semánticos
    for (const [key, value] of Object.entries(this.semanticTokens.light)) {
      config += `        '${key}': 'rgb(var(--${key}))',\n`;
    }
    
    config += '      },\n';
    config += '    },\n';
    config += '  },\n';
    config += '};\n';
    
    return config;
  }

  // Transformar y generar archivos
  transform() {
    console.log('�� Iniciando transformación de tokens...\n');
    
    this.loadPrimitiveTokens();
    this.loadSemanticTokens();
    this.loadComponentTokens();
    
    // Generar CSS variables
    const cssVariables = this.generateCSSVariables();
    const cssPath = path.join(__dirname, '../../../src/styles/design-tokens.css');
    fs.writeFileSync(cssPath, cssVariables);
    console.log('✅ CSS variables generadas en:', cssPath);
    
    // Generar configuración de Tailwind
    const tailwindConfig = this.generateTailwindConfig();
    const tailwindPath = path.join(__dirname, '../../../tailwind.tokens.js');
    fs.writeFileSync(tailwindPath, tailwindConfig);
    console.log('✅ Configuración de Tailwind generada en:', tailwindPath);
    
    console.log('\n🎉 Transformación completada exitosamente!');
  }
}

// Ejecutar transformador si se llama directamente
if (require.main === module) {
  const transformer = new TokenTransformer();
  transformer.transform();
}

module.exports = TokenTransformer;
