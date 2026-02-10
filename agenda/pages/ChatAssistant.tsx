import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Sparkles, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([
    { role: 'model', text: 'Hola, soy tu asistente editorial de RCM. ¿En qué puedo ayudarte hoy con la programación?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'model', text: 'Error: API Key no configurada.' }]);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
            { role: 'user', parts: [{ text: `Eres un asistente experto para una emisora de radio cubana (Radio Ciudad Monumento). Contexto: ${JSON.stringify(messages.slice(-3))}. Usuario dice: ${userMsg}` }] }
        ]
      });

      setMessages(prev => [...prev, { role: 'model', text: response.text || 'No pude generar una respuesta.' }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Error de conexión con la IA.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#221810]">
      <header className="p-4 bg-[#2C2420] border-b border-white/5 flex items-center gap-3">
        <button onClick={() => navigate(-1)}><ArrowLeft className="text-stone-400" /></button>
        <h1 className="text-white font-bold flex items-center gap-2">
          <Sparkles size={18} className="text-[#ec6d13]" /> Asistente IA
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              m.role === 'user' 
                ? 'bg-[#ec6d13] text-white rounded-br-none' 
                : 'bg-[#2C2420] text-stone-200 rounded-bl-none border border-white/5'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div className="text-stone-500 text-xs p-2">Escribiendo...</div>}
      </div>

      <div className="p-4 bg-[#2C2420]">
        <div className="flex gap-2">
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe tu consulta..."
            className="flex-1 bg-[#221810] text-white px-4 py-3 rounded-xl border border-white/5 focus:border-[#ec6d13] outline-none"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-[#ec6d13] p-3 rounded-xl text-white disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;