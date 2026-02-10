export interface UserProfile {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: 'admin' | 'escritor';
  phone?: string;
  interests: {
    programIds: string[];
    days: number[]; // 0-6
  };
}

export interface Program {
  id: string;
  name: string;
  time: string;
  days: number[];
  active: boolean;
  dailyData: {
    [dateKey: string]: { // Key format: "Mes-Semana-Día" e.g., "Feb-W1-Mon"
      theme: string;
      ideas: string;
    };
  };
}

export interface EfemeridesData {
  [month: string]: {
    day: number;
    event: string;
    type: 'nacional' | 'internacional';
  }[];
}

export interface ConmemoracionesData {
  [month: string]: {
    day: number;
    event: string;
  }[];
}

export interface DayThemeData {
  [dateKey: string]: string; // Key: "Mes-Semana-Día", Value: Central Theme
}