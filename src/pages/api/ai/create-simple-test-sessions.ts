import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 [Simple Test Sessions] Creando sesiones de prueba...');

    // 1. Crear sesión de producto objetivo
    const sesionProducto = {
      id: '12345678-1234-1234-1234-123456789001',
      nombre: 'Sesión de Prueba - Producto Objetivo',
      fecha_sesion: new Date().toISOString(),
      empresa_id: '87654321-4321-4321-4321-210987654321',
      industria_id: '11111111-1111-1111-1111-111111111111',
      pais_id: '22222222-2222-2222-2222-222222222222',
      usuarios_presentes_json: {
        moderador: 'Juan Pérez',
        observadores: ['María García', 'Carlos López']
      },
      dolores_necesidades: 'Evaluar usabilidad del nuevo producto objetivo',
      descripcion_cliente: 'Cliente interesado en mejorar la experiencia de usuario de su plataforma de e-commerce',
      seguimiento_programado: true,
      fecha_seguimiento_tentativa: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      responsable_id: '33333333-3333-3333-3333-333333333333',
      investigacion_id: '44444444-4444-4444-4444-444444444444',
      creado_por: '33333333-3333-3333-3333-333333333333',
      estado: '55555555-5555-5555-5555-555555555555',
      tamaño: '66666666-6666-6666-6666-666666666666',
      relacion: '77777777-7777-7777-7777-777777777777'
    };

    // 2. Crear sesión de encuestas
    const sesionEncuestas = {
      id: '12345678-1234-1234-1234-123456789002',
      nombre: 'Sesión de Prueba - Producto Encuestas',
      fecha_sesion: new Date().toISOString(),
      empresa_id: '87654321-4321-4321-4321-210987654322',
      industria_id: '11111111-1111-1111-1111-111111111112',
      pais_id: '22222222-2222-2222-2222-222222222223',
      usuarios_presentes_json: {
        moderador: 'Ana Martínez',
        observadores: ['Pedro Rodríguez', 'Laura Sánchez']
      },
      dolores_necesidades: 'Analizar funcionalidad de creación de encuestas',
      descripcion_cliente: 'Empresa que necesita mejorar su herramienta de encuestas online',
      seguimiento_programado: false,
      responsable_id: '33333333-3333-3333-3333-333333333334',
      investigacion_id: '44444444-4444-4444-4444-444444444445',
      creado_por: '33333333-3333-3333-3333-333333333334',
      estado: '55555555-5555-5555-5555-555555555556',
      tamaño: '66666666-6666-6666-6666-666666666667',
      relacion: '77777777-7777-7777-7777-777777777778'
    };

    // 3. Crear transcripciones
    const transcripcionProducto = {
      id: '12345678-1234-1234-1234-123456789101',
      reclutamiento_id: '12345678-1234-1234-1234-123456789001',
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
      reclutamiento_id: '12345678-1234-1234-1234-123456789002',
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

    // 4. Crear notas manuales
    const notasProducto = [
      {
        id: '12345678-1234-1234-1234-123456789201',
        participante_id: '87654321-4321-4321-4321-210987654321',
        sesion_id: '12345678-1234-1234-1234-123456789001',
        contenido: 'Participante mostró frustración inicial al no encontrar el producto objetivo. Sugiere mejorar la visibilidad en la navegación principal.',
        fecha_creacion: new Date().toISOString(),
        semaforo_riesgo: 'rojo',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789202',
        participante_id: '87654321-4321-4321-4321-210987654321',
        sesion_id: '12345678-1234-1234-1234-123456789001',
        contenido: 'Una vez encontrado el producto objetivo, el participante valoró positivamente la guía paso a paso y los ejemplos proporcionados.',
        fecha_creacion: new Date(Date.now() + 60000).toISOString(),
        semaforo_riesgo: 'verde',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789203',
        participante_id: '87654321-4321-4321-4321-210987654321',
        sesion_id: '12345678-1234-1234-1234-123456789001',
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
        participante_id: '87654321-4321-4321-4321-210987654322',
        sesion_id: '12345678-1234-1234-1234-123456789002',
        contenido: 'El flujo de creación de encuestas es intuitivo, pero el participante sugiere agregar una vista previa en tiempo real.',
        fecha_creacion: new Date().toISOString(),
        semaforo_riesgo: 'amarillo',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789302',
        participante_id: '87654321-4321-4321-4321-210987654322',
        sesion_id: '12345678-1234-1234-1234-123456789002',
        contenido: 'Participante solicita funcionalidad de drag-and-drop para reordenar preguntas y más opciones de personalización visual.',
        fecha_creacion: new Date(Date.now() + 60000).toISOString(),
        semaforo_riesgo: 'amarillo',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789303',
        participante_id: '87654321-4321-4321-4321-210987654322',
        sesion_id: '12345678-1234-1234-1234-123456789002',
        contenido: 'Excelente sugerencia: implementar sistema de plantillas de encuestas para usuarios frecuentes. Esto mejoraría significativamente la eficiencia.',
        fecha_creacion: new Date(Date.now() + 120000).toISOString(),
        semaforo_riesgo: 'verde',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: '12345678-1234-1234-1234-123456789304',
        participante_id: '87654321-4321-4321-4321-210987654322',
        sesion_id: '12345678-1234-1234-1234-123456789002',
        contenido: 'El participante tiene experiencia previa con herramientas similares y puede proporcionar comparaciones valiosas con la competencia.',
        fecha_creacion: new Date(Date.now() + 180000).toISOString(),
        semaforo_riesgo: 'neutral',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      }
    ];

    // Insertar datos en Supabase
    console.log('📝 [Simple Test Sessions] Insertando datos...');

    // Insertar sesiones
    const { error: sesionError1 } = await supabaseServer
      .from('sesiones')
      .insert(sesionProducto);

    const { error: sesionError2 } = await supabaseServer
      .from('sesiones')
      .insert(sesionEncuestas);

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
      sesionError1, sesionError2,
      transError1, transError2,
      notasError1, notasError2
    ].filter(error => error);

    if (errors.length > 0) {
      console.error('❌ [Simple Test Sessions] Errores al insertar:', errors);
      return res.status(500).json({ 
        error: 'Error al crear sesiones de prueba',
        details: errors
      });
    }

    console.log('✅ [Simple Test Sessions] Sesiones de prueba creadas exitosamente');

    return res.status(200).json({
      status: 'ok',
      message: 'Sesiones de prueba creadas exitosamente',
      sesiones: [
        {
          id: '12345678-1234-1234-1234-123456789001',
          nombre: 'Sesión de Prueba - Producto Objetivo',
          tipo: 'producto_objetivo',
          transcripcion_id: '12345678-1234-1234-1234-123456789101',
          notas_count: 3,
          semaforo_distribution: { rojo: 1, amarillo: 1, verde: 1 }
        },
        {
          id: '12345678-1234-1234-1234-123456789002',
          nombre: 'Sesión de Prueba - Producto Encuestas',
          tipo: 'producto_encuestas',
          transcripcion_id: '12345678-1234-1234-1234-123456789102',
          notas_count: 4,
          semaforo_distribution: { rojo: 0, amarillo: 2, verde: 1, neutral: 1 }
        }
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Simple Test Sessions] Error:', error);
    return res.status(500).json({ 
      error: 'Error al crear sesiones de prueba',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
