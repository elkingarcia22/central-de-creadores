import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 [Test Data Only] Creando datos de prueba...');

    // 1. Crear transcripciones (sin foreign keys)
    const transcripcionProducto = {
      id: '12345678-1234-1234-1234-123456789101',
      reclutamiento_id: null, // Sin foreign key
      sesion_apoyo_id: null, // Sin foreign key
      meet_link: 'https://meet.google.com/test-producto',
      transcripcion_completa: `Moderador: Hola, bienvenido a esta sesión de usabilidad. Hoy vamos a evaluar el producto objetivo de nuestra plataforma. ¿Podrías contarme un poco sobre tu experiencia previa con este tipo de herramientas?

Participante: Hola, sí. He usado varias plataformas de e-commerce antes, pero esta es la primera vez que uso una específicamente para productos objetivo.

Moderador: Perfecto. Ahora te voy a pedir que navegues por la plataforma y me cuentes qué piensas. Empecemos por la página principal.

Participante: Ok, veo la página principal... Hmm, no veo claramente dónde está el producto objetivo. Hay muchos elementos en la pantalla.

Moderador: ¿Qué estás buscando específicamente?

Participante: Estoy buscando la sección de productos objetivo, pero no la encuentro fácilmente. Tal vez debería estar más visible.

Moderador: Continúa explorando, dime qué haces.

Participante: Voy a hacer clic en el menú... Veo "Productos" pero no "Productos Objetivo" específicamente. Déjame buscar más...

Moderador: ¿Cómo te sientes con esta experiencia hasta ahora?

Participante: Un poco frustrado. Esperaba encontrar el producto objetivo más fácilmente. En otras plataformas suele estar más destacado.

Moderador: Entiendo. Sigue explorando y dime si encuentras algo útil.

Participante: Ah, aquí está! Estaba en "Herramientas" > "Productos Objetivo". No era intuitivo para mí.

Moderador: ¿Qué opinas de la interfaz una vez que llegaste aquí?

Participante: Ahora sí está más claro. Me gusta que tenga ejemplos y una guía paso a paso. Esto debería estar más visible desde el inicio.`,
      transcripcion_por_segmentos: [
        {
          start_ms: 0,
          end_ms: 15000,
          text: "Moderador: Hola, bienvenido a esta sesión de usabilidad. Hoy vamos a evaluar el producto objetivo de nuestra plataforma. ¿Podrías contarme un poco sobre tu experiencia previa con este tipo de herramientas?"
        },
        {
          start_ms: 15000,
          end_ms: 25000,
          text: "Participante: Hola, sí. He usado varias plataformas de e-commerce antes, pero esta es la primera vez que uso una específicamente para productos objetivo."
        },
        {
          start_ms: 25000,
          end_ms: 35000,
          text: "Moderador: Perfecto. Ahora te voy a pedir que navegues por la plataforma y me cuentes qué piensas. Empecemos por la página principal."
        },
        {
          start_ms: 35000,
          end_ms: 45000,
          text: "Participante: Ok, veo la página principal... Hmm, no veo claramente dónde está el producto objetivo. Hay muchos elementos en la pantalla."
        },
        {
          start_ms: 45000,
          end_ms: 55000,
          text: "Moderador: ¿Qué estás buscando específicamente?"
        },
        {
          start_ms: 55000,
          end_ms: 65000,
          text: "Participante: Estoy buscando la sección de productos objetivo, pero no la encuentro fácilmente. Tal vez debería estar más visible."
        },
        {
          start_ms: 65000,
          end_ms: 75000,
          text: "Moderador: Continúa explorando, dime qué haces."
        },
        {
          start_ms: 75000,
          end_ms: 85000,
          text: "Participante: Voy a hacer clic en el menú... Veo 'Productos' pero no 'Productos Objetivo' específicamente. Déjame buscar más..."
        },
        {
          start_ms: 85000,
          end_ms: 95000,
          text: "Moderador: ¿Cómo te sientes con esta experiencia hasta ahora?"
        },
        {
          start_ms: 95000,
          end_ms: 105000,
          text: "Participante: Un poco frustrado. Esperaba encontrar el producto objetivo más fácilmente. En otras plataformas suele estar más destacado."
        },
        {
          start_ms: 105000,
          end_ms: 115000,
          text: "Moderador: Entiendo. Sigue explorando y dime si encuentras algo útil."
        },
        {
          start_ms: 115000,
          end_ms: 125000,
          text: "Participante: Ah, aquí está! Estaba en 'Herramientas' > 'Productos Objetivo'. No era intuitivo para mí."
        },
        {
          start_ms: 125000,
          end_ms: 135000,
          text: "Moderador: ¿Qué opinas de la interfaz una vez que llegaste aquí?"
        },
        {
          start_ms: 135000,
          end_ms: 145000,
          text: "Participante: Ahora sí está más claro. Me gusta que tenga ejemplos y una guía paso a paso. Esto debería estar más visible desde el inicio."
        }
      ],
      duracion_total: 145000,
      idioma_detectado: 'es',
      estado: 'completado',
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 145000).toISOString(),
      semaforo_riesgo: 'amarillo'
    };

    const transcripcionEncuestas = {
      id: '12345678-1234-1234-1234-123456789102',
      reclutamiento_id: null, // Sin foreign key
      sesion_apoyo_id: null, // Sin foreign key
      meet_link: 'https://meet.google.com/test-encuestas',
      transcripcion_completa: `Moderador: Bienvenido a esta sesión sobre la funcionalidad de encuestas. Vamos a explorar cómo crear una encuesta en nuestra plataforma.

Participante: Hola, gracias. He usado herramientas de encuestas antes, pero siempre busco opciones más intuitivas.

Moderador: Perfecto. Te voy a pedir que crees una encuesta desde cero. Empieza cuando estés listo.

Participante: Ok, veo el botón 'Crear Encuesta'. Hago clic... Ah, me pide que elija un tipo de encuesta. Veo varias opciones: 'Satisfacción', 'Feedback', 'Investigación de Mercado'...

Moderador: ¿Qué opción elegirías para una encuesta de satisfacción del cliente?

Participante: Claramente 'Satisfacción'. Hago clic... Ahora me pide un título. Escribo 'Encuesta de Satisfacción del Cliente'.

Moderador: ¿Cómo te parece el flujo hasta ahora?

Participante: Está bien, pero me gustaría ver una vista previa de cómo se verá la encuesta antes de continuar.

Moderador: Continúa con el proceso.

Participante: Ok, ahora me pide agregar preguntas. Veo que puedo elegir entre diferentes tipos: texto, opción múltiple, escala... Voy a agregar una pregunta de escala.

Moderador: ¿Qué tal la experiencia agregando preguntas?

Participante: Es intuitivo, pero me gustaría poder reordenar las preguntas arrastrando y soltando. También me gustaría ver más opciones de personalización.

Moderador: ¿Hay algo que te gustaría cambiar?

Participante: Sí, me gustaría que el proceso fuera más visual. Tal vez con un editor más tipo drag-and-drop. También me gustaría poder guardar plantillas de encuestas que uso frecuentemente.`,
      transcripcion_por_segmentos: [
        {
          start_ms: 0,
          end_ms: 12000,
          text: "Moderador: Bienvenido a esta sesión sobre la funcionalidad de encuestas. Vamos a explorar cómo crear una encuesta en nuestra plataforma."
        },
        {
          start_ms: 12000,
          end_ms: 22000,
          text: "Participante: Hola, gracias. He usado herramientas de encuestas antes, pero siempre busco opciones más intuitivas."
        },
        {
          start_ms: 22000,
          end_ms: 32000,
          text: "Moderador: Perfecto. Te voy a pedir que crees una encuesta desde cero. Empieza cuando estés listo."
        },
        {
          start_ms: 32000,
          end_ms: 45000,
          text: "Participante: Ok, veo el botón 'Crear Encuesta'. Hago clic... Ah, me pide que elija un tipo de encuesta. Veo varias opciones: 'Satisfacción', 'Feedback', 'Investigación de Mercado'..."
        },
        {
          start_ms: 45000,
          end_ms: 55000,
          text: "Moderador: ¿Qué opción elegirías para una encuesta de satisfacción del cliente?"
        },
        {
          start_ms: 55000,
          end_ms: 65000,
          text: "Participante: Claramente 'Satisfacción'. Hago clic... Ahora me pide un título. Escribo 'Encuesta de Satisfacción del Cliente'."
        },
        {
          start_ms: 65000,
          end_ms: 75000,
          text: "Moderador: ¿Cómo te parece el flujo hasta ahora?"
        },
        {
          start_ms: 75000,
          end_ms: 85000,
          text: "Participante: Está bien, pero me gustaría ver una vista previa de cómo se verá la encuesta antes de continuar."
        },
        {
          start_ms: 85000,
          end_ms: 95000,
          text: "Moderador: Continúa con el proceso."
        },
        {
          start_ms: 95000,
          end_ms: 110000,
          text: "Participante: Ok, ahora me pide agregar preguntas. Veo que puedo elegir entre diferentes tipos: texto, opción múltiple, escala... Voy a agregar una pregunta de escala."
        },
        {
          start_ms: 110000,
          end_ms: 120000,
          text: "Moderador: ¿Qué tal la experiencia agregando preguntas?"
        },
        {
          start_ms: 120000,
          end_ms: 130000,
          text: "Participante: Es intuitivo, pero me gustaría poder reordenar las preguntas arrastrando y soltando. También me gustaría ver más opciones de personalización."
        },
        {
          start_ms: 130000,
          end_ms: 140000,
          text: "Moderador: ¿Hay algo que te gustaría cambiar?"
        },
        {
          start_ms: 140000,
          end_ms: 150000,
          text: "Participante: Sí, me gustaría que el proceso fuera más visual. Tal vez con un editor más tipo drag-and-drop. También me gustaría poder guardar plantillas de encuestas que uso frecuentemente."
        }
      ],
      duracion_total: 150000,
      idioma_detectado: 'es',
      estado: 'completado',
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 150000).toISOString(),
      semaforo_riesgo: 'verde'
    };

    // 2. Crear notas manuales (sin foreign keys)
    const notasProducto = [
      {
        id: '12345678-1234-1234-1234-123456789201',
        participante_id: null, // Sin foreign key
        sesion_id: null, // Sin foreign key
        contenido: 'Participante mostró frustración inicial al no encontrar el producto objetivo. Sugiere mejorar la visibilidad en la navegación principal.',
        fecha_creacion: new Date().toISOString(),
        semaforo_riesgo: 'rojo',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789202',
        participante_id: null, // Sin foreign key
        sesion_id: null, // Sin foreign key
        contenido: 'Una vez encontrado el producto objetivo, el participante valoró positivamente la guía paso a paso y los ejemplos proporcionados.',
        fecha_creacion: new Date(Date.now() + 60000).toISOString(),
        semaforo_riesgo: 'verde',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789203',
        participante_id: null, // Sin foreign key
        sesion_id: null, // Sin foreign key
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
        participante_id: null, // Sin foreign key
        sesion_id: null, // Sin foreign key
        contenido: 'El flujo de creación de encuestas es intuitivo, pero el participante sugiere agregar una vista previa en tiempo real.',
        fecha_creacion: new Date().toISOString(),
        semaforo_riesgo: 'amarillo',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789302',
        participante_id: null, // Sin foreign key
        sesion_id: null, // Sin foreign key
        contenido: 'Participante solicita funcionalidad de drag-and-drop para reordenar preguntas y más opciones de personalización visual.',
        fecha_creacion: new Date(Date.now() + 60000).toISOString(),
        semaforo_riesgo: 'amarillo',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789303',
        participante_id: null, // Sin foreign key
        sesion_id: null, // Sin foreign key
        contenido: 'Excelente sugerencia: implementar sistema de plantillas de encuestas para usuarios frecuentes. Esto mejoraría significativamente la eficiencia.',
        fecha_creacion: new Date(Date.now() + 120000).toISOString(),
        semaforo_riesgo: 'verde',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789304',
        participante_id: null, // Sin foreign key
        sesion_id: null, // Sin foreign key
        contenido: 'El participante tiene experiencia previa con herramientas similares y puede proporcionar comparaciones valiosas con la competencia.',
        fecha_creacion: new Date(Date.now() + 180000).toISOString(),
        semaforo_riesgo: 'neutral',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      }
    ];

    // Insertar datos en Supabase
    console.log('📝 [Test Data Only] Insertando datos...');

    // Insertar transcripciones
    const { error: transError1 } = await supabaseServer
      .from('transcripciones_sesiones')
      .insert(transcripcionProducto);

    const { error: transError2 } = await supabaseServer
      .from('transcripciones_sesiones')
      .insert(transcripcionEncuestas);

    // Insertar notas manuales
    const { error: notasError1 } = await supabaseServer
      .from('notas_manuales')
      .insert(notasProducto);

    const { error: notasError2 } = await supabaseServer
      .from('notas_manuales')
      .insert(notasEncuestas);

    // Verificar errores
    const errors = [
      transError1, transError2,
      notasError1, notasError2
    ].filter(error => error);

    if (errors.length > 0) {
      console.error('❌ [Test Data Only] Errores al insertar:', errors);
      return res.status(500).json({ 
        error: 'Error al crear datos de prueba',
        details: errors
      });
    }

    console.log('✅ [Test Data Only] Datos de prueba creados exitosamente');

    return res.status(200).json({
      status: 'ok',
      message: 'Datos de prueba creados exitosamente',
      datos: [
        {
          tipo: 'transcripcion',
          id: '12345678-1234-1234-1234-123456789101',
          nombre: 'Transcripción - Producto Objetivo',
          duracion: '2:25',
          segmentos: 14,
          semaforo: 'amarillo'
        },
        {
          tipo: 'transcripcion',
          id: '12345678-1234-1234-1234-123456789102',
          nombre: 'Transcripción - Producto Encuestas',
          duracion: '2:30',
          segmentos: 14,
          semaforo: 'verde'
        },
        {
          tipo: 'notas',
          cantidad: 3,
          semaforo_distribution: { rojo: 1, amarillo: 1, verde: 1 }
        },
        {
          tipo: 'notas',
          cantidad: 4,
          semaforo_distribution: { rojo: 0, amarillo: 2, verde: 1, neutral: 1 }
        }
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Test Data Only] Error:', error);
    return res.status(500).json({ 
      error: 'Error al crear datos de prueba',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
