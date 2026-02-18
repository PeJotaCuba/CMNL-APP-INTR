import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole, UserProfile } from '../types';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  users: UserProfile[];
  onSync: () => Promise<boolean>;
}

const Login: React.FC<LoginProps> = ({ onLogin, users, onSync }) => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const cleanId = identifier.trim();
    // La búsqueda debe ser insensible a mayúsculas/minúsculas para el usuario
    const found = users.find(u => 
      u.username.toLowerCase() === cleanId.toLowerCase() || 
      u.phone === cleanId
    );
    
    if (!found) {
      setError('Usuario no registrado.');
      return;
    }

    // El PIN debe coincidir exactamente (respetando mayúsculas si es alfanumérico como el del admin)
    if (found.pin !== password.trim()) {
      setError('PIN o Contraseña incorrecta.');
      return;
    }

    // Login exitoso
    onLogin(found);
    
    // Redirección basada en el rol del usuario encontrado
    if (found.role === UserRole.ADMIN) {
      navigate('/admin');
    } else {
      navigate('/home');
    }
  };

  const performSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    const success = await onSync();
    setIsSyncing(false);
    if (success) {
        alert("✅ Base de datos actualizada correctamente.");
    } else {
        alert("❌ Error al conectar. Verifica tu internet.");
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background-dark animate-in fade-in duration-500">
      <div className="w-full max-w-sm z-10 text-center space-y-8">
        
        {/* LOGO */}
        <div className="flex flex-col items-center justify-center">
          <div className="size-28 bg-[#3d2b1f] rounded-full flex items-center justify-center mb-4 border-[3px] border-[#ec6d13] shadow-2xl relative shadow-orange-900/20">
              <div className="flex items-center justify-center gap-1 relative z-10">
                <span className="material-symbols-outlined text-[#ec6d13] text-[3rem] drop-shadow-md">radio</span>
                <span className="material-symbols-outlined text-white/90 text-[2.5rem] -ml-2 drop-shadow-md">menu_book</span>
              </div>
              <div className="absolute inset-2 border border-white/10 rounded-full"></div>
          </div>
          
          <h1 className="text-4xl font-bold font-serif text-white italic tracking-tighter drop-shadow-xl">
            RCM <span className="text-[#ec6d13]">Agenda</span>
          </h1>
          <p className="text-[9px] text-[#ec6d13] font-bold uppercase tracking-[0.3em] mt-2">
            Acceso Corporativo
          </p>
        </div>

        {/* FORMULARIO ÚNICO */}
        <div className="bg-card-dark rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden">
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-[10px] text-red-400 font-bold text-center uppercase tracking-wide animate-in slide-in-from-top-2">
                    {error}
                </div>
            )}
            
            <div className="space-y-2 text-left">
              <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-3">Usuario</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">person</span>
                <input 
                  type="text" 
                  value={identifier} 
                  onChange={e => setIdentifier(e.target.value)} 
                  required 
                  placeholder="Nombre de usuario"
                  className="w-full bg-background-dark border-none rounded-2xl pl-12 pr-4 py-4 text-white text-sm focus:ring-1 focus:ring-primary shadow-inner placeholder:text-white/20 transition-all" 
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-[9px] font-bold text-text-secondary uppercase tracking-[0.2em] ml-3">PIN de Acceso</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">lock</span>
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  placeholder="PIN (4 dígitos) o Clave"
                  className="w-full bg-background-dark border-none rounded-2xl pl-12 pr-12 py-4 text-white text-sm focus:ring-1 focus:ring-primary shadow-inner placeholder:text-white/20 transition-all" 
                  autoComplete="current-password"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-primary py-5 rounded-[1.5rem] text-white font-bold text-xs uppercase tracking-[0.3em] shadow-xl shadow-primary/10 active:scale-95 transition-all mt-2 hover:bg-primary-dark border border-white/5">
              Entrar
            </button>
          </form>
        </div>

        <button 
            onClick={performSync}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 text-white/30 hover:text-white transition-colors text-[9px] font-bold uppercase tracking-widest mx-auto py-2"
          >
             <span className={`material-symbols-outlined text-sm ${isSyncing ? 'animate-spin' : ''}`}>sync</span>
             {isSyncing ? 'Actualizando base de datos...' : 'Sincronizar Datos'}
        </button>

      </div>
    </div>
  );
};

export default Login;