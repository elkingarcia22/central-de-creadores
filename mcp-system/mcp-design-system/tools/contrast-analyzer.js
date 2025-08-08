import fs from 'fs/promises';

export class ContrastAnalyzer {
  constructor() {
    this.wcagLevels = {
      AA: { normal: 4.5, large: 3.0 },
      AAA: { normal: 7.0, large: 4.5 }
    };
  }

  // Convertir RGB a luminancia relativa
  rgbToLuminance(r, g, b) {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  // Calcular ratio de contraste
  calculateContrastRatio(luminance1, luminance2) {
    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Parsear color RGB
  parseRGB(colorString) {
    const match = colorString.match(/rgb\((\d+)\s+(\d+)\s+(\d+)\)/);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3])
      };
    }
    return null;
  }

  // Analizar contraste entre dos colores
  analyzeContrast(color1, color2) {
    const rgb1 = this.parseRGB(color1);
    const rgb2 = this.parseRGB(color2);

    if (!rgb1 || !rgb2) {
      return { error: 'Formato de color no válido' };
    }

    const luminance1 = this.rgbToLuminance(rgb1.r, rgb1.g, rgb1.b);
    const luminance2 = this.rgbToLuminance(rgb2.r, rgb2.g, rgb2.b);
    const ratio = this.calculateContrastRatio(luminance1, luminance2);

    const results = {
      ratio: Math.round(ratio * 100) / 100,
      passes: {
        AA_normal: ratio >= this.wcagLevels.AA.normal,
        AA_large: ratio >= this.wcagLevels.AA.large,
        AAA_normal: ratio >= this.wcagLevels.AAA.normal,
        AAA_large: ratio >= this.wcagLevels.AAA.large
      },
      level: this.getContrastLevel(ratio)
    };

    return results;
  }

  getContrastLevel(ratio) {
    if (ratio >= 7.0) return 'excellent';
    if (ratio >= 4.5) return 'good';
    if (ratio >= 3.0) return 'fair';
    return 'poor';
  }

  // Analizar paleta completa
  async analyzeColorPalette(palettePath) {
    const palette = JSON.parse(await fs.readFile(palettePath, 'utf8'));
    const results = [];

    // Analizar combinaciones de texto y fondo
    for (const [theme, colors] of Object.entries(palette.system_colors)) {
      for (const [textType, textColor] of Object.entries(colors.text)) {
        for (const [bgType, bgColor] of Object.entries(colors.background)) {
          const analysis = this.analyzeContrast(textColor, bgColor);
          results.push({
            theme,
            textType,
            bgType,
            textColor,
            bgColor,
            ...analysis
          });
        }
      }
    }

    return results;
  }

  // Generar reporte de accesibilidad
  generateAccessibilityReport(analysisResults) {
    const report = {
      summary: {
        total: analysisResults.length,
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
        aa_compliant: 0,
        aaa_compliant: 0
      },
      issues: [],
      recommendations: []
    };

    analysisResults.forEach(result => {
      // Contar niveles
      report.summary[result.level]++;
      
      // Contar compliance
      if (result.passes.AA_normal) report.summary.aa_compliant++;
      if (result.passes.AAA_normal) report.summary.aaa_compliant++;

      // Identificar problemas
      if (!result.passes.AA_normal) {
        report.issues.push({
          severity: 'high',
          message: `Contraste insuficiente: ${result.textType} sobre ${result.bgType} (${result.ratio}:1)`,
          theme: result.theme,
          textColor: result.textColor,
          bgColor: result.bgColor,
          ratio: result.ratio
        });
      }
    });

    // Generar recomendaciones
    if (report.summary.poor > 0) {
      report.recommendations.push({
        priority: 'high',
        message: 'Revisar colores con contraste pobre',
        count: report.summary.poor
      });
    }

    if (report.summary.aa_compliant < report.summary.total * 0.9) {
      report.recommendations.push({
        priority: 'medium',
        message: 'Mejorar contraste para cumplir WCAG AA',
        count: report.summary.total - report.summary.aa_compliant
      });
    }

    return report;
  }

  // Sugerir mejoras de color
  suggestColorImprovements(analysisResults) {
    const suggestions = [];

    analysisResults.forEach(result => {
      if (!result.passes.AA_normal) {
        const suggestion = this.generateColorSuggestion(
          result.textColor,
          result.bgColor,
          result.theme
        );
        suggestions.push(suggestion);
      }
    });

    return suggestions;
  }

  generateColorSuggestion(textColor, bgColor, theme) {
    const rgb = this.parseRGB(textColor);
    const bgRgb = this.parseRGB(bgColor);

    if (!rgb || !bgRgb) return null;

    // Calcular mejor color basado en el tema
    let suggestedColor;
    if (theme === 'light') {
      // Para modo claro, oscurecer el texto
      suggestedColor = `rgb(${Math.max(0, rgb.r - 30)} ${Math.max(0, rgb.g - 30)} ${Math.max(0, rgb.b - 30)})`;
    } else {
      // Para modo oscuro, aclarar el texto
      suggestedColor = `rgb(${Math.min(255, rgb.r + 30)} ${Math.min(255, rgb.g + 30)} ${Math.min(255, rgb.b + 30)})`;
    }

    return {
      original: textColor,
      suggested: suggestedColor,
      theme,
      reason: `Mejorar contraste para cumplir WCAG AA`
    };
  }
}

export default ContrastAnalyzer;
