import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 [Test Notes Only] Creando notas de prueba...');

    // Usar participantes existentes
    const participante1 = '83f663e4-52fb-4149-ad34-4419240b988c'; // "1234"
    const participante2 = '0a21c24a-f926-45f0-8d19-c7048c21c07a'; // "Participante con Empresa y Productos"

    // Crear notas manuales con sesion_id válido (usar un ID existente)
    const sesionId = '12345678-1234-1234-1234-123456789001'; // ID de sesión de prueba

    const notasProducto = [
      {
        id: '12345678-1234-1234-1234-123456789201',
        participante_id: participante1,
        sesion_id: sesionId,
        contenido: 'Participante mostró frustración inicial al no encontrar el producto objetivo. Sugiere mejorar la visibilidad en la navegación principal.',
        fecha_creacion: new Date().toISOString(),
        semaforo_riesgo: 'rojo',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789202',
        participante_id: participante1,
        sesion_id: sesionId,
        contenido: 'Una vez encontrado el producto objetivo, el participante valoró positivamente la guía paso a paso y los ejemplos proporcionados.',
        fecha_creacion: new Date(Date.now() + 60000).toISOString(),
        semaforo_riesgo: 'verde',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789203',
        participante_id: participante1,
        sesion_id: sesionId,
        contenido: 'El participante sugiere agregar un enlace directo al producto objetivo desde la página principal para mejorar la discoverabilidad.',
        fecha_creacion: new Date(Date.now() + 120000).toISOString(),
        semaforo_riesgo: 'amarillo',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      }
    ];

    const notasEncuestas = [
      {
        id: '12345678-1234-1234-1234-123456789301',
        participante_id: participante2,
        sesion_id: sesionId,
        contenido: 'El flujo de creación de encuestas es intuitivo, pero el participante sugiere agregar una vista previa en tiempo real.',
        fecha_creacion: new Date().toISOString(),
        semaforo_riesgo: 'amarillo',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789302',
        participante_id: participante2,
        sesion_id: sesionId,
        contenido: 'Participante solicita funcionalidad de drag-and-drop para reordenar preguntas y más opciones de personalización visual.',
        fecha_creacion: new Date(Date.now() + 60000).toISOString(),
        semaforo_riesgo: 'amarillo',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789303',
        participante_id: participante2,
        sesion_id: sesionId,
        contenido: 'Excelente sugerencia: implementar sistema de plantillas de encuestas para usuarios frecuentes. Esto mejoraría significativamente la eficiencia.',
        fecha_creacion: new Date(Date.now() + 120000).toISOString(),
        semaforo_riesgo: 'verde',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789304',
        participante_id: participante2,
        sesion_id: sesionId,
        contenido: 'El participante tiene experiencia previa con herramientas similares y puede proporcionar comparaciones valiosas con la competencia.',
        fecha_creacion: new Date(Date.now() + 180000).toISOString(),
        semaforo_riesgo: 'neutral',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      }
    ];

    // Insertar datos en Supabase
    console.log('📝 [Test Notes Only] Insertando notas...');

    // Insertar notas manuales
    const { error: notasError1 } = await supabaseServer
      .from('notas_manuales')
      .insert(notasProducto);

    const { error: notasError2 } = await supabaseServer
      .from('notas_manuales')
      .insert(notasEncuestas);

    // Verificar errores
    const errors = [
      notasError1, notasError2
    ].filter(error => error);

    if (errors.length > 0) {
      console.error('❌ [Test Notes Only] Errores al insertar:', errors);
      return res.status(500).json({ 
        error: 'Error al crear notas de prueba',
        details: errors
      });
    }

    console.log('✅ [Test Notes Only] Notas de prueba creadas exitosamente');

    return res.status(200).json({
      status: 'ok',
      message: 'Notas de prueba creadas exitosamente',
      datos: [
        {
          tipo: 'notas',
          participante: '1234',
          cantidad: 3,
          semaforo_distribution: { rojo: 1, amarillo: 1, verde: 1 }
        },
        {
          tipo: 'notas',
          participante: 'Participante con Empresa y Productos',
          cantidad: 4,
          semaforo_distribution: { rojo: 0, amarillo: 2, verde: 1, neutral: 1 }
        }
      ],
      participantes_usados: [
        {
          id: participante1,
          nombre: '1234',
          empresa: 'GreenEnergy Corp'
        },
        {
          id: participante2,
          nombre: 'Participante con Empresa y Productos',
          empresa: 'FinanceHub International'
        }
      ],
      sesion_id: sesionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Test Notes Only] Error:', error);
    return res.status(500).json({ 
      error: 'Error al crear notas de prueba',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
