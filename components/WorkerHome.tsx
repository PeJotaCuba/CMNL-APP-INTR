import React, { useState, useEffect } from 'react';
import { AppView, NewsItem, User } from '../types';
import { CalendarDays, Music, FileText, Podcast, LogOut, User as UserIcon, MessageSquare } from 'lucide-react';
import { LOGO_URL } from '../utils/scheduleData';

interface Props {
  onNavigate: (view: AppView, data?: any) => void;
  news: NewsItem[];
  currentUser: User | null;
  onLogout: () => void;
}

const WorkerHome: React.FC<Props> = ({ onNavigate, news, currentUser, onLogout }) => {
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    if (news.length > 1) {
      const interval = setInterval(() => {
        setCurrentNewsIndex((prev) => (prev + 1) % Math.min(news.length, 5));
      }, 5000); 
      return () => clearInterval(interval);
    }
  }, [news]);

  const activeNews = news.slice(0, 5)[currentNewsIndex];
  
  const handleExternalApp = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className="relative flex h-full w-full flex-col bg-[#2a1b12] text-white overflow-y-auto no-scrollbar pb-32">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none bg-[url('https://picsum.photos/id/149/1080/1920')] bg-cover bg-center"></div>
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#2a1b12]/90 via-[#2a1b12]/80 to-[#2a1b12] pointer-events-none"></div>

      <nav className="relative z-20 w-full px-6 py-6 flex justify-center items-center border-b border-white/5 bg-[#2a1b12]/50 backdrop-blur-sm sticky top-0">
        <div className="flex space-x-8 text-sm font-medium text-[#FFF8DC]/80">
           <button onClick={() => onNavigate(AppView.SECTION_HISTORY)} className="hover:text-white">Historia</button>
           <button onClick={() => onNavigate(AppView.SECTION_PROGRAMMING_PUBLIC)} className="hover:text-white">Programación</button>
           <button onClick={() => onNavigate(AppView.SECTION_ABOUT)} className="hover:text-white">Quiénes Somos</button>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col flex-1 px-6 py-8 items-center max-w-2xl mx-auto w-full">
        <div className="flex flex-col items-center mb-12">
           <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl overflow-hidden mb-4">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-cover" />
           </div>
           <h1 className="text-3xl font-bold text-[#FFF8DC]">CMNL App</h1>
           <h2 className="text-[#CD853F] text-lg uppercase tracking-widest opacity-90">Gestión Interna</h2>
        </div>

        <div className="w-full grid grid-cols-2 gap-4 mb-10">
           <MenuButton icon={<CalendarDays size={28} />} label="Agenda" subLabel="CMNL" onClick={() => onNavigate(AppView.APP_AGENDA)} />
           <MenuButton icon={<Music size={28} />} label="Música" subLabel="CMNL" onClick={() => handleExternalApp('https://rcm-musica.vercel.app/')} />
           <MenuButton icon={<FileText size={28} />} label="Guiones" subLabel="CMNL" onClick={() => handleExternalApp('https://guion-bd.vercel.app/')} />
           <MenuButton icon={<Podcast size={28} />} label="Programación" subLabel="CMNL" onClick={() => handleExternalApp('https://rcm-programaci-n.vercel.app/')} />
        </div>

        {activeNews && (
            <div onClick={() => onNavigate(AppView.SECTION_NEWS_DETAIL, activeNews)} className="w-full mb-8 cursor-pointer bg-[#3e2723]/60 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                <h3 className="text-[#CD853F] text-xs font-bold uppercase tracking-widest mb-2">Noticias</h3>
                <div className="flex gap-4 items-center">
                    <div className="h-16 w-16 bg-cover bg-center rounded-lg shrink-0" style={{backgroundImage: `url(${activeNews.image})`}}></div>
                    <div>
                        <h4 className="text-sm font-bold leading-tight">{activeNews.title}</h4>
                        <p className="text-xs text-stone-400 mt-1 line-clamp-1">{activeNews.content}</p>
                    </div>
                </div>
            </div>
        )}

        <div className="mt-auto w-full bg-[#3e2723]/60 rounded-xl p-4 border border-white/5 flex items-center justify-between backdrop-blur-sm">
           <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-stone-700/50 flex items-center justify-center border border-white/10"><UserIcon size={18} className="text-stone-300" /></div>
              <div><p className="text-sm text-[#FFF8DC] font-medium">{currentUser?.name}</p><p className="text-xs text-[#CD853F]">{currentUser?.classification || 'Trabajador'}</p></div>
           </div>
           <button onClick={onLogout} className="text-stone-400 hover:text-white transition-colors p-2"><LogOut size={20} /></button>
        </div>
      </div>
      
      <a href="https://chat.whatsapp.com/BBalNMYSJT9CHQybLUVg5v" target="_blank" rel="noopener noreferrer" className="fixed bottom-24 right-5 z-40 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center border-2 border-white/10">
         <MessageSquare size={28} fill="white" />
      </a>
    </div>
  );
};

const MenuButton = ({ icon, label, subLabel, onClick }: { icon: React.ReactNode, label: string, subLabel: string, onClick: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center aspect-square bg-[#3e2723]/40 hover:bg-[#3e2723] border border-white/5 rounded-2xl p-4 transition-all shadow-lg active:scale-95">
     <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#8B4513] to-[#A0522D] flex items-center justify-center mb-3 shadow-inner text-white">{icon}</div>
     <span className="text-[#FFF8DC] font-medium text-sm text-center leading-tight">
        <span className="block text-xs opacity-60 mb-0.5">{subLabel}</span>{label}
     </span>
  </button>
);

export default WorkerHome;
