import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Program, UserProfile, EfemeridesData, ConmemoracionesData, DayThemeData } from './types.ts';
import { INITIAL_USERS, INITIAL_PROGRAMS, INITIAL_EFEMERIDES, INITIAL_CONMEMORACIONES, INITIAL_DAY_THEMES } from './database.ts';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Editorial from './pages/Editorial.tsx';
import ChatAssistant from './pages/ChatAssistant.tsx';
import BottomNav from './components/BottomNav.tsx';

// Placeholder components for those not fully detailed in XML yet but required by Router
const Placeholder = ({title}: {title:string}) => <div className="p-8 text-white">{title} (En construcción)</div>;

const AgendaApp: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('rcm_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [programs, setPrograms] = useState<Program[]>(() => {
    try {
      const saved = localStorage.getItem('rcm_programs');
      return saved ? JSON.parse(saved) : INITIAL_PROGRAMS;
    } catch (e) { return INITIAL_PROGRAMS; }
  });

  const [efemerides, setEfemerides] = useState<EfemeridesData>(INITIAL_EFEMERIDES);
  const [conmemoraciones, setConmemoraciones] = useState<ConmemoracionesData>(INITIAL_CONMEMORACIONES);
  const [dayThemes, setDayThemes] = useState<DayThemeData>(INITIAL_DAY_THEMES);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [filterEnabled, setFilterEnabled] = useState(true);

  // Sync stub
  const handleSyncWithGitHub = async (): Promise<boolean> => {
     await new Promise(r => setTimeout(r, 1000));
     return true;
  };

  useEffect(() => {
    localStorage.setItem('rcm_programs', JSON.stringify(programs));
  }, [programs]);

  const handleLogin = (u: UserProfile) => {
    setUser(u);
    localStorage.setItem('rcm_session', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('rcm_session');
  };

  return (
    <Router>
      <div className="h-full w-full flex flex-col bg-[#221810] text-white overflow-hidden font-sans">
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Routes>
            {!user ? (
              <Route path="*" element={<Login onLogin={handleLogin} users={users} onSync={handleSyncWithGitHub} />} />
            ) : (
              <>
                <Route path="/home" element={
                    <Dashboard 
                        user={user} 
                        onLogout={handleLogout} 
                        programs={programs} 
                        onSync={handleSyncWithGitHub}
                        filterEnabled={filterEnabled}
                        onToggleFilter={() => setFilterEnabled(!filterEnabled)}
                    />
                } />
                <Route path="/editorial" element={<Editorial 
                  user={user} 
                  programs={programs} 
                  dayThemes={dayThemes}
                  efemerides={efemerides}
                  conmemoraciones={conmemoraciones}
                  onUpdateProgram={(p) => setPrograms(prev => prev.map(x => x.id === p.id ? p : x))} 
                  onUpdateMany={setPrograms}
                  onUpdateDayThemes={setDayThemes}
                  filterEnabled={filterEnabled}
                  onClearAll={() => {}}
                />} />
                <Route path="/assistant" element={<ChatAssistant />} />
                <Route path="/efemerides" element={<Placeholder title="Efemérides" />} />
                <Route path="/interests" element={<Placeholder title="Intereses" />} />
                <Route path="/admin" element={<Placeholder title="Admin" />} />
                <Route path="*" element={<Navigate to="/home" replace />} />
              </>
            )}
          </Routes>
        </div>
        {user && <BottomNav user={user} onSync={handleSyncWithGitHub} />}
      </div>
    </Router>
  );
};

export default AgendaApp;