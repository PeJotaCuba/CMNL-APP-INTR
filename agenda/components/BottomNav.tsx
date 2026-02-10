import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Settings, Sparkles, BookOpen } from 'lucide-react';
import { UserProfile } from '../types';

interface Props {
  user: UserProfile;
  onSync: () => void;
}

const BottomNav: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-[#221810] border-t border-white/5 py-2 px-6 flex justify-between items-center z-50">
      <button 
        onClick={() => navigate('/home')} 
        className={`flex flex-col items-center gap-1 ${isActive('/home') ? 'text-[#ec6d13]' : 'text-stone-500'}`}
      >
        <Home size={20} />
        <span className="text-[10px]">Inicio</span>
      </button>

      <button 
        onClick={() => navigate('/editorial')} 
        className={`flex flex-col items-center gap-1 ${isActive('/editorial') ? 'text-[#ec6d13]' : 'text-stone-500'}`}
      >
        <BookOpen size={20} />
        <span className="text-[10px]">Agenda</span>
      </button>

      <button 
        onClick={() => navigate('/assistant')} 
        className={`flex flex-col items-center gap-1 ${isActive('/assistant') ? 'text-[#ec6d13]' : 'text-stone-500'}`}
      >
        <Sparkles size={20} />
        <span className="text-[10px]">IA</span>
      </button>

      {user.role === 'admin' && (
        <button 
          onClick={() => navigate('/admin')} 
          className={`flex flex-col items-center gap-1 ${isActive('/admin') ? 'text-[#ec6d13]' : 'text-stone-500'}`}
        >
          <Settings size={20} />
          <span className="text-[10px]">Admin</span>
        </button>
      )}
    </div>
  );
};

export default BottomNav;