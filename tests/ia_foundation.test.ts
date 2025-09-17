import { sanitizePII } from '../apps/bff/src/utils/sanitize';
import { checkBudget, recordCost } from '../apps/bff/src/services/costs';
import { AnalyzeSessionIn, AnalyzeSessionOut } from '../apps/bff/src/types';

// Mock de Supabase para tests
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ data: null, error: null }))
        })),
        gte: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => Promise.resolve({ 
            data: { id: 'test-id' }, 
            error: null 
          }))
        }))
      }))
    }))
  }))
}));

describe('IA Foundation Tests', () => {
  describe('sanitizePII', () => {
    it('should mask emails', () => {
      const text = 'Contact me at john.doe@example.com for more info';
      const result = sanitizePII(text);
      expect(result).toBe('Contact me at [EMAIL] for more info');
    });

    it('should mask phone numbers', () => {
      const text = 'Call me at +57 300 123 4567 or 300-123-4567';
      const result = sanitizePII(text);
      expect(result).toBe('Call me at [PHONE] or [PHONE]');
    });

    it('should mask credit cards', () => {
      const text = 'My card is 4532 1234 5678 9012';
      const result = sanitizePII(text);
      expect(result).toBe('My card is [CARD]');
    });

    it('should mask ID numbers', () => {
      const text = 'My ID is 1234567890';
      const result = sanitizePII(text);
      expect(result).toBe('My ID is [ID_NUMBER]');
    });

    it('should handle empty or null input', () => {
      expect(sanitizePII('')).toBe('');
      expect(sanitizePII(null as any)).toBe(null);
      expect(sanitizePII(undefined as any)).toBe(undefined);
    });

    it('should handle text without PII', () => {
      const text = 'This is a normal text without any personal information';
      const result = sanitizePII(text);
      expect(result).toBe(text);
    });
  });

  describe('AnalyzeSessionIn validation', () => {
    it('should validate correct payload', () => {
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

    it('should reject invalid tool', () => {
      const invalidPayload = {
        tool: 'invalid_tool',
        input: { transcriptId: 'TR_123' },
        context: { tenantId: 'TENANT_X' },
        policy: { allowPaid: false },
        idempotency_key: '550e8400-e29b-41d4-a716-446655440000'
      };

      expect(() => AnalyzeSessionIn.parse(invalidPayload)).toThrow();
    });

    it('should reject invalid UUID for idempotency_key', () => {
      const invalidPayload = {
        tool: 'analyze_session',
        input: { transcriptId: 'TR_123' },
        context: { tenantId: 'TENANT_X' },
        policy: { allowPaid: false },
        idempotency_key: 'not-a-uuid'
      };

      expect(() => AnalyzeSessionIn.parse(invalidPayload)).toThrow();
    });

    it('should reject missing required fields', () => {
      const invalidPayload = {
        tool: 'analyze_session',
        input: { transcriptId: 'TR_123' },
        // Missing context, policy, idempotency_key
      };

      expect(() => AnalyzeSessionIn.parse(invalidPayload)).toThrow();
    });
  });

  describe('AnalyzeSessionOut validation', () => {
    it('should validate correct output', () => {
      const validOutput = {
        summary: 'Participante expresa frustración con navegación móvil y proceso de pago.',
        insights: [
          {
            text: 'CTA de pago poco visible en primer scroll',
            evidence: { transcriptId: 'TR_123', start_ms: 734000, end_ms: 742000 }
          }
        ],
        dolores: [
          {
            categoria_id: 'NAV_MOBILE',
            ejemplo: 'No encuentro el botón de pago en el móvil',
            evidence: { transcriptId: 'TR_123', start_ms: 734000, end_ms: 742000 }
          }
        ],
        perfil_sugerido: {
          categoria_id: 'MOVIL_FIRST',
          razones: ['Valora rapidez', 'Usa solo celular'],
          confidence: 0.78
        }
      };

      expect(() => AnalyzeSessionOut.parse(validOutput)).not.toThrow();
    });

    it('should reject summary too short', () => {
      const invalidOutput = {
        summary: 'Short',
        insights: [],
        dolores: [],
        perfil_sugerido: null
      };

      expect(() => AnalyzeSessionOut.parse(invalidOutput)).toThrow();
    });

    it('should reject invalid evidence timestamps', () => {
      const invalidOutput = {
        summary: 'Valid summary with enough characters to pass validation',
        insights: [
          {
            text: 'Valid insight text',
            evidence: { transcriptId: 'TR_123', start_ms: -1000, end_ms: 500 } // Invalid negative timestamp
          }
        ],
        dolores: [],
        perfil_sugerido: null
      };

      expect(() => AnalyzeSessionOut.parse(invalidOutput)).toThrow();
    });

    it('should reject invalid confidence value', () => {
      const invalidOutput = {
        summary: 'Valid summary with enough characters to pass validation',
        insights: [],
        dolores: [],
        perfil_sugerido: {
          categoria_id: 'MOVIL_FIRST',
          razones: ['Valid reason'],
          confidence: 1.5 // Invalid confidence > 1
        }
      };

      expect(() => AnalyzeSessionOut.parse(invalidOutput)).toThrow();
    });
  });

  describe('Cost management', () => {
    it('should check budget successfully', async () => {
      const result = await checkBudget('test-tenant', 100);
      expect(result.allowed).toBe(true);
    });

    it('should record cost successfully', async () => {
      await expect(recordCost({
        tenantId: 'test-tenant',
        provider: 'mock',
        costCents: 100,
        meta: { test: true }
      })).resolves.not.toThrow();
    });
  });
});
