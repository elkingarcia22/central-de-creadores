import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';

/**
 * TOKEN MANAGER - Gestor de Design Tokens Semánticos
 * 
 * Responsabilidades:
 * - Gestión de design tokens semánticos
 * - Validación de tokens
 * - Mapeo de tokens entre sistemas
 * - Generación de temas
 * - Propagación automática de cambios
 */
export class TokenManager {
  constructor(baseDir) {
    this.baseDir = baseDir;
    this.projectRoot = path.join(baseDir, '../../..');
    this.tokensDir = path.join(this.projectRoot, 'src/design-system/tokens');
    this.themesDir = path.join(this.projectRoot, 'src/design-system/themes');
    
    this.initializeTokenSystem();
  }

  async initializeTokenSystem() {
    try {
      await fs.mkdir(this.tokensDir, { recursive: true });
      await fs.mkdir(this.themesDir, { recursive: true });
      
      // Crear archivos de tokens si no existen
      await this.ensureTokenFiles();
      
    } catch (error) {
      console.error('Error inicializando sistema de tokens:', error);
    }
  }

  async ensureTokenFiles() {
    const tokenFiles = {
      'colors.json': this.getDefaultColors(),
      'typography.json': this.getDefaultTypography(),
      'spacing.json': this.getDefaultSpacing(),
      'shadows.json': this.getDefaultShadows(),
      'semantic.json': this.getDefaultSemanticTokens()
    };

    for (const [filename, content] of Object.entries(tokenFiles)) {
      const filePath = path.join(this.tokensDir, filename);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, JSON.stringify(content, null, 2));
      }
    }
  }

  /**
   * Crear sistema completo de design tokens
   */
  async createTokenSystem(config) {
    const { brand_colors, semantic_colors, typography_scale, spacing_scale } = config;
    
    try {
      // 1. Crear tokens de colores
      const colorTokens = await this.createColorTokens(brand_colors, semantic_colors);
      
      // 2. Crear tokens tipográficos
      const typographyTokens = await this.createTypographyTokens(typography_scale);
      
      // 3. Crear tokens de espaciado
      const spacingTokens = await this.createSpacingTokens(spacing_scale);
      
      // 4. Crear tokens semánticos
      const semanticTokens = await this.createSemanticTokens({
        colors: colorTokens,
        typography: typographyTokens,
        spacing: spacingTokens
      });
      
      // 5. Guardar todos los tokens
      await this.saveTokenSystem({
        colors: colorTokens,
        typography: typographyTokens,
        spacing: spacingTokens,
        semantic: semanticTokens
      });
      
      return {
        colors: colorTokens,
        typography: typographyTokens,
        spacing: spacingTokens,
        semantic: semanticTokens
      };
      
    } catch (error) {
      console.error('Error creando sistema de tokens:', error);
      throw error;
    }
  }

  /**
   * Actualizar design token
   */
  async updateToken(tokenPath, newValue) {
    try {
      const [category, ...pathParts] = tokenPath.split('.');
      const tokenFile = path.join(this.tokensDir, `${category}.json`);
      
      // Leer archivo de tokens
      const tokenData = JSON.parse(await fs.readFile(tokenFile, 'utf8'));
      
      // Actualizar valor usando path
      this.updateNestedValue(tokenData, pathParts, newValue);
      
      // Guardar archivo actualizado
      await fs.writeFile(tokenFile, JSON.stringify(tokenData, null, 2));
      
      // Validar token actualizado
      const validation = await this.validateToken(tokenPath, newValue);
      
      console.log(`✅ Token actualizado: ${tokenPath} = ${newValue}`);
      
      return {
        token_path: tokenPath,
        new_value: newValue,
        validation,
        updated_at: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Error actualizando token:', error);
      throw error;
    }
  }

  /**
   * Validar design token
   */
  async validateToken(tokenPath, value) {
    const validation = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };
    
    try {
      // Validar formato del path
      if (!tokenPath.includes('.')) {
        validation.valid = false;
        validation.errors.push('Token path debe tener formato: category.subcategory.property');
      }
      
      // Validar valor según tipo de token
      const [category] = tokenPath.split('.');
      
      switch (category) {
        case 'colors':
          validation.valid = this.validateColorValue(value) && validation.valid;
          break;
        case 'typography':
          validation.valid = this.validateTypographyValue(value) && validation.valid;
          break;
        case 'spacing':
          validation.valid = this.validateSpacingValue(value) && validation.valid;
          break;
        case 'shadows':
          validation.valid = this.validateShadowValue(value) && validation.valid;
          break;
        default:
          validation.warnings.push(`Categoría de token desconocida: ${category}`);
      }
      
      // Verificar consistencia con sistema existente
      const consistencyCheck = await this.checkTokenConsistency(tokenPath, value);
      validation.suggestions.push(...consistencyCheck.suggestions);
      
      return validation;
      
    } catch (error) {
      validation.valid = false;
      validation.errors.push(`Error validando token: ${error.message}`);
      return validation;
    }
  }

  /**
   * Mapear estilos a tokens existentes
   */
  async mapToExistingTokens(styles) {
    const mappedTokens = {};
    const allTokens = await this.loadAllTokens();
    
    for (const [property, value] of Object.entries(styles)) {
      const mappedToken = this.findClosestToken(value, allTokens);
      if (mappedToken) {
        mappedTokens[property] = mappedToken;
      } else {
        // Crear nuevo token si no existe uno similar
        const newToken = await this.createNewToken(property, value);
        mappedTokens[property] = newToken;
      }
    }
    
    return mappedTokens;
  }

  /**
   * Validar tokens en componente
   */
  async validateComponentTokens(componentCode) {
    const validation = {
      valid: true,
      violations: [],
      suggestions: [],
      token_usage: {}
    };
    
    try {
      // Buscar valores hardcodeados en el código
      const hardcodedValues = this.extractHardcodedValues(componentCode);
      
      // Verificar si los valores hardcodeados deberían usar tokens
      for (const [property, value] of Object.entries(hardcodedValues)) {
        const shouldUseToken = this.shouldUseToken(property, value);
        
        if (shouldUseToken) {
          validation.violations.push({
            type: 'token_usage',
            property,
            value,
            suggestion: `Usar design token en lugar de valor hardcodeado: ${value}`,
            severity: 'medium'
          });
        }
      }
      
      // Contar uso de tokens
      const tokenUsage = this.extractTokenUsage(componentCode);
      validation.token_usage = tokenUsage;
      
      // Verificar consistencia de tokens usados
      const consistencyCheck = await this.checkComponentTokenConsistency(tokenUsage);
      validation.suggestions.push(...consistencyCheck.suggestions);
      
      validation.valid = validation.violations.length === 0;
      
      return validation;
      
    } catch (error) {
      validation.valid = false;
      validation.violations.push({
        type: 'error',
        message: `Error validando tokens: ${error.message}`,
        severity: 'high'
      });
      
      return validation;
    }
  }

  /**
   * Generar temas
   */
  async generateThemes(tokenSystem) {
    const themes = {
      light: this.generateLightTheme(tokenSystem),
      dark: this.generateDarkTheme(tokenSystem),
      custom: this.generateCustomTheme(tokenSystem)
    };
    
    // Guardar temas
    for (const [themeName, themeData] of Object.entries(themes)) {
      const themePath = path.join(this.themesDir, `${themeName}.json`);
      await fs.writeFile(themePath, JSON.stringify(themeData, null, 2));
    }
    
    return themes;
  }

  /**
   * Generar CSS desde tokens
   */
  async generateCSS(tokenSystem, themes) {
    const cssFiles = {};
    
    try {
      // Generar CSS para cada tema
      for (const [themeName, themeData] of Object.entries(themes)) {
        const cssContent = this.generateCSSFromTokens(themeData);
        const cssPath = path.join(this.projectRoot, `src/styles/${themeName}.css`);
        
        await fs.writeFile(cssPath, cssContent);
        cssFiles[themeName] = cssPath;
      }
      
      // Generar CSS variables para tokens
      const cssVariables = this.generateCSSVariables(tokenSystem);
      const variablesPath = path.join(this.projectRoot, 'src/styles/tokens.css');
      
      await fs.writeFile(variablesPath, cssVariables);
      cssFiles.variables = variablesPath;
      
      return cssFiles;
      
    } catch (error) {
      console.error('Error generando CSS:', error);
      throw error;
    }
  }

  // Métodos auxiliares

  getDefaultColors() {
    return {
      brand: {
        primary: '#3B82F6',
        secondary: '#8B5CF6',
        accent: '#10B981'
      },
      semantic: {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
      },
      neutral: {
        white: '#FFFFFF',
        black: '#000000',
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        }
      }
    };
  }

  getDefaultTypography() {
    return {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700'
      }
    };
  }

  getDefaultSpacing() {
    return {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem'
    };
  }

  getDefaultShadows() {
    return {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
    };
  }

  getDefaultSemanticTokens() {
    return {
      color: {
        semantic: {
          action: {
            primary: {
              default: '{color.brand.primary}',
              hover: '{color.brand.primary}',
              active: '{color.brand.primary}',
              disabled: '{color.neutral.gray.300}'
            },
            secondary: {
              default: '{color.neutral.gray.500}',
              hover: '{color.neutral.gray.600}',
              active: '{color.neutral.gray.700}'
            },
            destructive: {
              default: '{color.semantic.error}',
              hover: '{color.semantic.error}',
              active: '{color.semantic.error}'
            }
          },
          feedback: {
            error: '{color.semantic.error}',
            warning: '{color.semantic.warning}',
            success: '{color.semantic.success}',
            info: '{color.semantic.info}'
          },
          surface: {
            background: '{color.neutral.white}',
            card: '{color.neutral.gray.50}',
            overlay: 'rgba(0, 0, 0, 0.5)',
            elevated: '{color.neutral.white}'
          },
          content: {
            primary: '{color.neutral.gray.900}',
            secondary: '{color.neutral.gray.600}',
            tertiary: '{color.neutral.gray.400}',
            inverse: '{color.neutral.white}'
          }
        }
      }
    };
  }

  updateNestedValue(obj, pathParts, value) {
    let current = obj;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[pathParts[pathParts.length - 1]] = value;
  }

  validateColorValue(value) {
    // Validar formato de color (hex, rgb, rgba, hsl, hsla)
    const colorRegex = /^(#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)|hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)|hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\))$/;
    return colorRegex.test(value);
  }

  validateTypographyValue(value) {
    // Validar valores tipográficos
    return typeof value === 'string' && value.length > 0;
  }

  validateSpacingValue(value) {
    // Validar valores de espaciado (rem, px, em, etc.)
    const spacingRegex = /^\d+(\.\d+)?(rem|px|em|%|vh|vw)$/;
    return spacingRegex.test(value);
  }

  validateShadowValue(value) {
    // Validar valores de sombra
    return typeof value === 'string' && value.includes('shadow');
  }

  async checkTokenConsistency(tokenPath, value) {
    const suggestions = [];
    const allTokens = await this.loadAllTokens();
    
    // Buscar tokens similares
    const similarTokens = this.findSimilarTokens(value, allTokens);
    
    if (similarTokens.length > 0) {
      suggestions.push(`Considerar usar token existente: ${similarTokens[0].path}`);
    }
    
    return { suggestions };
  }

  findClosestToken(value, allTokens) {
    // Implementar lógica para encontrar el token más cercano
    // Por ahora, retornar null para crear nuevo token
    return null;
  }

  async createNewToken(property, value) {
    const tokenName = this.generateTokenName(property, value);
    const tokenPath = `custom.${tokenName}`;
    
    // Crear nuevo token
    await this.updateToken(tokenPath, value);
    
    return tokenPath;
  }

  generateTokenName(property, value) {
    // Generar nombre de token basado en propiedad y valor
    const baseName = property.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
    const hash = createHash('md5').update(value).digest('hex').substring(0, 4);
    return `${baseName}-${hash}`;
  }

  extractHardcodedValues(componentCode) {
    const hardcodedValues = {};
    
    // Buscar valores de color hardcodeados
    const colorMatches = componentCode.match(/#[A-Fa-f0-9]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g);
    if (colorMatches) {
      hardcodedValues.colors = colorMatches;
    }
    
    // Buscar valores de espaciado hardcodeados
    const spacingMatches = componentCode.match(/\d+(\.\d+)?(rem|px|em|%|vh|vw)/g);
    if (spacingMatches) {
      hardcodedValues.spacing = spacingMatches;
    }
    
    return hardcodedValues;
  }

  shouldUseToken(property, value) {
    // Determinar si un valor debería usar un token
    const tokenCandidates = ['color', 'background', 'border', 'padding', 'margin', 'font-size'];
    return tokenCandidates.some(candidate => property.includes(candidate));
  }

  extractTokenUsage(componentCode) {
    const tokenUsage = {};
    
    // Buscar uso de tokens en el código
    const tokenMatches = componentCode.match(/\{[\w.]+}/g);
    if (tokenMatches) {
      tokenMatches.forEach(token => {
        const cleanToken = token.replace(/[{}]/g, '');
        tokenUsage[cleanToken] = (tokenUsage[cleanToken] || 0) + 1;
      });
    }
    
    return tokenUsage;
  }

  async checkComponentTokenConsistency(tokenUsage) {
    const suggestions = [];
    
    // Verificar si los tokens usados existen
    const allTokens = await this.loadAllTokens();
    
    for (const [tokenPath, usageCount] of Object.entries(tokenUsage)) {
      if (!this.tokenExists(tokenPath, allTokens)) {
        suggestions.push(`Token no encontrado: ${tokenPath}`);
      }
    }
    
    return { suggestions };
  }

  async loadAllTokens() {
    const allTokens = {};
    
    try {
      const tokenFiles = ['colors.json', 'typography.json', 'spacing.json', 'shadows.json', 'semantic.json'];
      
      for (const file of tokenFiles) {
        const filePath = path.join(this.tokensDir, file);
        try {
          const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
          allTokens[file.replace('.json', '')] = data;
        } catch {
          // Archivo no existe, continuar
        }
      }
      
      return allTokens;
    } catch (error) {
      console.error('Error cargando tokens:', error);
      return {};
    }
  }

  tokenExists(tokenPath, allTokens) {
    const pathParts = tokenPath.split('.');
    let current = allTokens;
    
    for (const part of pathParts) {
      if (!current[part]) {
        return false;
      }
      current = current[part];
    }
    
    return true;
  }

  findSimilarTokens(value, allTokens) {
    // Implementar búsqueda de tokens similares
    // Por ahora, retornar array vacío
    return [];
  }

  generateLightTheme(tokenSystem) {
    return {
      name: 'light',
      colors: {
        ...tokenSystem.colors,
        surface: {
          background: tokenSystem.colors.neutral.white,
          card: tokenSystem.colors.neutral.gray[50],
          overlay: 'rgba(0, 0, 0, 0.5)'
        },
        content: {
          primary: tokenSystem.colors.neutral.gray[900],
          secondary: tokenSystem.colors.neutral.gray[600],
          tertiary: tokenSystem.colors.neutral.gray[400]
        }
      }
    };
  }

  generateDarkTheme(tokenSystem) {
    return {
      name: 'dark',
      colors: {
        ...tokenSystem.colors,
        surface: {
          background: tokenSystem.colors.neutral.gray[900],
          card: tokenSystem.colors.neutral.gray[800],
          overlay: 'rgba(0, 0, 0, 0.7)'
        },
        content: {
          primary: tokenSystem.colors.neutral.white,
          secondary: tokenSystem.colors.neutral.gray[300],
          tertiary: tokenSystem.colors.neutral.gray[500]
        }
      }
    };
  }

  generateCustomTheme(tokenSystem) {
    return {
      name: 'custom',
      colors: {
        ...tokenSystem.colors
      }
    };
  }

  generateCSSFromTokens(themeData) {
    let css = `/* Theme: ${themeData.name} */\n\n`;
    
    // Generar CSS variables para colores
    if (themeData.colors) {
      css += ':root {\n';
      this.generateCSSVariablesRecursive(themeData.colors, css, '--color');
      css += '}\n\n';
    }
    
    return css;
  }

  generateCSSVariablesRecursive(obj, css, prefix) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object') {
        this.generateCSSVariablesRecursive(value, css, `${prefix}-${key}`);
      } else {
        const cssVar = `${prefix}-${key}: ${value};`;
        css += `  ${cssVar}\n`;
      }
    }
  }

  generateCSSVariables(tokenSystem) {
    let css = '/* Design System Tokens */\n\n';
    
    // Generar variables CSS para todos los tokens
    for (const [category, tokens] of Object.entries(tokenSystem)) {
      css += `/* ${category} */\n`;
      this.generateCSSVariablesRecursive(tokens, css, `--${category}`);
      css += '\n';
    }
    
    return css;
  }

  async saveTokenSystem(tokenSystem) {
    for (const [category, tokens] of Object.entries(tokenSystem)) {
      const filePath = path.join(this.tokensDir, `${category}.json`);
      await fs.writeFile(filePath, JSON.stringify(tokens, null, 2));
    }
  }

  async createColorTokens(brandColors, semanticColors) {
    const colors = {
      brand: brandColors || this.getDefaultColors().brand,
      semantic: semanticColors || this.getDefaultColors().semantic,
      neutral: this.getDefaultColors().neutral
    };
    
    return colors;
  }

  async createTypographyTokens(typographyScale) {
    const typography = {
      ...this.getDefaultTypography(),
      ...typographyScale
    };
    
    return typography;
  }

  async createSpacingTokens(spacingScale) {
    const spacing = {
      ...this.getDefaultSpacing(),
      ...spacingScale
    };
    
    return spacing;
  }

  async createSemanticTokens(tokenSystem) {
    return this.getDefaultSemanticTokens();
  }
} 