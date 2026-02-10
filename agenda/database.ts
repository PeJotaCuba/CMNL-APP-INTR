import { UserProfile, Program, EfemeridesData, ConmemoracionesData, DayThemeData } from './types';

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'admin-root',
    name: 'Administrador Principal',
    username: 'admin',
    password: '123',
    role: 'admin',
    interests: { programIds: [], days: [] }
  },
  {
    id: 'writer-1',
    name: 'Escritor Base',
    username: 'escritor',
    password: '123',
    role: 'escritor',
    interests: { programIds: ['p1', 'p2'], days: [1, 2, 3, 4, 5] }
  }
];

export const INITIAL_PROGRAMS: Program[] = [
  { id: 'p1', name: 'Buenos Días Bayamo', time: '07:00', days: [1,2,3,4,5,6], active: true, dailyData: {} },
  { id: 'p2', name: 'La Cumbancha', time: '09:00', days: [1,2,3,4,5,6], active: true, dailyData: {} },
  { id: 'p3', name: 'RCM Noticias', time: '11:00', days: [1,2,3,4,5,6], active: true, dailyData: {} },
  { id: 'p4', name: 'Arte Bayamo', time: '11:15', days: [1,2,3,4,5], active: true, dailyData: {} },
  { id: 'p5', name: 'Noticiero Provincial', time: '12:00', days: [0,1,2,3,4,5,6], active: true, dailyData: {} },
  { id: 'p6', name: 'Hablando con Juana', time: '13:30', days: [1,2,3,4,5], active: true, dailyData: {} }
];

export const INITIAL_EFEMERIDES: EfemeridesData = {
  "Enero": [
    { day: 1, event: "Triunfo de la Revolución", type: "nacional" },
    { day: 28, event: "Natalicio de José Martí", type: "nacional" }
  ]
};

export const INITIAL_CONMEMORACIONES: ConmemoracionesData = {};
export const INITIAL_DAY_THEMES: DayThemeData = {};