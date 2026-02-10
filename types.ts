export enum AppView {
  LANDING = 'LANDING', // Now acts as Login View
  LISTENER_HOME = 'LISTENER_HOME',
  WORKER_HOME = 'WORKER_HOME',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  APP_USER_MANAGEMENT = 'APP_USER_MANAGEMENT',
  
  // CMNL Apps
  APP_AGENDA = 'APP_AGENDA',
  APP_MUSICA = 'APP_MUSICA',
  APP_GUIONES = 'APP_GUIONES',
  APP_PROGRAMACION = 'APP_PROGRAMACION',

  // Sections
  SECTION_HISTORY = 'SECTION_HISTORY',
  SECTION_PROGRAMMING_PUBLIC = 'SECTION_PROGRAMMING_PUBLIC',
  SECTION_ABOUT = 'SECTION_ABOUT',
  SECTION_NEWS = 'SECTION_NEWS',
  SECTION_NEWS_DETAIL = 'SECTION_NEWS_DETAIL', // New view for reading news
  SECTION_PODCAST = 'SECTION_PODCAST',
  SECTION_PROFILE = 'SECTION_PROFILE',
}

export type UserClassification = 'Director' | 'Asesor' | 'Realizador de sonido' | 'Locutor' | 'Administrador' | 'Usuario';

export interface User {
  username: string;
  role: 'admin' | 'worker' | 'listener';
  name: string;
  classification?: UserClassification;
  avatar?: string;
  mobile?: string;
  password?: string;
}

export interface ProgramSchedule {
  name: string;
  start: string;
  end: string;
  days: number[]; // 0 = Sunday, 1 = Monday, etc.
}

export interface NewsItem {
  id: string;
  title: string;
  author: string;
  content: string;
  image?: string;
  date: string;
  category: string;
}

// --- AGENDA TYPES ---

export type EventCategory = 'PROGRAMA' | 'GRABACION' | 'REUNION' | 'MANTENIMIENTO' | 'REMOTO';

export interface AgendaEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO String or HH:mm
  endTime: string;
  date: string; // YYYY-MM-DD
  category: EventCategory;
  location?: string; // e.g., "Estudio 1", "Cabina"
  assignedTo?: string;
}

export interface RCMProgram {
  id: string;
  name: string;
  time: string; // e.g. "07:00 - 09:00"
  days: number[]; // 0-6
  active: boolean;
}

export interface DailyContent {
  centralTheme: string;
  programContent: {
    [programId: string]: {
      theme: string;
      ideas: string;
    };
  };
}

export interface Efemeride {
  id: string;
  date: string; // MM-DD
  event: string;
  type: 'nacional' | 'internacional';
}