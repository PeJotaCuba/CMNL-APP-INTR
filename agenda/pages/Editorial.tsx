import React, { useState } from 'react';
import { UserProfile, Program, DayThemeData, EfemeridesData, ConmemoracionesData } from '../types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Calendar } from 'lucide-react';

interface Props {
  user: UserProfile;
  programs: Program[];
  dayThemes: DayThemeData;
  efemerides: EfemeridesData;
  conmemoraciones: ConmemoracionesData;
  onUpdateProgram: (p: Program) => void;
  onUpdateMany: (ps: Program[]) => void;
  onUpdateDayThemes: (themes: DayThemeData) => void;
  filterEnabled: boolean;
  onClearAll: () => void;
}

const Editorial: React.FC<Props> = ({ 
    user, programs, dayThemes, onUpdateProgram, onUpdateDayThemes, filterEnabled
}) => {
  const navigate = useNavigate();
  // Hierarchy: Month -> Week -> Day
  const [level, setLevel] = useState<'months'|'weeks'|'days'|'editor'>('months');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState<number>(0);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  const handleMonthSelect = (idx: number) => {
    setSelectedMonth(idx);
    setLevel('weeks');
  };

  const handleWeekSelect = (idx: number) => {
    setSelectedWeek(idx);
    setLevel('days');
  };

  const handleDaySelect = (day: Date) => {
    setSelectedDay(day);
    setLevel('editor');
  };

  const getDaysOfWeek = (month: number, weekIdx: number) => {
    const year = new Date().getFullYear();
    const firstDay = new Date(year, month, 1);
    // Find first Monday or start of week logic
    const offset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; 
    const startCalendar = new Date(firstDay);
    startCalendar.setDate(firstDay.getDate() - offset);
    
    // Add weeks
    startCalendar.setDate(startCalendar.getDate() + (weekIdx * 7));
    
    const days = [];
    for(let i=0; i<7; i++) {
       const d = new Date(startCalendar);
       d.setDate(startCalendar.getDate() + i);
       days.push(d);
    }
    return days;
  };

  const getKey = (d: Date) => `${months[d.getMonth()].substring(0,3)}-W${selectedWeek+1}-${d.getDate()}`;

  const renderEditor = () => {
    if (!selectedDay) return null;
    const dateKey = getKey(selectedDay);
    const dayTheme = dayThemes[dateKey] || '';

    // Filter programs for this day of week (0=Sun)
    let dailyPrograms = programs.filter(p => p.days.includes(selectedDay.getDay()));
    if (filterEnabled) {
        dailyPrograms = dailyPrograms.filter(p => user.interests.programIds.includes(p.id));
    }

    return (
        <div className="flex flex-col h-full bg-[#221810]">
            <header className="p-4 bg-[#2C2420] border-b border-white/5 flex items-center gap-3">
                <button onClick={() => setLevel('days')}><ArrowLeft className="text-stone-400" /></button>
                <div>
                    <h2 className="text-white font-bold text-lg">{selectedDay.toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric'})}</h2>
                    <p className="text-xs text-[#ec6d13]">Editor de Contenido</p>
                </div>
            </header>
            <div className="p-4 overflow-y-auto space-y-6 pb-20">
                <div className="bg-[#2C2420] p-4 rounded-2xl border border-white/5">
                    <label className="text-xs text-stone-400 uppercase font-bold mb-2 block">Temática Central</label>
                    <textarea 
                        className="w-full bg-[#221810] text-white p-3 rounded-xl border border-white/5 focus:border-[#ec6d13] outline-none"
                        value={dayTheme}
                        onChange={(e) => onUpdateDayThemes({...dayThemes, [dateKey]: e.target.value})}
                        placeholder="Tema del día..."
                    />
                </div>

                <div className="space-y-4">
                    {dailyPrograms.map(prog => {
                        const pData = prog.dailyData[dateKey] || { theme: '', ideas: '' };
                        return (
                            <div key={prog.id} className="bg-[#2C2420] rounded-2xl border border-white/5 overflow-hidden">
                                <div className="bg-[#ec6d13]/10 p-3 border-b border-white/5 flex justify-between items-center">
                                    <span className="font-bold text-[#ec6d13] text-sm">{prog.name}</span>
                                    <span className="text-xs text-stone-500">{prog.time}</span>
                                </div>
                                <div className="p-4 space-y-3">
                                    <input 
                                        className="w-full bg-[#221810] text-white p-3 rounded-xl border border-white/5 text-sm"
                                        placeholder="Tema del programa"
                                        value={pData.theme}
                                        onChange={(e) => {
                                            const updatedProg = {...prog, dailyData: {...prog.dailyData, [dateKey]: {...pData, theme: e.target.value}}};
                                            onUpdateProgram(updatedProg);
                                        }}
                                    />
                                    <textarea 
                                        className="w-full bg-[#221810] text-white p-3 rounded-xl border border-white/5 text-sm min-h-[80px]"
                                        placeholder="Ideas y notas..."
                                        value={pData.ideas}
                                        onChange={(e) => {
                                            const updatedProg = {...prog, dailyData: {...prog.dailyData, [dateKey]: {...pData, ideas: e.target.value}}};
                                            onUpdateProgram(updatedProg);
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
  };

  if (level === 'editor') return renderEditor();

  return (
    <div className="flex flex-col h-full bg-[#221810] p-4">
      <header className="flex items-center gap-3 mb-6">
        <button onClick={() => {
            if(level === 'days') setLevel('weeks');
            else if(level === 'weeks') setLevel('months');
            else navigate('/home');
        }} className="p-2 bg-white/5 rounded-full"><ArrowLeft size={20} className="text-stone-400" /></button>
        <h1 className="text-2xl font-serif font-bold text-white">
            {level === 'months' ? 'Seleccionar Mes' : level === 'weeks' ? months[selectedMonth] : 'Seleccionar Día'}
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto space-y-3">
        {level === 'months' && months.map((m, idx) => (
            <button key={m} onClick={() => handleMonthSelect(idx)} className="w-full bg-[#2C2420] p-4 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-[#3E2E24]">
                <span className="text-white font-bold">{m}</span>
                <ChevronRight className="text-stone-600" />
            </button>
        ))}

        {level === 'weeks' && [1,2,3,4,5].map((w, idx) => (
            <button key={w} onClick={() => handleWeekSelect(idx)} className="w-full bg-[#2C2420] p-4 rounded-2xl border border-white/5 flex justify-between items-center hover:bg-[#3E2E24]">
                <div>
                    <span className="text-white font-bold block">Semana {w}</span>
                    <span className="text-xs text-stone-500">Planificación semanal</span>
                </div>
                <ChevronRight className="text-stone-600" />
            </button>
        ))}

        {level === 'days' && getDaysOfWeek(selectedMonth, selectedWeek).map((d, idx) => (
            <button key={idx} onClick={() => handleDaySelect(d)} className="w-full bg-[#2C2420] p-4 rounded-2xl border border-white/5 flex items-center gap-4 hover:bg-[#3E2E24]">
                <div className="bg-[#221810] w-12 h-12 rounded-xl flex flex-col items-center justify-center border border-white/5 text-[#ec6d13]">
                    <span className="text-[10px] uppercase font-bold">{d.toLocaleString('es-ES', {weekday: 'short'})}</span>
                    <span className="text-lg font-bold leading-none">{d.getDate()}</span>
                </div>
                <div className="text-left">
                   <span className="text-white font-bold block capitalize">{d.toLocaleDateString('es-ES', {weekday: 'long'})}</span>
                   <span className="text-xs text-stone-500">{dayThemes[getKey(d)] || 'Sin tema central'}</span>
                </div>
            </button>
        ))}
      </div>
    </div>
  );
};

export default Editorial;