
export enum UserRole {
  LISTENER = 'listener',
  WORKER = 'worker',
  ADMIN = 'admin',
  ESCRITOR = 'escritor' // Compatibility for sub-app
}

export enum AppView {
  LANDING = 'LANDING',
  LISTENER_HOME = 'LISTENER_HOME',
  WORKER_HOME = 'WORKER_HOME',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  APP_USER_MANAGEMENT = 'APP_USER_MANAGEMENT',
  APP_AGENDA = 'APP_AGENDA',
  APP_MUSICA = 'APP_MUSICA',
  APP_GUIONES = 'APP_GUIONES',
  APP_PROGRAMACION = 'APP_PROGRAMACION',
  SECTION_HISTORY = 'SECTION_HISTORY',
  SECTION_PROGRAMMING_PUBLIC = 'SECTION_PROGRAMMING_PUBLIC',
  SECTION_ABOUT = 'SECTION_ABOUT',
  SECTION_NEWS = 'SECTION_NEWS',
  SECTION_NEWS_DETAIL = 'SECTION_NEWS_DETAIL',
  SECTION_PODCAST = 'SECTION_PODCAST',
  SECTION_PROFILE = 'SECTION_PROFILE'
}

// Fixed missing UserClassification
export type UserClassification = 'Usuario' | 'Director' | 'Asesor' | 'Realizador de sonido' | 'Locutor' | 'Administrador' | 'Realizador';

export interface User {
  id?: string;
  name: string;
  username: string;
  mobile: string;
  password?: string;
  pin?: string;
  role: 'admin' | 'worker' | 'listener' | 'escritor';
  classification?: string;
  photo?: string;
  phone?: string; // For compatibility
  interests?: {
    days: string[];
    programIds: string[];
  };
}

// Added UserProfile alias
export type UserProfile = User;

export interface NewsItem {
  id: string;
  title: string;
  author: string;
  content: string;
  date: string;
  category: string;
  image: string;
}

// Updated DailyContent and ProgramContent to satisfy all sub-app requirements
export interface DailyContent {
  theme: string;
  ideas: string;
  instructions?: string;
  centralTheme?: string;
  programContent?: {
    [programId: string]: ProgramContent;
  };
}

export interface ProgramContent {
  theme: string;
  ideas: string;
}

// Added consolidated Program interface
export interface Program {
  id: string;
  name: string;
  time: string;
  days: string[] | number[];
  active: boolean;
  dailyData: {
    [dateKey: string]: DailyContent;
  };
}

export type RCMProgram = Program;

export interface Efemeride {
  day: number;
  event: string;
  description: string;
}

// Added EfemeridesData type
export type EfemeridesData = {
  [month: string]: Efemeride[];
};

// Added Conmemoracion interface
export interface Conmemoracion {
  day: number;
  national: string;
  international: string;
}

// Added ConmemoracionesData type
export type ConmemoracionesData = {
  [month: string]: Conmemoracion[];
};

// Added DayThemeData type
export type DayThemeData = {
  [dateKey: string]: string;
};

// Added CloudConfig interface
export interface CloudConfig {
  endpoint: string;
}

// Added MonthData interface
export interface MonthData {
  id: string;
  name: string;
  status: 'listo' | 'revision' | 'actual' | 'pendiente' | string;
  color: string;
  isDraft?: boolean;
}
