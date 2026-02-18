
import { Program, EfemeridesData, ConmemoracionesData, DailyContent, DayThemeData } from '../types';
import { DayInfo } from './dateUtils';

// --- CONFIGURACIÓN DE REGLAS ---

const MANDATORY_THEMES = [
  "Tarea Vida (Medio Ambiente)",
  "Adelanto de las Mujeres",
  "Soberanía Alimentaria",
  "Legado de Fidel Castro",
  "Lucha contra las Drogas"
];

const ARTE_BAYAMO_CALENDAR: Record<string, string> = {
  'Lunes': 'Audiovisuales',
  'Martes': 'Artes Plásticas',
  'Miércoles': 'Literatura',
  'Jueves': 'Música',
  'Viernes': 'Artes Escénicas'
};

const JUANA_CALENDAR: Record<string, string> = {
  'Lunes': 'Sexualidad y Familia',
  'Martes': 'Tema Jurídico',
  'Miércoles': 'Variado / Social',
  'Jueves': 'Historia y Política',
  'Viernes': 'Jurídico o Variado'
};

// Palabras clave para vincular efemérides con temas prioritarios
const THEME_KEYWORDS: Record<string, string[]> = {
  "Tarea Vida (Medio Ambiente)": ["ambiente", "naturaleza", "agua", "tierra", "forestal", "clima", "ciencia", "planeta"],
  "Adelanto de las Mujeres": ["mujer", "fmc", "vilma", "mariana", "género", "madre", "federada"],
  "Soberanía Alimentaria": ["agricultura", "campesino", "anap", "cooperativa", "azúcar", "zafra", "alimento", "siembra"],
  "Legado de Fidel Castro": ["fidel", "comandante", "líder", "revolución", "moncada", "granma", "sierra"],
  "Lucha contra las Drogas": ["salud", "droga", "vicio", "higiene", "médico", "enfermera", "prevención"]
};

// --- AYUDANTES ---

const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const getDayName = (dayName: string): string => {
  const norm = normalize(dayName);
  if (norm.includes('lunes')) return 'Lunes';
  if (norm.includes('martes')) return 'Martes';
  if (norm.includes('miercoles')) return 'Miércoles';
  if (norm.includes('jueves')) return 'Jueves';
  if (norm.includes('viernes')) return 'Viernes';
  if (norm.includes('sabado')) return 'Sábado';
  if (norm.includes('domingo')) return 'Domingo';
  return dayName;
};

// --- LÓGICA PRINCIPAL ---

export const generateWeeklyAgenda = (
  weekId: string,
  days: (DayInfo | null)[],
  currentMonthName: string,
  programs: Program[],
  efemeridesData: EfemeridesData,
  conmemoracionesData: ConmemoracionesData
): { updatedPrograms: Program[], updatedDayThemes: DayThemeData } => {

  const updatedPrograms = programs.map(p => ({ ...p, dailyData: { ...p.dailyData } }));
  const updatedDayThemes: DayThemeData = {};
  
  // 1. Obtener efemérides de la semana
  const monthEfemerides = efemeridesData[currentMonthName] || [];
  const monthConmemoraciones = conmemoracionesData[currentMonthName] || [];

  // 2. Planificar Temáticas Diarias (Lunes a Viernes)
  const weekDays = days.filter(d => d !== null) as DayInfo[];
  const assignedThemes: Record<string, string> = {}; // Fecha -> Tema
  const availableThemes = [...MANDATORY_THEMES];

  // Paso 2.1: Buscar "Strong Events" y coincidencias temáticas
  weekDays.forEach(day => {
    const dayName = getDayName(day.name);
    // Sábado y Domingo tienen lógica aparte o libre
    if (dayName === 'Sábado' || dayName === 'Domingo') return;

    // Buscar eventos del día
    const evs = monthEfemerides.filter(e => e.day === day.date);
    const comms = monthConmemoraciones.filter(c => c.day === day.date);

    // Determinar si hay efeméride fuerte
    let strongTheme = "";
    
    // Si hay conmemoración nacional importante, esa manda
    if (comms.length > 0 && comms[0].national) {
      strongTheme = comms[0].national;
    } else if (evs.length > 0) {
      // Buscar si alguna efeméride coincide con un tema obligatorio disponible
      for (const theme of availableThemes) {
        const keywords = THEME_KEYWORDS[theme];
        const match = evs.find(e => keywords.some(k => normalize(e.event).includes(k) || normalize(e.description).includes(k)));
        if (match) {
          strongTheme = theme;
          // Eliminar de disponibles para no repetir
          const idx = availableThemes.indexOf(theme);
          if (idx > -1) availableThemes.splice(idx, 1);
          break;
        }
      }
      
      // Si no coincide con obligatorio pero es relevante (historia pura)
      if (!strongTheme) {
        // Simple heurística: si la descripción menciona "aniversario", "muerte", "nacimiento" de patriota
        const patriotic = evs.find(e => /céspedes|martí|maceo|guerra|batalla|fundación|aniversario|natalicio/i.test(e.description) || /aniversario|natalicio/i.test(e.event));
        if (patriotic) strongTheme = `Historia: ${patriotic.event}`;
      }
    }

    if (strongTheme) {
      assignedThemes[day.name] = strongTheme;
    }
  });

  // Paso 2.2: Rellenar días vacíos (L-V) con los temas obligatorios restantes
  weekDays.forEach(day => {
    const dayName = getDayName(day.name);
    if (dayName === 'Sábado' || dayName === 'Domingo') return;

    if (!assignedThemes[day.name]) {
      if (availableThemes.length > 0) {
        // Asignar el siguiente disponible
        const theme = availableThemes.shift()!;
        assignedThemes[day.name] = theme;
      } else {
        assignedThemes[day.name] = "Temática Libre / Actualidad Bayamesa";
      }
    }
  });

  // Guardar Temas de Portada
  Object.keys(assignedThemes).forEach(dName => {
    updatedDayThemes[`${weekId}-${dName}`] = assignedThemes[dName];
  });


  // 3. Generar Contenido por Programa
  weekDays.forEach(day => {
    const dayName = getDayName(day.name);
    const dateKey = `${weekId}-${day.name}`;
    const coverTheme = assignedThemes[day.name] || "Actualidad";
    
    // Obtener eventos del día para uso en programas
    const dayEvs = monthEfemerides.filter(e => e.day === day.date);
    
    // Recorrer programas que se emiten hoy
    updatedPrograms.forEach(prog => {
      // Helper to check if program runs on this day (handles number[] and string[] days)
      const runsOnDay = (pDays: (string | number)[], dName: string) => {
         const dNameNorm = normalize(dName);
         const dayIndexMap: Record<string, number> = { 'domingo': 0, 'lunes': 1, 'martes': 2, 'miercoles': 3, 'jueves': 4, 'viernes': 5, 'sabado': 6 };
         const dIdx = dayIndexMap[dNameNorm];
         
         return pDays.some(d => {
             if (typeof d === 'number') return d === dIdx;
             return normalize(d).includes(dNameNorm);
         });
      };

      if (!runsOnDay(prog.days, dayName)) return;

      let theme = "";
      let instructions = "";

      // --- LÓGICA ESPECÍFICA POR PROGRAMA ---

      if (normalize(prog.name).includes("todos en casa")) {
        // Regla: Hogar, familia, vida práctica. Evitar política.
        theme = "Hogar y Familia";
        instructions = "Abordar temas prácticos de convivencia, salud doméstica, cocina o trucos del hogar. Mantener tono ligero y útil. Evitar efemérides políticas densas.";
      
      } else if (normalize(prog.name).includes("arte bayamo")) {
        // Regla: Calendario fijo
        const artType = ARTE_BAYAMO_CALENDAR[dayName] || "Cultura General";
        theme = artType;
        
        // Buscar efeméride cultural vinculada
        const artEv = dayEvs.find(e => 
            normalize(e.description).includes("cine") || 
            normalize(e.description).includes("libro") || 
            normalize(e.description).includes("música") || 
            normalize(e.description).includes("teatro") ||
            normalize(e.description).includes("pintor") ||
            normalize(e.description).includes("artista") ||
            normalize(e.description).includes("cultura")
        );

        if (artEv) {
           instructions = `Vincular la manifestación (${artType}) con la efeméride: ${artEv.event}. Comentar obra, autor o impacto cultural.`;
        } else {
           instructions = `Desarrollar contenido sobre ${artType} con enfoque local o nacional. Promover artistas bayameses o agenda cultural de la ciudad.`;
        }

      } else if (normalize(prog.name).includes("parada joven")) {
        theme = "Mundo Juvenil";
        instructions = "Enfocar en formación vocacional, recreación sana, psicología juvenil o uso de tecnologías. Si hay efemérides estudiantiles (FEEM/FEU), vincularlas.";

      } else if (normalize(prog.name).includes("hablando con juana")) {
        // Regla: Calendario fijo Juana
        const topic = JUANA_CALENDAR[dayName] || "Variado";
        theme = topic;
        instructions = `Seguir línea editorial de ${topic}. `;
        
        // Si el tema es Historia/Política o hay efeméride fuerte
        if (topic.includes("Historia") && dayEvs.length > 0) {
            instructions += `Aprovechar efeméride: ${dayEvs[0].event}.`;
        } else if (topic.includes("Sexualidad")) {
            instructions += "Abordar educación sexual, pareja o dinámica familiar.";
        } else if (topic.includes("Jurídico")) {
            instructions += "Tratar leyes vigentes, constitución o derechos ciudadanos.";
        } else {
            instructions += "Buscar especialista o comentario de bien público para la familia.";
        }

      } else if (normalize(prog.name).includes("al son de la radio")) {
        theme = "Son Cubano";
        instructions = "Centrarse estrictamente en el Son: historia, grandes exponentes (Matamoros, Piñeiro, etc.), agrupaciones actuales, o análisis de ritmo y letra. No desviar a otros géneros.";

      } else if (normalize(prog.name).includes("noticiero") || normalize(prog.name).includes("buenos")) {
        // Programas informativos: Usan el tema de portada
        theme = coverTheme;
        
        // Si el tema es efeméride, dar datos. Si es temática prioritaria, dar enfoque.
        const relatedEv = dayEvs.find(e => coverTheme.includes(e.event) || coverTheme.includes("Historia"));
        
        if (relatedEv) {
            instructions = `Cobertura informativa sobre: ${relatedEv.event} (${relatedEv.description}). Resaltar impacto histórico y vigencia.`;
        } else {
            instructions = `Desarrollar la línea de "${coverTheme}" con reportajes, entrevistas o datos actuales de la provincia Granma.`;
        }
      
      } else {
        // Resto de programas (Fin de semana, etc)
        if (dayName === 'Domingo') {
             theme = "Dominical / Variado";
             instructions = "Contenido ameno, histórico o musical según perfil del espacio (Cómplices, Alba y Crisol).";
        } else {
             theme = coverTheme;
             instructions = "Adaptar temática del día al perfil específico del programa, manteniendo el interés local.";
        }
      }

      // Asignar datos
      prog.dailyData![dateKey] = {
        theme,
        instructions,
        ideas: '' // Add mandatory 'ideas' field
      };
    });
  });

  return { updatedPrograms, updatedDayThemes };
};