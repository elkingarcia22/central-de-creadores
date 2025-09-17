import { NextApiRequest, NextApiResponse } from 'next';
import { supabaseServer } from '../../../api/supabase-server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('🧪 [Test Sessions] Creando sesiones de prueba...');

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

    // 3. Crear investigaciones
    const investigacionProducto = {
      id: 'test-investigacion-001',
      nombre: 'Investigación Producto Objetivo',
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      producto_id: 'test-producto-001',
      responsable_id: 'test-user-001',
      tipo_investigacion_id: 'test-tipo-001',
      estado_reclutamiento: 'test-estado-reclutamiento-001',
      riesgo: 'test-riesgo-001',
      libreto: 'Evaluar la usabilidad del nuevo producto objetivo para mejorar la experiencia del usuario',
      tipo_prueba: 'usabilidad',
      plataforma: 'web',
      link_prueba: 'https://test-producto.com',
      creado_por: 'test-user-001',
      estado: 'en_progreso',
      tipo_sesion: 'reclutamiento',
      descripcion: 'Investigación enfocada en evaluar la usabilidad del producto objetivo'
    };

    const investigacionEncuestas = {
      id: 'test-investigacion-002',
      nombre: 'Investigación Producto Encuestas',
      fecha_inicio: new Date().toISOString(),
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      producto_id: 'test-producto-002',
      responsable_id: 'test-user-002',
      tipo_investigacion_id: 'test-tipo-002',
      estado_reclutamiento: 'test-estado-reclutamiento-002',
      riesgo: 'test-riesgo-002',
      libreto: 'Analizar la funcionalidad de creación de encuestas para mejorar la herramienta',
      tipo_prueba: 'funcionalidad',
      plataforma: 'web',
      link_prueba: 'https://test-encuestas.com',
      creado_por: 'test-user-002',
      estado: 'en_progreso',
      tipo_sesion: 'reclutamiento',
      descripcion: 'Investigación enfocada en evaluar la funcionalidad de encuestas'
    };

    // 4. Crear libretos de investigación
    const libretoProducto = {
      id: 'test-libreto-producto-001',
      investigacion_id: 'test-investigacion-001',
      problema_situacion: 'Los usuarios tienen dificultades para encontrar y usar el producto objetivo en la plataforma',
      hipotesis: 'Mejorar la visibilidad y usabilidad del producto objetivo aumentará la conversión',
      objetivos: 'Identificar puntos de fricción en el uso del producto objetivo y proponer mejoras',
      resultado_esperado: 'Lista de mejoras priorizadas para implementar en el producto',
      productos_requeridos: ['Producto objetivo', 'Dashboard de administración'],
      plataforma_id: 'test-plataforma-001',
      tipo_prueba: 'usabilidad',
      rol_empresa_id: 'test-rol-001',
      industria_id: 'test-industria-001',
      pais: 'Colombia',
      numero_participantes_esperados: 8,
      nombre_sesion: 'Sesión de Usabilidad - Producto Objetivo',
      usuarios_participantes: ['Usuario final', 'Administrador'],
      duracion_estimada_minutos: 60,
      descripcion_general: 'Sesión para evaluar la usabilidad del producto objetivo con usuarios reales',
      link_prototipo: 'https://prototipo-producto.com',
      creado_por: 'test-user-001'
    };

    const libretoEncuestas = {
      id: 'test-libreto-encuestas-002',
      investigacion_id: 'test-investigacion-002',
      problema_situacion: 'Los usuarios encuentran difícil crear y configurar encuestas en la plataforma',
      hipotesis: 'Simplificar el proceso de creación de encuestas mejorará la adopción',
      objetivos: 'Identificar obstáculos en la creación de encuestas y proponer mejoras',
      resultado_esperado: 'Propuesta de mejoras para el flujo de creación de encuestas',
      productos_requeridos: ['Constructor de encuestas', 'Editor de preguntas'],
      plataforma_id: 'test-plataforma-002',
      tipo_prueba: 'funcionalidad',
      rol_empresa_id: 'test-rol-002',
      industria_id: 'test-industria-002',
      pais: 'México',
      numero_participantes_esperados: 6,
      nombre_sesion: 'Sesión de Funcionalidad - Encuestas',
      usuarios_participantes: ['Creador de encuestas', 'Analista'],
      duracion_estimada_minutos: 45,
      descripcion_general: 'Sesión para evaluar la funcionalidad de creación de encuestas',
      link_prototipo: 'https://prototipo-encuestas.com',
      creado_por: 'test-user-002'
    };

    // 5. Crear transcripciones
    const transcripcionProducto = {
      id: 'test-transcripcion-producto-001',
      reclutamiento_id: 'test-sesion-producto-001',
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
      id: 'test-transcripcion-encuestas-002',
      reclutamiento_id: 'test-sesion-encuestas-002',
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

    // 6. Crear notas manuales
    const notasProducto = [
      {
        id: 'test-nota-producto-001',
        participante_id: 'test-participante-001',
        sesion_id: 'test-sesion-producto-001',
        contenido: 'Participante mostró frustración inicial al no encontrar el producto objetivo. Sugiere mejorar la visibilidad en la navegación principal.',
        fecha_creacion: new Date().toISOString(),
        semaforo_riesgo: 'rojo',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: 'test-nota-producto-002',
        participante_id: 'test-participante-001',
        sesion_id: 'test-sesion-producto-001',
        contenido: 'Una vez encontrado el producto objetivo, el participante valoró positivamente la guía paso a paso y los ejemplos proporcionados.',
        fecha_creacion: new Date(Date.now() + 60000).toISOString(),
        semaforo_riesgo: 'verde',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: 'test-nota-producto-003',
        participante_id: 'test-participante-001',
        sesion_id: 'test-sesion-producto-001',
        contenido: 'El participante sugiere agregar un enlace directo al producto objetivo desde la página principal para mejorar la discoverabilidad.',
        fecha_creacion: new Date(Date.now() + 120000).toISOString(),
        semaforo_riesgo: 'amarillo',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      }
    ];

    const notasEncuestas = [
      {
        id: 'test-nota-encuestas-001',
        participante_id: 'test-participante-002',
        sesion_id: 'test-sesion-encuestas-002',
        contenido: 'El flujo de creación de encuestas es intuitivo, pero el participante sugiere agregar una vista previa en tiempo real.',
        fecha_creacion: new Date().toISOString(),
        semaforo_riesgo: 'amarillo',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: 'test-nota-encuestas-002',
        participante_id: 'test-participante-002',
        sesion_id: 'test-sesion-encuestas-002',
        contenido: 'Participante solicita funcionalidad de drag-and-drop para reordenar preguntas y más opciones de personalización visual.',
        fecha_creacion: new Date(Date.now() + 60000).toISOString(),
        semaforo_riesgo: 'amarillo',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: 'test-nota-encuestas-003',
        participante_id: 'test-participante-002',
        sesion_id: 'test-sesion-encuestas-002',
        contenido: 'Excelente sugerencia: implementar sistema de plantillas de encuestas para usuarios frecuentes. Esto mejoraría significativamente la eficiencia.',
        fecha_creacion: new Date(Date.now() + 120000).toISOString(),
        semaforo_riesgo: 'verde',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      },
      {
        id: 'test-nota-encuestas-004',
        participante_id: 'test-participante-002',
        sesion_id: 'test-sesion-encuestas-002',
        contenido: 'El participante tiene experiencia previa con herramientas similares y puede proporcionar comparaciones valiosas con la competencia.',
        fecha_creacion: new Date(Date.now() + 180000).toISOString(),
        semaforo_riesgo: 'neutral',
        convertida_a_dolor: false,
        convertida_a_perfilamiento: false
      }
    ];

    // Insertar datos en Supabase
    console.log('📝 [Test Sessions] Insertando datos...');

    // Insertar sesiones
    const { error: sesionError1 } = await supabaseServer
      .from('sesiones')
      .insert(sesionProducto);

    const { error: sesionError2 } = await supabaseServer
      .from('sesiones')
      .insert(sesionEncuestas);

    // Insertar investigaciones
    const { error: invError1 } = await supabaseServer
      .from('investigaciones')
      .insert(investigacionProducto);

    const { error: invError2 } = await supabaseServer
      .from('investigaciones')
      .insert(investigacionEncuestas);

    // Insertar libretos
    const { error: libretoError1 } = await supabaseServer
      .from('libretos_investigacion')
      .insert(libretoProducto);

    const { error: libretoError2 } = await supabaseServer
      .from('libretos_investigacion')
      .insert(libretoEncuestas);

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
      invError1, invError2,
      libretoError1, libretoError2,
      transError1, transError2,
      notasError1, notasError2
    ].filter(error => error);

    if (errors.length > 0) {
      console.error('❌ [Test Sessions] Errores al insertar:', errors);
      return res.status(500).json({ 
        error: 'Error al crear sesiones de prueba',
        details: errors
      });
    }

    console.log('✅ [Test Sessions] Sesiones de prueba creadas exitosamente');

    return res.status(200).json({
      status: 'ok',
      message: 'Sesiones de prueba creadas exitosamente',
      sesiones: [
        {
          id: 'test-sesion-producto-001',
          nombre: 'Sesión de Prueba - Producto Objetivo',
          tipo: 'producto_objetivo',
          transcripcion_id: 'test-transcripcion-producto-001',
          notas_count: 3,
          semaforo_distribution: { rojo: 1, amarillo: 1, verde: 1 }
        },
        {
          id: 'test-sesion-encuestas-002',
          nombre: 'Sesión de Prueba - Producto Encuestas',
          tipo: 'producto_encuestas',
          transcripcion_id: 'test-transcripcion-encuestas-002',
          notas_count: 4,
          semaforo_distribution: { rojo: 0, amarillo: 2, verde: 1, neutral: 1 }
        }
      ],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ [Test Sessions] Error:', error);
    return res.status(500).json({ 
      error: 'Error al crear sesiones de prueba',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}
