import { sanitizePII } from '../apps/bff/src/utils/sanitize';
import { AnalyzeSessionIn, AnalyzeSessionOut } from '../apps/bff/src/types';

describe('IA Foundation Integration Tests', () => {
  describe('Sanitizado PII - Log de Prueba', () => {
    it('should log PII sanitization in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const textWithPII = 'Contact me at john.doe@example.com or call +57 300 123 4567';
      const result = sanitizePII(textWithPII);
      
      expect(result).toBe('Contact me at [EMAIL] or call [PHONE]');
      expect(consoleSpy).toHaveBeenCalledWith('🔒 [PII] Texto original contiene PII, sanitizando...');
      expect(consoleSpy).toHaveBeenCalledWith('🔒 [PII] PII enmascarado correctamente ✅');
      
      consoleSpy.mockRestore();
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('/ai/run Mock - Validación Zod', () => {
    it('should generate valid mock result that passes AnalyzeSessionOut schema', () => {
      const mockResult = {
        summary: "Participante expresa frustración con navegación móvil y proceso de pago. Menciona dificultades para encontrar botones importantes y completar transacciones.",
        insights: [
          {
            text: "CTA de pago poco visible en primer scroll",
            evidence: { transcriptId: "TR_123", start_ms: 734000, end_ms: 742000 }
          }
        ],
        dolores: [
          {
            categoria_id: "NAV_MOBILE",
            ejemplo: "No encuentro el botón de pago en el móvil",
            evidence: { transcriptId: "TR_123", start_ms: 734000, end_ms: 742000 }
          }
        ],
        perfil_sugerido: {
          categoria_id: "MOVIL_FIRST",
          razones: ["Valora rapidez", "Usa solo celular"],
          confidence: 0.78
        }
      };

      expect(() => AnalyzeSessionOut.parse(mockResult)).not.toThrow();
    });
  });

  describe('Idempotencia - Validación de Schema', () => {
    it('should validate correct idempotency_key format', () => {
      const validPayload = {
        tool: 'analyze_session',
        input: {
          transcriptId: 'TR_123',
          notesId: 'NT_456',
          language: 'es'
        },
        context: {
          tenantId: 'TENANT_X',
          investigationId: 'INV_789',
          sessionId: 'SES_456',
          participantId: 'PAR_001',
          catalogs: {
            dolorCategoriaIds: ['NAV_MOBILE', 'TRUST'],
            perfilCategoriaIds: ['MOVIL_FIRST', 'PRICE_SENSITIVE']
          }
        },
        policy: {
          allowPaid: false,
          preferProvider: 'free',
          maxLatencyMs: 8000,
          budgetCents: 0,
          region: 'CO'
        },
        idempotency_key: '550e8400-e29b-41d4-a716-446655440000'
      };

      expect(() => AnalyzeSessionIn.parse(validPayload)).not.toThrow();
    });

    it('should reject invalid idempotency_key format', () => {
      const invalidPayload = {
        tool: 'analyze_session',
        input: { transcriptId: 'TR_123' },
        context: { tenantId: 'TENANT_X' },
        policy: { allowPaid: false },
        idempotency_key: 'not-a-valid-uuid'
      };

      expect(() => AnalyzeSessionIn.parse(invalidPayload)).toThrow();
    });
  });
});
