// Setup global para tests
import 'dotenv/config';

// Mock de variables de entorno para tests
process.env.IA_ENABLE_EXEC = 'false';
process.env.IA_EMBEDDINGS_DIM = '768';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE = 'test-service-role-key';

// Configurar timeout para tests
jest.setTimeout(10000);
