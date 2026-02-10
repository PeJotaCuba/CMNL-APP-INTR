import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Lock, User } from 'lucide-react';

interface Props {
  onLogin: (user: UserProfile) => void;
  users: UserProfile[];
  onSync: () => Promise<boolean>;
}

const Login: React.FC<Props> = ({ onLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 bg-[#221810]">
      <div className="w-20 h-20 bg-[#ec6d13] rounded-3xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(236,109,19,0.3)]">
        <BookOpenIcon size={40} className="text-white" />
      </div>
      <h1 className="text-3xl font-serif font-bold text-white mb-2">RCM Agenda</h1>
      <p className="text-stone-400 mb-10 text-sm">Sistema de Gestión Editorial</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={20} />
          <input 
            type="text" 
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-[#2C2420] text-white py-4 pl-12 pr-4 rounded-xl border border-white/5 focus:border-[#ec6d13] outline-none transition-colors"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" size={20} />
          <input 
            type="password" 
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-[#2C2420] text-white py-4 pl-12 pr-4 rounded-xl border border-white/5 focus:border-[#ec6d13] outline-none transition-colors"
          />
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button 
          type="submit"
          className="w-full bg-[#ec6d13] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#d65c0a] transition-colors mt-4"
        >
          Acceder
        </button>
      </form>
      <div className="mt-8 text-center text-xs text-stone-600">
        <p>Radio Ciudad Monumento</p>
      </div>
    </div>
  );
};

const BookOpenIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

export default Login;