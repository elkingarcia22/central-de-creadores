import fs from 'fs/promises';
import { ContrastAnalyzer } from './contrast-analyzer.js';

export class ThemeGenerator {
  constructor() {
    this.contrastAnalyzer = new ContrastAnalyzer();
  }

  async generateOptimizedThemes() {
    // Cargar colores globales
    const globalColors = JSON.parse(
      await fs.readFile('tokens/colors/global.json', 'utf8')
    );

    // Generar temas optimizados
    const optimizedThemes = {
      light: this.generateLightTheme(globalColors),
      dark: this.generateDarkTheme(globalColors)
    };

    // Validar contraste
    const contrastResults = await this.validateThemeContrast(optimizedThemes);

    // Aplicar mejoras si es necesario
    if (contrastResults.issues.length > 0) {
      optimizedThemes.light = this.applyContrastFixes(
        optimizedThemes.light,
        contrastResults.issues.filter(issue => issue.theme === 'light')
      );
      optimizedThemes.dark = this.applyContrastFixes(
        optimizedThemes.dark,
        contrastResults.issues.filter(issue => issue.theme === 'dark')
      );
    }

    return optimizedThemes;
  }

  generateLightTheme(globalColors) {
    return {
      background: {
        primary: 'rgb(248 250 252)',
        secondary: 'rgb(255 255 255)',
        tertiary: 'rgb(241 245 249)',
        overlay: 'rgb(255 255 255)'
      },
      surface: {
        primary: 'rgb(255 255 255)',
        secondary: 'rgb(248 250 252)',
        tertiary: 'rgb(241 245 249)',
        overlay: 'rgb(255 255 255)'
      },
      text: {
        primary: 'rgb(15 23 42)',
        secondary: 'rgb(100 116 139)',
        tertiary: 'rgb(148 163 184)',
        disabled: 'rgb(203 213 225)',
        inverse: 'rgb(255 255 255)'
      },
      border: {
        primary: 'rgb(226 232 240)',
        secondary: 'rgb(241 245 249)',
        focus: globalColors.global_colors.brand.primary['500'],
        error: globalColors.global_colors.feedback.error['500']
      },
      interactive: {
        primary: globalColors.global_colors.brand.primary['500'],
        primary_hover: globalColors.global_colors.brand.primary['600'],
        secondary: 'rgb(100 116 139)',
        secondary_hover: 'rgb(71 85 105)'
      },
      feedback: {
        success: globalColors.global_colors.feedback.success['500'],
        warning: globalColors.global_colors.feedback.warning['500'],
        error: globalColors.global_colors.feedback.error['500'],
        info: globalColors.global_colors.brand.primary['500']
      }
    };
  }

  generateDarkTheme(globalColors) {
    return {
      background: {
        primary: 'rgb(9 9 11)',
        secondary: 'rgb(20 20 23)',
        tertiary: 'rgb(39 39 42)',
        overlay: 'rgb(20 20 23)'
      },
      surface: {
        primary: 'rgb(20 20 23)',
        secondary: 'rgb(39 39 42)',
        tertiary: 'rgb(63 63 70)',
        overlay: 'rgb(20 20 23)'
      },
      text: {
        primary: 'rgb(250 250 250)',
        secondary: 'rgb(161 161 170)',
        tertiary: 'rgb(113 113 122)',
        disabled: 'rgb(63 63 70)',
        inverse: 'rgb(9 9 11)'
      },
      border: {
        primary: 'rgb(63 63 70)',
        secondary: 'rgb(39 39 42)',
        focus: 'rgb(120 160 255)',
        error: 'rgb(255 140 140)'
      },
      interactive: {
        primary: 'rgb(120 160 255)',
        primary_hover: 'rgb(96 165 250)',
        secondary: 'rgb(161 161 170)',
        secondary_hover: 'rgb(212 212 216)'
      },
      feedback: {
        success: 'rgb(120 220 150)',
        warning: 'rgb(255 210 100)',
        error: 'rgb(255 140 140)',
        info: 'rgb(96 165 250)'
      }
    };
  }

  async validateThemeContrast(themes) {
    const results = [];
    
    for (const [themeName, theme] of Object.entries(themes)) {
      // Analizar combinaciones críticas
      const criticalCombinations = [
        { text: theme.text.primary, bg: theme.background.primary },
        { text: theme.text.secondary, bg: theme.background.primary },
        { text: theme.text.primary, bg: theme.surface.primary },
        { text: theme.interactive.primary, bg: theme.background.primary }
      ];

      criticalCombinations.forEach(({ text, bg }) => {
        const analysis = this.contrastAnalyzer.analyzeContrast(text, bg);
        if (!analysis.passes.AA_normal) {
          results.push({
            theme: themeName,
            textColor: text,
            bgColor: bg,
            ratio: analysis.ratio,
            severity: 'high'
          });
        }
      });
    }

    return {
      issues: results,
      total: results.length
    };
  }

  applyContrastFixes(theme, issues) {
    const fixedTheme = JSON.parse(JSON.stringify(theme));

    issues.forEach(issue => {
      // Aplicar mejoras específicas según el problema
      if (issue.textColor.includes('primary') && issue.ratio < 4.5) {
        // Mejorar contraste de texto primario
        if (issue.theme === 'light') {
          fixedTheme.text.primary = 'rgb(0 0 0)';
        } else {
          fixedTheme.text.primary = 'rgb(255 255 255)';
        }
      }
    });

    return fixedTheme;
  }

  async generateCSSVariables(themes) {
    let css = ':root {\n';
    
    // Variables para modo claro
    for (const [category, colors] of Object.entries(themes.light)) {
      for (const [name, value] of Object.entries(colors)) {
        css += `  --${category}-${name}: ${value};\n`;
      }
    }

    css += '}\n\n.dark {\n';
    
    // Variables para modo oscuro
    for (const [category, colors] of Object.entries(themes.dark)) {
      for (const [name, value] of Object.entries(colors)) {
        css += `  --${category}-${name}: ${value};\n`;
      }
    }

    css += '}\n';
    
    return css;
  }

  async saveOptimizedThemes(themes, outputPath) {
    const css = await this.generateCSSVariables(themes);
    await fs.writeFile(outputPath, css);
    
    return {
      success: true,
      path: outputPath,
      message: 'Temas optimizados generados exitosamente'
    };
  }
}

export default ThemeGenerator;
