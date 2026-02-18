import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Calendar, Settings, ChevronRight, ChevronLeft, 
  Sparkles, Download, Database, Plus, Trash2 
} from 'lucide-react';
import { RCMProgram, DailyContent, Efemeride } from '../types';
import { GoogleGenAI } from "@google/genai";

interface Props {
  onBack: () => void;
}

const INITIAL_PROGRAMS: RCMProgram[] = [
  { id: 'p1', name: 'Buenos Días Bayamo', time: '07:00', days: [1,2,3,4,5,6], active: true, dailyData: {} },
  { id: 'p2', name: 'La Cumbancha', time: '09:00', days: [1,2,3,4,5,6], active: true, dailyData: {} },
  { id: 'p3', name: 'RCM Noticias', time: '11:00', days: [1,2,3,4,5,6], active: true, dailyData: {} },
  { id: 'p4', name: 'Arte Bayamo', time: '11:15', days: [1,2,3,4,5], active: true, dailyData: {} },
  { id: 'p5', name: 'Noticiero Provincial', time: '12:00', days: [0,1,2,3,4,5,6], active: true, dailyData: {} },
  { id: 'p6', name: 'Hablando con Juana', time: '13:30', days: [1,2,3,4,5], active: true, dailyData: {} },
];

const AgendaApp: React.FC<Props> = ({ onBack }) => {
  const [view, setView] = useState('DASHBOARD');
  const [date, setDate] = useState(new Date());
  
  const [programs, setPrograms] = useState<RCMProgram[]>(() => {
    const saved = localStorage.getItem('rcm_programs');
    return saved ? JSON.parse(saved) : INITIAL_PROGRAMS;
  });
  
  const [content, setContent] = useState<{[key: string]: DailyContent}>(() => {
    const saved = localStorage.getItem('rcm_content');
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedWeekStart, setSelectedWeekStart] = useState<Date | null>(null);
  const [editingDay, setEditingDay] = useState<Date | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);

  useEffect(() => { localStorage.setItem('rcm_programs', JSON.stringify(programs)); }, [programs]);
  useEffect(() => { localStorage.setItem('rcm_content', JSON.stringify(content)); }, [content]);

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

  const updateDayContent = (d: Date, field: string, value: any, programId?: string) => {
    const key = getKey(d);
    const current: DailyContent = content[key] || { theme: '', ideas: '', centralTheme: '', programContent: {} };
    if (programId) {
      const pContent = current.programContent?.[programId] || { theme: '', ideas: '' };
      const newPContent = { ...pContent, [field]: value };
      setContent({ ...content, [key]: { ...current, programContent: { ...current.programContent, [programId]: newPContent } } });
    } else {
      setContent({ ...content, [key]: { ...current, [field]: value } });
    }
  };

  const handleAskAI = async () => {
    if (!aiPrompt) return;
    setIsLoadingAi(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Eres un asistente editorial para Radio Ciudad Monumento. Genera ideas para: "${aiPrompt}".`
      });
      setAiResponse(response.text || '');
    } catch (e) { setAiResponse("Error conectando con la IA."); }
    finally { setIsLoadingAi(false); }
  };

  const renderDashboard = () => (
    <div className="p-6 space-y-6 animate-in fade-in">
      <div className="bg-[#3E1E16] rounded-2xl p-6 border border-[#9E7649]/20 text-center shadow-xl">
        <h2 className="text-2xl font-serif font-bold text-white mb-2">Agenda Editorial</h2>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button onClick={() => setView('EDITORIAL')} className="bg-[#2C1B15] p-4 rounded-xl border border-white/5 flex flex-col items-center">
            <Calendar className="text-[#9E7649] mb-2" size={24} />
            <span className="text-white text-xs font-bold">Gestionar</span>
          </button>
          <button onClick={() => setView('CONFIG')} className="bg-[#2C1B15] p-4 rounded-xl border border-white/5 flex flex-col items-center">
            <Settings className="text-[#9E7649] mb-2" size={24} />
            <span className="text-white text-xs font-bold">Parrilla</span>
          </button>
        </div>
      </div>
      <button onClick={() => setShowAiModal(true)} className="w-full bg-[#9E7649] text-white py-4 rounded-xl flex items-center justify-center gap-2 font-bold uppercase text-xs">
        <Sparkles size={18} /> Asistente IA
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#1A100C] text-[#E8DCCF]">
      <header className="bg-[#2C1B15] p-4 flex items-center gap-4 border-b border-[#9E7649]/20">
          <button onClick={() => view === 'DASHBOARD' ? onBack() : (editingDay ? setEditingDay(null) : (selectedWeekStart ? setSelectedWeekStart(null) : setView('DASHBOARD')))} className="p-2 bg-[#1A100C] rounded-full">
            <ArrowLeft size={20} className="text-[#9E7649]" />
          </button>
          <h1 className="text-lg font-bold text-white">RCM Agenda {view !== 'DASHBOARD' && `- ${view}`}</h1>
      </header>
      <div className="flex-1 overflow-y-auto pb-20">
        {view === 'DASHBOARD' && renderDashboard()}
        {view === 'EDITORIAL' && (
          <div className="p-4">
             {!selectedWeekStart ? (
                <div className="space-y-3">
                   {[0,1,2,3,4].map(w => {
                     const d = new Date(); d.setDate(1 + w*7);
                     return (
                       <button key={w} onClick={() => setSelectedWeekStart(d)} className="w-full bg-[#2C1B15] p-4 rounded-xl text-left border-l-4 border-[#9E7649]">
                         Semana {w+1}
                       </button>
                     );
                   })}
                </div>
             ) : (
               !editingDay ? (
                 <div className="grid gap-3">
                    {getWeekDays(selectedWeekStart).map((d, i) => (
                      <button key={i} onClick={() => setEditingDay(d)} className="bg-[#2C1B15] p-4 rounded-xl text-left flex justify-between">
                         <span>{d.toLocaleDateString('es-ES', {weekday: 'long', day: 'numeric'})}</span>
                         <ChevronRight size={18} />
                      </button>
                    ))}
                 </div>
               ) : (
                 <div className="space-y-4">
                    <textarea 
                      className="w-full bg-[#1A100C] border border-white/10 rounded-xl p-4 text-sm"
                      placeholder="Temática Central..."
                      value={content[getKey(editingDay)]?.centralTheme || ''}
                      onChange={e => updateDayContent(editingDay, 'centralTheme', e.target.value)}
                    />
                    {programs.map(p => (
                      <div key={p.id} className="bg-[#2C1B15] p-4 rounded-xl border border-white/5">
                        <p className="font-bold text-[#9E7649] text-xs uppercase mb-2">{p.name}</p>
                        <input 
                          className="w-full bg-[#1A100C] border-none rounded-lg p-2 text-sm mb-2"
                          placeholder="Tema..."
                          value={content[getKey(editingDay)]?.programContent?.[p.id]?.theme || ''}
                          onChange={e => updateDayContent(editingDay, 'theme', e.target.value, p.id)}
                        />
                      </div>
                    ))}
                 </div>
               )
             )}
          </div>
        )}
      </div>

      {showAiModal && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
           <div className="bg-[#2C1B15] w-full max-w-md rounded-2xl p-6 border border-[#9E7649]/20 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold flex items-center gap-2"><Sparkles size={16} className="text-yellow-500"/> IA</h3>
                 <button onClick={() => setShowAiModal(false)} className="text-2xl">&times;</button>
              </div>
              <div className="max-h-[300px] overflow-y-auto mb-4 text-sm bg-[#1A100C] p-4 rounded-xl whitespace-pre-wrap">
                 {aiResponse || 'Escribe tu consulta abajo.'}
              </div>
              <div className="flex gap-2">
                 <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className="flex-1 bg-[#1A100C] border border-white/10 rounded-lg px-3 py-2 text-sm" placeholder="Idea para..." />
                 <button onClick={handleAskAI} disabled={isLoadingAi} className="bg-[#9E7649] p-2 rounded-lg text-white">
                    {isLoadingAi ? '...' : <Sparkles size={18} />}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AgendaApp;