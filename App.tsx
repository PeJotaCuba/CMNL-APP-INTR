import React, { useState, useEffect, useRef } from 'react';
import { AppView, User, NewsItem } from './types';
import PublicLanding from './components/PublicLanding';
import ListenerHome from './components/ListenerHome';
import WorkerHome from './components/WorkerHome';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import { PlaceholderView, CMNLAppView } from './components/GenericViews';
import { INITIAL_USERS, INITIAL_NEWS, INITIAL_HISTORY, INITIAL_ABOUT, getCurrentProgram } from './utils/scheduleData';
import { Play, Pause, SkipBack, SkipForward, RefreshCw } from 'lucide-react';
import AgendaApp from './components/AgendaApp';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.LISTENER_HOME);
  const [history, setHistory] = useState<AppView[]>([]);
  
  // Global Data State
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [historyContent, setHistoryContent] = useState<string>(INITIAL_HISTORY);
  const [aboutContent, setAboutContent] = useState<string>(INITIAL_ABOUT);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentProgram, setCurrentProgram] = useState(getCurrentProgram());

  useEffect(() => {
    const sessionUsername = localStorage.getItem('rcm_user_username');
    if (sessionUsername) {
      const user = users.find(u => u.username === sessionUsername);
      if (user) {
        setCurrentUser(user);
        if (user.role === 'admin') setCurrentView(AppView.ADMIN_DASHBOARD);
        else if (user.role === 'worker') setCurrentView(AppView.WORKER_HOME);
      }
    }
  }, [users]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProgram(getCurrentProgram());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (view: AppView, data?: any) => {
    setHistory((prev) => [...prev, currentView]);
    setCurrentView(view);
    if (view === AppView.SECTION_NEWS_DETAIL && data) {
      setSelectedNews(data);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const prevView = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setCurrentView(prevView);
    } else {
      setCurrentView(AppView.LISTENER_HOME);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('rcm_user_session');
    localStorage.removeItem('rcm_user_username');
    setCurrentUser(null);
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setHistory([]);
    setCurrentView(AppView.LISTENER_HOME);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleRefreshLive = () => {
      if (audioRef.current) {
          setIsRefreshing(true);
          const currentSrc = audioRef.current.src;
          audioRef.current.src = '';
          audioRef.current.load();
          setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.src = currentSrc;
                audioRef.current.load();
                audioRef.current.play().then(() => {
                    setIsPlaying(true);
                    setIsRefreshing(false);
                }).catch(() => setIsRefreshing(false));
              }
          }, 500);
      }
  };

  const showPlayer = currentView !== AppView.LANDING && !currentView.startsWith('APP_');

  const renderView = () => {
    switch (currentView) {
      case AppView.LANDING:
        return <PublicLanding onNavigate={setCurrentView} users={users} onLoginSuccess={(user) => {
            setCurrentUser(user);
            localStorage.setItem('rcm_user_username', user.username);
            localStorage.setItem('rcm_user_session', user.role);
            if(user.role === 'admin') handleNavigate(AppView.ADMIN_DASHBOARD);
            else handleNavigate(AppView.WORKER_HOME);
        }} />;
      case AppView.LISTENER_HOME:
        return <ListenerHome onNavigate={handleNavigate} news={news} />;
      case AppView.WORKER_HOME:
        return <WorkerHome onNavigate={handleNavigate} news={news} currentUser={currentUser} onLogout={handleLogout} />;
      case AppView.ADMIN_DASHBOARD:
        return <AdminDashboard onNavigate={handleNavigate} news={news} users={users} currentUser={currentUser} onLogout={handleLogout} />;
      case AppView.APP_USER_MANAGEMENT:
        return <UserManagement onBack={handleBack} users={users} setUsers={setUsers} historyContent={historyContent} setHistoryContent={setHistoryContent} aboutContent={aboutContent} setAboutContent={setAboutContent} news={news} setNews={setNews} />;
      case AppView.APP_AGENDA:
        return <AgendaApp onBack={handleBack} />;
      case AppView.APP_MUSICA:
        return <CMNLAppView title="Música CMNL" type="music" onBack={handleBack} />;
      case AppView.APP_GUIONES:
        return <CMNLAppView title="Guiones CMNL" type="scripts" onBack={handleBack} />;
      case AppView.APP_PROGRAMACION:
        return <CMNLAppView title="Programación Interna" type="schedule" onBack={handleBack} />;
      case AppView.SECTION_HISTORY:
        return <PlaceholderView title="Nuestra Historia" subtitle="El legado de la radio" onBack={handleBack} customContent={historyContent} />;
      case AppView.SECTION_PROGRAMMING_PUBLIC:
        return <PlaceholderView title="Parrilla de Programación" subtitle="Guía para el oyente" onBack={handleBack} />;
      case AppView.SECTION_ABOUT:
        return <PlaceholderView title="Quiénes Somos" subtitle="Nuestro equipo y misión" onBack={handleBack} customContent={aboutContent} />;
      case AppView.SECTION_NEWS_DETAIL:
        return <PlaceholderView title="Noticias" subtitle={selectedNews?.category || "Actualidad"} onBack={handleBack} newsItem={selectedNews} />;
      case AppView.SECTION_NEWS:
      case AppView.SECTION_PODCAST:
      case AppView.SECTION_PROFILE:
        return <PlaceholderView title={currentView} onBack={handleBack} />;
      default:
        return <ListenerHome onNavigate={handleNavigate} news={news} />;
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#1A100C] font-display flex flex-col overflow-hidden relative">
      <audio 
        ref={audioRef} 
        src="https://icecast.teveo.cu/KR43FF7C" 
        preload="none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      ></audio>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {renderView()}
      </div>

      {showPlayer && (
         <div className="fixed bottom-0 left-0 right-0 z-[100] bg-[#3E1E16]/95 backdrop-blur-xl border-t border-[#9E7649]/20 px-4 py-3 pb-safe-bottom">
           <div className="max-w-md mx-auto flex items-center gap-3">
               <button onClick={handleRefreshLive} className="w-10 h-10 rounded-lg bg-white/5 border border-[#9E7649]/20 flex items-center justify-center shrink-0 text-[#9E7649]">
                   <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
               </button>
               <div className="flex-1 min-w-0">
                  <p className="text-[#F5EFE6] text-sm font-bold truncate">{currentProgram.name}</p>
                  <p className="text-[#9E7649] text-[10px] truncate">95.3 FM • En vivo</p>
               </div>
               <div className="flex items-center gap-3">
                  <button className="text-[#E8DCCF]/60"><SkipBack size={20} /></button>
                  <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-[#9E7649] text-[#3E1E16] flex items-center justify-center">
                     {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                  </button>
                  <button className="text-[#E8DCCF]/60"><SkipForward size={20} /></button>
               </div>
           </div>
         </div>
      )}
    </div>
  );
};

export default App;
