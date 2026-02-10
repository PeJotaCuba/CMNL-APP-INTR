import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Save, Settings, ChevronRight, ChevronLeft, 
  FileText, Mic, Sparkles, Download, Database, Plus, Trash2, Edit3 
} from 'lucide-react';
import { RCMProgram, DailyContent, Efemeride } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  onBack: () => void;
}

// --- INITIAL DATA SEED ---
const INITIAL_PROGRAMS: RCMProgram[] = [
  { id: 'p1', name: 'Buenos Días Bayamo', time: '07:00', days: [1,2,3,4,5,6], active: true },
  { id: 'p2', name: 'La Cumbancha', time: '09:00', days: [1,2,3,4,5,6], active: true },
  { id: 'p3', name: 'RCM Noticias', time: '11:00', days: [1,2,3,4,5,6], active: true },
  { id: 'p4', name: 'Arte Bayamo', time: '11:15', days: [1,2,3,4,5], active: true },
  { id: 'p5', name: 'Noticiero Provincial', time: '12:00', days: [0,1,2,3,4,5,6], active: true },
  { id: 'p6', name: 'Hablando con Juana', time: '13:30', days: [1,2,3,4,5], active: true },
];

const INITIAL_EFEMERIDES: Efemeride[] = [
  { id: 'e1', date: '01-01', event: 'Triunfo de la Revolución', type: 'nacional' },
  { id: 'e2', date: '01-28', event: 'Natalicio de José Martí', type: 'nacional' },
];

const AgendaApp: React.FC<Props> = ({ onBack }) => {
  // Views: 'DASHBOARD' | 'EDITORIAL' | 'CONFIG' | 'AI'
  const [view, setView] = useState('DASHBOARD');
  const [date, setDate] = useState(new Date());
  
  // Data State
  const [programs, setPrograms] = useState<RCMProgram[]>(() => {
    const saved = localStorage.getItem('rcm_programs');
    return saved ? JSON.parse(saved) : INITIAL_PROGRAMS;
  });
  
  const [content, setContent] = useState<{[key: string]: DailyContent}>(() => {
    const saved = localStorage.getItem('rcm_content');
    return saved ? JSON.parse(saved) : {};
  });

  // Navigation State for Editorial
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date | null>(null);
  const [editingDay, setEditingDay] = useState<Date | null>(null);

  // AI State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('rcm_programs', JSON.stringify(programs));
  }, [programs]);

  useEffect(() => {
    localStorage.setItem('rcm_content', JSON.stringify(content));
  }, [content]);

  // --- HELPERS ---
  const getWeekDays = (start: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getKey = (d: Date) => d.toISOString().split('T')[0];

  const getDayContent = (d: Date): DailyContent => {
    const key = getKey(d);
    return content[key] || { centralTheme: '', programContent: {} };
  };

  const updateDayContent = (d: Date, field: string, value: any, programId?: string) => {
    const key = getKey(d);
    const current = content[key] || { centralTheme: '', programContent: {} };
    
    if (programId) {
      const pContent = current.programContent[programId] || { theme: '', ideas: '' };
      const newPContent = { ...pContent, [field]: value };
      setContent({
        ...content,
        [key]: { 
          ...current, 
          programContent: { ...current.programContent, [programId]: newPContent } 
        }
      });
    } else {
      setContent({
        ...content,
        [key]: { ...current, [field]: value }
      });
    }
  };

  const exportToDocx = () => {
    // Simulated Export
    const text = `AGENDA EDITORIAL - RCM\n\n${Object.entries(content).map(([k, v]) => {
      const val = v as DailyContent;
      return `FECHA: ${k}\nTEMÁTICA CENTRAL: ${val.centralTheme}\nPROGRAMAS:\n${Object.entries(val.programContent).map(([pid, pc]) => 
        `- ${programs.find(p => p.id === pid)?.name || pid}: ${pc.theme}`
      ).join('\n')}`;
    }).join('\n\n')}`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Agenda_RCM_${getKey(new Date())}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- AI FUNCTIONALITY ---
  const handleAskAI = async () => {
    if (!aiPrompt) return;
    setIsLoadingAi(true);
    setAiResponse('');
    
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        setAiResponse("Error: API Key no configurada en el entorno.");
        setIsLoadingAi(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Eres un asistente editorial para Radio Ciudad Monumento. Sugiere ideas creativas, efemérides relevantes y enfoques para el siguiente tema o programa: "${aiPrompt}". Sé conciso.`
      });
      setAiResponse(response.text || '');
    } catch (e) {
      console.error(e);
      setAiResponse("Error conectando con la IA. Verifique su conexión.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  // --- RENDERERS ---

  const renderDashboard = () => (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="bg-[#3E1E16] rounded-2xl p-6 shadow-xl border border-[#9E7649]/20 text-center">
        <h2 className="text-2xl font-serif font-bold text-white mb-2">Agenda Editorial</h2>
        <p className="text-[#9E7649] text-sm uppercase tracking-widest mb-6">Planificación de Contenidos RCM</p>
        
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setView('EDITORIAL')} className="flex flex-col items-center justify-center bg-[#2C1B15] p-4 rounded-xl border border-white/5 hover:border-[#9E7649] hover:bg-[#4E2A20] transition-all group">
            <div className="w-12 h-12 rounded-full bg-[#9E7649]/20 flex items-center justify-center text-[#9E7649] mb-3 group-hover:scale-110 transition-transform">
              <Calendar size={24} />
            </div>
            <span className="text-white font-bold text-sm">Gestionar Agenda</span>
          </button>

          <button onClick={() => setView('CONFIG')} className="flex flex-col items-center justify-center bg-[#2C1B15] p-4 rounded-xl border border-white/5 hover:border-[#9E7649] hover:bg-[#4E2A20] transition-all group">
            <div className="w-12 h-12 rounded-full bg-[#9E7649]/20 flex items-center justify-center text-[#9E7649] mb-3 group-hover:scale-110 transition-transform">
              <Settings size={24} />
            </div>
            <span className="text-white font-bold text-sm">Parrilla & Config</span>
          </button>
        </div>
      </div>

      <div className="bg-[#2C1B15] rounded-xl p-4 border border-[#9E7649]/10">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white font-bold flex items-center gap-2"><Sparkles size={16} className="text-yellow-500"/> Asistente IA</h3>
          <button onClick={() => setShowAiModal(true)} className="text-xs bg-[#9E7649] text-white px-2 py-1 rounded">Abrir Chat</button>
        </div>
        <p className="text-xs text-[#E8DCCF]/60">Solicita ideas para guiones, efemérides del día o estructuras de programas.</p>
      </div>

      <div className="bg-[#2C1B15] rounded-xl p-4 border border-[#9E7649]/10">
        <h3 className="text-white font-bold mb-2 flex items-center gap-2"><Database size={16} className="text-blue-400"/> Datos Locales</h3>
        <p className="text-xs text-[#E8DCCF]/60 mb-3">Los datos se guardan automáticamente en este dispositivo.</p>
        <button onClick={exportToDocx} className="w-full flex items-center justify-center gap-2 bg-[#1A100C] text-[#E8DCCF] py-2 rounded-lg text-xs font-bold border border-white/10 hover:bg-[#3E1E16]">
          <Download size={14} /> Exportar Agenda (TXT/DOC)
        </button>
      </div>
    </div>
  );

  const renderEditorial = () => {
    // Level 1: Select Week
    if (!selectedWeekStart) {
      const today = new Date();
      const currentMonth = date.getMonth();
      const currentYear = date.getFullYear();
      const firstDay = new Date(currentYear, currentMonth, 1);
      // Adjust to Monday
      const dayOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; 
      const startCalendar = new Date(firstDay);
      startCalendar.setDate(firstDay.getDate() - dayOffset);

      const weeks = [];
      let current = new Date(startCalendar);
      // Generate 5 weeks
      for(let i=0; i<5; i++) {
        weeks.push(new Date(current));
        current.setDate(current.getDate() + 7);
      }

      return (
        <div className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
             <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1))}><ChevronLeft className="text-[#9E7649]"/></button>
             <h2 className="text-xl font-bold text-white uppercase">{date.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h2>
             <button onClick={() => setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1))}><ChevronRight className="text-[#9E7649]"/></button>
          </div>
          
          <div className="space-y-3">
             <p className="text-xs text-[#E8DCCF]/50 uppercase tracking-widest mb-2">Seleccione una semana</p>
             {weeks.map((weekStart, idx) => {
               const weekEnd = new Date(weekStart);
               weekEnd.setDate(weekEnd.getDate() + 6);
               return (
                 <button 
                  key={idx}
                  onClick={() => setSelectedWeekStart(weekStart)}
                  className="w-full bg-[#2C1B15] p-4 rounded-xl border-l-4 border-[#9E7649] flex justify-between items-center hover:bg-[#3E1E16] transition-colors"
                 >
                    <div className="text-left">
                       <span className="block text-white font-bold text-lg">Semana {idx + 1}</span>
                       <span className="text-xs text-[#E8DCCF]/60">
                         {weekStart.getDate()} {weekStart.toLocaleString('es-ES', {month:'short'})} - {weekEnd.getDate()} {weekEnd.toLocaleString('es-ES', {month:'short'})}
                       </span>
                    </div>
                    <ChevronRight className="text-[#E8DCCF]/30" />
                 </button>
               )
             })}
          </div>
        </div>
      );
    }

    // Level 2: Select Day in Week
    if (!editingDay) {
      const days = getWeekDays(selectedWeekStart);
      return (
        <div className="p-4 h-full flex flex-col">
          <button onClick={() => setSelectedWeekStart(null)} className="flex items-center gap-2 text-[#9E7649] text-xs font-bold uppercase mb-4">
            <ArrowLeft size={14} /> Volver a Semanas
          </button>
          <h2 className="text-xl font-bold text-white mb-6">Planificación Semanal</h2>
          <div className="grid grid-cols-1 gap-3">
            {days.map((d, idx) => {
               const hasContent = content[getKey(d)]?.centralTheme;
               return (
                 <button 
                    key={idx} 
                    onClick={() => setEditingDay(d)}
                    className="flex items-center gap-4 bg-[#2C1B15] p-3 rounded-xl border border-white/5 hover:border-[#9E7649]/50"
                 >
                    <div className="bg-[#1A100C] w-12 h-12 rounded-lg flex flex-col items-center justify-center border border-[#9E7649]/20 text-[#9E7649]">
                       <span className="text-[10px] uppercase font-bold">{d.toLocaleString('es-ES', {weekday: 'short'})}</span>
                       <span className="text-lg font-bold leading-none">{d.getDate()}</span>
                    </div>
                    <div className="flex-1 text-left">
                       <p className="text-white text-sm font-medium truncate">{hasContent || 'Sin temática central'}</p>
                       <p className="text-[10px] text-[#E8DCCF]/40">{programs.filter(p => p.days.includes(d.getDay())).length} programas</p>
                    </div>
                    {hasContent && <div className="w-2 h-2 rounded-full bg-green-500"></div>}
                 </button>
               )
            })}
          </div>
        </div>
      );
    }

    // Level 3: Edit Day
    const dayData = getDayContent(editingDay);
    const dayPrograms = programs.filter(p => p.days.includes(editingDay.getDay())).sort((a,b) => a.time.localeCompare(b.time));

    return (
      <div className="flex flex-col h-full bg-[#1A100C]">
        <div className="bg-[#2C1B15] p-4 border-b border-[#9E7649]/20 sticky top-0 z-10">
           <button onClick={() => setEditingDay(null)} className="flex items-center gap-2 text-[#9E7649] text-xs font-bold uppercase mb-2">
             <ArrowLeft size={14} /> Volver a Días
           </button>
           <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar size={18} /> {editingDay.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long'})}
           </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
          
          {/* Central Theme */}
          <div className="bg-[#2C1B15] p-4 rounded-xl border border-[#9E7649]/10">
             <label className="text-xs text-[#9E7649] font-bold uppercase mb-2 block">Temática Central del Día</label>
             <textarea 
               value={dayData.centralTheme}
               onChange={(e) => updateDayContent(editingDay, 'centralTheme', e.target.value)}
               className="w-full bg-[#1A100C] text-white p-3 rounded-lg border border-white/10 focus:border-[#9E7649] outline-none text-sm min-h-[80px]"
               placeholder="Escriba el tema principal para la programación de hoy..."
             />
          </div>

          {/* Programs List */}
          <div className="space-y-4">
             <h3 className="text-sm font-bold text-white uppercase tracking-wider pl-1">Programas</h3>
             {dayPrograms.map(prog => {
               const pContent = dayData.programContent[prog.id] || { theme: '', ideas: '' };
               return (
                 <div key={prog.id} className="bg-[#2C1B15] rounded-xl overflow-hidden border border-white/5">
                    <div className="bg-[#3E1E16] px-4 py-2 flex justify-between items-center">
                       <span className="text-white font-bold text-sm">{prog.name}</span>
                       <span className="text-xs text-[#9E7649] font-mono bg-black/20 px-2 rounded">{prog.time}</span>
                    </div>
                    <div className="p-4 space-y-3">
                       <div>
                          <label className="text-[10px] text-[#E8DCCF]/60 uppercase mb-1 block">Tema Específico</label>
                          <input 
                            type="text" 
                            value={pContent.theme}
                            onChange={(e) => updateDayContent(editingDay, 'theme', e.target.value, prog.id)}
                            className="w-full bg-[#1A100C] text-white px-3 py-2 rounded border border-white/10 text-sm focus:border-[#9E7649] outline-none"
                            placeholder="Tema del programa..."
                          />
                       </div>
                       <div>
                          <label className="text-[10px] text-[#E8DCCF]/60 uppercase mb-1 block flex justify-between">
                             <span>Ideas / Guion</span>
                             <button onClick={() => { setAiPrompt(`Ideas para el programa ${prog.name} sobre ${pContent.theme || dayData.centralTheme}`); setShowAiModal(true); }} className="text-[#9E7649] flex items-center gap-1 hover:text-white transition-colors"><Sparkles size={10}/> IA</button>
                          </label>
                          <textarea 
                            value={pContent.ideas}
                            onChange={(e) => updateDayContent(editingDay, 'ideas', e.target.value, prog.id)}
                            className="w-full bg-[#1A100C] text-white px-3 py-2 rounded border border-white/10 text-sm focus:border-[#9E7649] outline-none min-h-[60px]"
                            placeholder="Notas, invitados, estructura..."
                          />
                       </div>
                    </div>
                 </div>
               )
             })}
          </div>
        </div>
      </div>
    );
  };

  const renderConfig = () => (
    <div className="flex flex-col h-full bg-[#1A100C] p-4 overflow-y-auto">
       <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Settings size={20}/> Configuración Parrilla</h2>
       
       <div className="space-y-4">
         {programs.map((prog, idx) => (
           <div key={prog.id} className="bg-[#2C1B15] p-4 rounded-xl border border-white/5 flex items-center justify-between">
              <div>
                 <input 
                   value={prog.name}
                   onChange={(e) => {
                     const newProgs = [...programs];
                     newProgs[idx].name = e.target.value;
                     setPrograms(newProgs);
                   }}
                   className="bg-transparent text-white font-bold text-sm border-b border-transparent focus:border-[#9E7649] outline-none mb-1 w-full"
                 />
                 <div className="flex items-center gap-2">
                    <input 
                      type="time"
                      value={prog.time}
                      onChange={(e) => {
                        const newProgs = [...programs];
                        newProgs[idx].time = e.target.value;
                        setPrograms(newProgs);
                      }}
                      className="bg-[#1A100C] text-[#9E7649] text-xs px-2 py-1 rounded border border-white/10"
                    />
                    <div className="flex gap-0.5">
                       {[0,1,2,3,4,5,6].map(d => (
                         <button 
                           key={d}
                           onClick={() => {
                             const newProgs = [...programs];
                             if (newProgs[idx].days.includes(d)) {
                               newProgs[idx].days = newProgs[idx].days.filter(x => x !== d);
                             } else {
                               newProgs[idx].days.push(d);
                             }
                             setPrograms(newProgs);
                           }}
                           className={`w-5 h-5 text-[9px] rounded flex items-center justify-center ${prog.days.includes(d) ? 'bg-[#9E7649] text-white' : 'bg-[#1A100C] text-stone-600'}`}
                         >
                           {['D','L','M','M','J','V','S'][d]}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
              <button onClick={() => setPrograms(programs.filter(p => p.id !== prog.id))} className="text-red-900 hover:text-red-500 p-2"><Trash2 size={16}/></button>
           </div>
         ))}
       </div>

       <button 
         onClick={() => setPrograms([...programs, { id: Date.now().toString(), name: 'Nuevo Programa', time: '12:00', days: [1,2,3,4,5], active: true }])}
         className="mt-6 flex items-center justify-center gap-2 bg-[#3E1E16] text-[#9E7649] border border-[#9E7649] border-dashed p-3 rounded-xl hover:bg-[#4E2A20]"
       >
         <Plus size={18} /> Agregar Programa
       </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#1A100C] text-[#E8DCCF] font-display relative overflow-hidden">
      {/* HEADER */}
      {view !== 'DASHBOARD' && (
        <div className="bg-[#2C1B15] p-4 flex items-center justify-between border-b border-[#9E7649]/20 shrink-0">
          <button onClick={() => view === 'EDITORIAL' && (editingDay || selectedWeekStart) ? (editingDay ? setEditingDay(null) : setSelectedWeekStart(null)) : setView('DASHBOARD')} className="p-2 bg-[#1A100C] rounded-full hover:bg-[#3E1E16] transition-colors">
            <ArrowLeft size={20} className="text-[#9E7649]" />
          </button>
          <h1 className="text-sm font-bold text-white uppercase tracking-wider">
            {view === 'EDITORIAL' ? 'Gestión Editorial' : 'Configuración'}
          </h1>
          <div className="w-9"></div>
        </div>
      )}
      {view === 'DASHBOARD' && (
        <div className="bg-[#2C1B15] p-4 flex items-center gap-4 border-b border-[#9E7649]/20">
            <button onClick={onBack} className="p-2 bg-[#1A100C] rounded-full hover:bg-[#3E1E16] transition-colors">
                <ArrowLeft size={20} className="text-[#9E7649]" />
            </button>
            <h1 className="text-lg font-bold text-white">RCM Agenda</h1>
        </div>
      )}

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto bg-[#1A100C] pb-safe">
        {view === 'DASHBOARD' && renderDashboard()}
        {view === 'EDITORIAL' && renderEditorial()}
        {view === 'CONFIG' && renderConfig()}
      </div>

      {/* AI MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
           <div className="bg-[#2C1B15] w-full max-w-md rounded-2xl border border-[#9E7649]/20 shadow-2xl flex flex-col max-h-[80vh]">
              <div className="flex justify-between items-center p-4 border-b border-white/5 bg-[#3E1E16] rounded-t-2xl">
                 <h3 className="text-white font-bold flex items-center gap-2"><Sparkles size={16} className="text-yellow-400"/> Asistente RCM</h3>
                 <button onClick={() => setShowAiModal(false)}><span className="text-2xl text-[#E8DCCF]">&times;</span></button>
              </div>
              
              <div className="p-4 overflow-y-auto flex-1 bg-[#1A100C]">
                 {aiResponse ? (
                   <div className="prose prose-invert prose-sm max-w-none text-[#E8DCCF]">
                     <p className="whitespace-pre-wrap">{aiResponse}</p>
                   </div>
                 ) : (
                   <div className="flex flex-col items-center justify-center h-40 opacity-50">
                     <Sparkles size={40} className="mb-2 text-[#9E7649]"/>
                     <p className="text-xs">¿En qué puedo ayudarte hoy?</p>
                   </div>
                 )}
              </div>

              <div className="p-4 bg-[#2C1B15] border-t border-white/5 rounded-b-2xl">
                 <div className="flex gap-2">
                    <input 
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                      placeholder="Escribe tu consulta..."
                      className="flex-1 bg-[#1A100C] text-white px-4 py-3 rounded-xl border border-white/10 focus:border-[#9E7649] outline-none text-sm"
                    />
                    <button 
                      onClick={handleAskAI}
                      disabled={isLoadingAi}
                      className="bg-[#9E7649] text-white p-3 rounded-xl hover:bg-[#8B653D] disabled:opacity-50 transition-colors"
                    >
                      {isLoadingAi ? <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div> : <Sparkles size={20} />}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AgendaApp;