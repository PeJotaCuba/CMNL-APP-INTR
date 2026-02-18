
/**
 * Servicio de integración con DeepSeek API.
 * Incluye sistema de respaldo (Mock Data) para funcionamiento offline o sin saldo.
 */

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";

// --- DATOS SIMULADOS (MOCK) PARA CUANDO NO HAY SALDO (ERROR 402) ---
const MOCK_IDEAS_TEXT = `[MODO DEMO - API SIN SALDO]
Esta es una respuesta simulada porque la API Key no tiene créditos actualmente.

1. Introducción:
Presentar el tema con un enfoque local, conectando con la audiencia de Bayamo. Usar una pregunta retórica para captar atención inmediata sobre la temática seleccionada.

2. Desarrollo:
Abordar los puntos clave mencionados en las instrucciones. Sería ideal entrevistar a un especialista local o usar un audio de archivo relevante de la fonoteca de RCM. Desglosar el problema o evento en tres aristas principales: impacto social, antecedentes históricos y situación actual.

3. Clímax:
Destacar el dato más impactante o la historia humana central. Generar emoción o reflexión crítica en el oyente.

4. Desenlace:
Resumen breve y llamado a la acción. Despedida con la frase habitual del programa y adelanto del próximo tema.`;

const MOCK_INFO_JSON = [
  { "title": "Ecured (Demo)", "url": "https://www.ecured.cu", "description": "Enciclopedia colaborativa cubana (Resultado simulado).", "type": "cuban" },
  { "title": "Granma (Demo)", "url": "https://www.granma.cu", "description": "Órgano oficial del PCC (Resultado simulado).", "type": "cuban" },
  { "title": "Juventud Rebelde", "url": "https://www.juventudrebelde.cu", "description": "Diario de la juventud (Resultado simulado).", "type": "cuban" },
  { "title": "UNESCO", "url": "https://www.unesco.org", "description": "Organización de Naciones Unidas (Resultado simulado).", "type": "international" },
  { "title": "Wikipedia", "url": "https://es.wikipedia.org", "description": "Enciclopedia libre (Resultado simulado).", "type": "international" },
  { "title": "BBC Mundo", "url": "https://www.bbc.com/mundo", "description": "Noticias internacionales (Resultado simulado).", "type": "international" }
];

const MOCK_WEEKLY_PLAN = `
**DÍA:** Lunes
**Temática del día:** Tarea Vida (Medio Ambiente)

**Programa:** Buenos Días, Bayamo
**Temática:** Acciones locales por el clima
**Ideas:** Comienza con un efecto de sonido de naturaleza (viento, agua) y una pregunta a la audiencia sobre los cambios de temperatura recientes. Entrevista a un especialista del CITMA en Granma sobre el plan de estado Tarea Vida. Estructura el segmento en tres partes: diagnóstico local, acciones concretas y cómo la población puede ayudar.
**Fuentes:** CITMA Granma, Periódico La Demajagua, Cubadebate, ONU Medio Ambiente, EcuRed.

**Programa:** Todos en Casa
**Temática:** Reciclaje creativo
**Ideas:** Enfoca el programa en soluciones prácticas. Enseña a hacer macetas con envases plásticos. Invita a una artesana local. Mantén un tono alegre y motivador.
**Fuentes:** Pinterest, Mujeres, Revista Muchacha, YouTube, Blog de Manualidades.

**Programa:** Noticiero (RCM Noticias)
**Temática:** Inversiones hidráulicas en la provincia
**Ideas:** Reportaje informativo sobre la reparación de redes de acueducto. Datos duros, cifras de ahorro de agua. Entrevista al delegado de Recursos Hidráulicos.
**Fuentes:** ACN, Granma, Mesa Redonda, Noticiero Nacional, Portal del Ciudadano.

**Programa:** Arte Bayamo
**Temática:** El paisaje en el audiovisual cubano
**Ideas:** Reseña documentales de la serie "Naturaleza Secreta". Entrevista a realizadores locales que filman en la Sierra Maestra.
**Fuentes:** Cubacine, Portal del Cine Cubano, TV Serrana, EICTV, La Jiribilla.

**Programa:** Parada Joven
**Temática:** Ecoturismo y senderismo
**Ideas:** Propuestas de rutas cercanas para jóvenes. Consejos de campismo responsable. Música trovanovista o indie relacionada con la naturaleza.
**Fuentes:** Campismo Popular, Juventud Rebelde, Alma Mater, Mochila, Vistar Magazine.

**Programa:** Hablando con Juana
**Temática:** Salud sexual y entorno saludable
**Ideas:** Relacionar la higiene ambiental con la salud comunitaria y familiar. Charla educativa con enfoque de género sobre el rol de la mujer en la higiene del hogar y la comunidad.
**Fuentes:** Cenesex, FMC, OPS, Infomed, Revista Mujeres.

**DÍA:** Martes
**Temática del día:** Soberanía Alimentaria

**Programa:** Buenos Días, Bayamo
**Temática:** Precios en el mercado agropecuario
**Ideas:** Sondeo de opinión en la calle (vox populi). Debate sobre la relación calidad-precio. Entrevista a un administrador de mercado.
**Fuentes:** MINAGRI, Portal del Ciudadano, La Demajagua, ONEI, Cubadebate.

**Programa:** Todos en Casa
**Temática:** Conservas de vegetales
**Ideas:** Receta paso a paso para encurtidos. Consejos para esterilizar frascos. Llamadas de la audiencia compartiendo sus trucos.
**Fuentes:** Solvisión, Cocina Cubana, Chef Cubano, Revista Bohemia, YouTube.

**Programa:** Noticiero (RCM Noticias)
**Temática:** Avance de la siembra de frío
**Ideas:** Nota informativa desde una cooperativa destacada. Entrevista al presidente de la ANAP en el municipio.
**Fuentes:** ANAP, ACN, Granma, Noticiero Provincial, Radio Reloj.

**Programa:** Arte Bayamo
**Temática:** Paisajismo en la plástica bayamesa
**Ideas:** Visita a un taller de pintura. Análisis de obras que reflejan el campo cubano.
**Fuentes:** UNEAC, Galería de Arte, La Jiribilla, CdeCuba, Arte por Excelencias.

**Programa:** Parada Joven
**Temática:** Jóvenes en el surco
**Ideas:** Historias de vida de jóvenes campesinos. La tecnología aplicada al agro (drones, apps).
**Fuentes:** BTJ, Juventud Rebelde, Alma Mater, FAO, Cubahora.

**Programa:** Hablando con Juana
**Temática:** Derecho a la alimentación
**Ideas:** Explicación de la Ley de Soberanía Alimentaria desde un punto de vista jurídico pero sencillo. Abogado invitado.
**Fuentes:** Gaceta Oficial, MINJUS, Fiscalía General, Cubadebate, Constitución de la República.
`;

// Helper para llamadas a la API
async function callDeepSeek(messages: any[]) {
  // 1. Prioridad: Key guardada por el usuario en LocalStorage (desde Admin)
  // 2. Fallback: Key en window (index.html)
  const localKey = localStorage.getItem('rcm_deepseek_key');
  const winKey = (window as any).DEEPSEEK_API_KEY;
  const envKey = (window as any).process?.env?.DEEPSEEK_API_KEY;
  
  const apiKey = localKey || winKey || envKey;
  
  if (!apiKey) {
    throw new Error("Falta la API Key. Configúrala en Ajustes > API.");
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.85, // Aumentada temperatura para más creatividad
        stream: false,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      if (response.status === 402) {
         throw new Error("QUOTA_EXCEEDED");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Error DeepSeek (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  } catch (error: any) {
    console.error("Fallo en llamada a DeepSeek:", error);
    throw error;
  }
}

/**
 * FUNCIÓN "CHAT GENERAL"
 */
export async function askDeepSeek(message: string): Promise<string> {
  const systemPrompt = "Eres el consultor editorial de Radio Ciudad Monumento (RCM).";
  
  try {
    return await callDeepSeek([
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ]);
  } catch (error: any) {
    if (error.message === "QUOTA_EXCEEDED") {
      return "⚠️ [Demo] La API reporta saldo insuficiente, pero estoy aquí para ayudarte. Como asistente editorial, sugiero revisar la pauta musical.";
    }
    return "Lo siento, hubo un error de conexión con la IA.";
  }
}

/**
 * FUNCIÓN "IDEAS"
 */
export async function getDeepSeekIdeas(theme: string, programName: string, additionalInstructions: string): Promise<string> {
  const systemPrompt = "Eres un guionista experto. Genera ideas estructuradas.";
  const userPrompt = `Genera un texto de 250 palabras para el programa "${programName}" sobre "${theme}". ${additionalInstructions}. Estructura: Intro, Desarrollo, Clímax, Desenlace.`;

  try {
    return await callDeepSeek([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);
  } catch (error: any) {
    if (error.message === "QUOTA_EXCEEDED" || error.message.includes("Failed to fetch")) {
      console.warn("Usando Mock Data para Ideas debido a error de API.");
      return MOCK_IDEAS_TEXT;
    }
    throw error;
  }
}

/**
 * FUNCIÓN "INFORMACIÓN"
 */
export async function getDeepSeekInfo(theme: string): Promise<any[]> {
  const systemPrompt = "Eres un investigador. Responde SOLO JSON.";
  const userPrompt = `6 fuentes sobre "${theme}". 3 cubanas, 3 internacionales. JSON Array format.`;

  try {
    const jsonString = await callDeepSeek([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);
    const cleanJson = jsonString.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error: any) {
    if (error.message === "QUOTA_EXCEEDED" || error.message.includes("Failed to fetch") || error instanceof SyntaxError) {
      console.warn("Usando Mock Data para Info debido a error de API.");
      return MOCK_INFO_JSON;
    }
    throw error;
  }
}

/**
 * FUNCIÓN "GENERAR PLANIFICACIÓN SEMANAL"
 */
export async function generateWeeklyPlan(weekLabel: string, efemeridesContext: string): Promise<string> {
  const systemPrompt = `Rol: Eres un planificador editorial experto de Radio Ciudad Monumento en Bayamo, Cuba. 
  Tu misión es crear una agenda semanal ÚNICA y ESPECÍFICA para las fechas proporcionadas.
  
  DIRECTRICES DE CREATIVIDAD Y NO REPETICIÓN:
  1. ESTÁ PROHIBIDO repetir la misma temática en la semana.
  2. Sé creativo. No uses siempre los mismos enfoques.
  3. Genera contenido SOLO para los días especificados en la entrada de datos.`;

  const userPrompt = `
DATOS DE ENTRADA (ESTRICTOS):
Contexto de Fechas y Efemérides:
${efemeridesContext}

REGLAS DE FLEXIBILIDAD TEMÁTICA (IMPORTANTE):
1. PROGRAMAS OBLIGADOS (Deben seguir estrictamente la "Temática del día"):
   - "Buenos Días, Bayamo"
   - "Noticiero" (o RCM Noticias)
   - "Parada Joven"

2. PROGRAMAS FLEXIBLES (Pueden usar la Temática del día O una propia según su perfil):
   - "Todos en Casa": Prioriza temas de hogar, familia y vida práctica (evita política densa).
   - "Arte Bayamo": Sigue calendario fijo (Lun: Audiovisual, Mar: Plástica, Miér: Literatura, Jue: Música, Vier: Escénicas).
   - "Hablando con Juana": Sigue calendario (Lun: Sexualidad, Mar: Jurídico, Miér: Variado, Jue: Historia/Política).
   - "Al son de la radio": SIEMPRE tema musical (Son Cubano).
   - Programas de Fin de Semana: Tema libre o acorde a su perfil.

TEMÁTICAS PRIORITARIAS (Usar si no hay efeméride fuerte, sin repetir):
Tarea Vida, Adelanto de las Mujeres, Soberanía Alimentaria, Legado de Fidel, Lucha contra Drogas.

FORMATO DE SALIDA:
Para cada día de la semana indicada:
**DÍA:** [Nombre del día]
**Temática del día:** [Tema central basado en efeméride o prioridad]

[Lista de programas del día]
**Programa:** [Nombre exacto]
**Temática:** [Tema específico creativo]
**Ideas:** [Guion breve: Intro, Desarrollo, Cierre. 200 palabras]
**Fuentes:** [5 fuentes]
`;

  try {
    return await callDeepSeek([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);
  } catch (error: any) {
    if (error.message === "QUOTA_EXCEEDED" || error.message.includes("Failed to fetch")) {
        console.warn("Usando Mock Data Semanal por error de API.");
        return MOCK_WEEKLY_PLAN;
    }
    throw error;
  }
}
