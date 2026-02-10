import React from 'react';
import { UserProfile, Program } from '../types';
import { useNavigate } from 'react-router-dom';
import { Calendar, BookOpen, Star, LogOut, RefreshCw } from 'lucide-react';

interface Props {
  user: UserProfile;
  onLogout: () => void;
  programs: Program[];
  onSync: () => Promise<boolean>;
  filterEnabled: boolean;
  onToggleFilter: () => void;
}

const Dashboard: React.FC<Props> = ({ user, onLogout, programs, onSync, filterEnabled, onToggleFilter }) => {
  const navigate = useNavigate();
  const [syncing, setSyncing] = React.useState(false);

  const handleSync = async () => {
    setSyncing(true);
    await onSync();
    setSyncing(false);
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#221810] text-white">
      <header className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold font-serif text-[#ec6d13]">Hola, {user.name.split(' ')[0]}</h1>
          <p className="text-sm text-stone-400 capitalize">{dateStr}</p>
        </div>
        <button onClick={onLogout} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
          <LogOut size={18} className="text-stone-400" />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => navigate('/editorial')}
          className="bg-[#2C2420] p-4 rounded-[2rem] border border-white/5 hover:border-[#ec6d13]/50 transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-full bg-[#ec6d13]/20 flex items-center justify-center text-[#ec6d13] mb-3 group-hover:scale-110 transition-transform">
            <BookOpen size={20} />
          </div>
          <span className="font-bold text-sm block">Agenda Editorial</span>
        </button>

        <button 
          onClick={() => navigate('/efemerides')}
          className="bg-[#2C2420] p-4 rounded-[2rem] border border-white/5 hover:border-[#ec6d13]/50 transition-all group text-left"
        >
          <div className="w-10 h-10 rounded-full bg-[#ec6d13]/20 flex items-center justify-center text-[#ec6d13] mb-3 group-hover:scale-110 transition-transform">
            <Calendar size={20} />
          </div>
          <span className="font-bold text-sm block">Efemérides</span>
        </button>
      </div>

      <div className="bg-[#2C2420] rounded-[2rem] p-6 border border-white/5 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Mis Intereses</h3>
          <button 
            onClick={onToggleFilter}
            className={`w-10 h-6 rounded-full relative transition-colors ${filterEnabled ? 'bg-[#ec6d13]' : 'bg-stone-600'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${filterEnabled ? 'left-5' : 'left-1'}`}></div>
          </button>
        </div>
        <p className="text-xs text-stone-400 mb-4">
          {filterEnabled ? 'Viendo solo programas seguidos' : 'Viendo toda la programación'}
        </p>
        <button onClick={() => navigate('/interests')} className="text-[#ec6d13] text-sm font-bold flex items-center gap-2">
          <Star size={16} /> Configurar intereses
        </button>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 text-stone-500 text-xs hover:text-white transition-colors"
        >
          <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
          {syncing ? 'Sincronizando...' : 'Sincronizar Datos'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;