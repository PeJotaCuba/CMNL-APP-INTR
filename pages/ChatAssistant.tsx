import React, { useState, useRef, useEffect } from 'react';
import { askDeepSeek } from '../services/deepSeekService';
import BottomNav from '../components/BottomNav';
import { UserRole } from '../types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatAssistantProps {
  onSync: () => Promise<boolean>;
}

const ChatAssistant: React.FC<ChatAssistantProps> = ({ onSync }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy tu asistente de RCM. ¿En qué puedo ayudarte hoy con la redacción o programación?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const response = await askDeepSeek(userMsg);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Lo siento, hubo un error al conectar con DeepSeek." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col pb-24 bg-background-dark">
      <header className="sticky top-0 z-50 bg-card-dark/95 backdrop-blur-md p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">smart_toy</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">Asistente Editorial</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">Powered by DeepSeek</p>
          </div>
        </div>
      </header>

      <main 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-stone-dark/30"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm text-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-card-dark text-white rounded-bl-none border border-white/5'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card-dark text-white px-4 py-3 rounded-2xl rounded-bl-none border border-white/5 flex gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-75">.</span>
              <span className="animate-bounce delay-150">.</span>
            </div>
          </div>
        )}
      </main>

      <div className="p-4 bg-card-dark border-t border-white/5 fixed bottom-[84px] left-0 right-0 max-w-md mx-auto">
        <div className="flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu consulta..."
            className="flex-1 bg-background-dark border-none focus:ring-1 focus:ring-primary rounded-xl text-sm px-4 py-3 text-white"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading}
            className="size-11 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 transition-all"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>

      <BottomNav user={{ role: UserRole.ESCRITOR, name: 'Usuario' }} onSync={onSync} />
    </div>
  );
};

export default ChatAssistant;