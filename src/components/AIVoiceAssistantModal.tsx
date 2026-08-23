import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useLang } from '../context/LanguageContext';
import { askNvidiaAI, AIChatMessage } from '../services/nvidiaAI';
import { X, Mic, Send, Bot, User, Volume2, Sparkles } from 'lucide-react';

interface AIVoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIVoiceAssistantModal: React.FC<AIVoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { vendor, orders, trains, skus, agents, salesLogs } = useApp();
  const { lang, t } = useLang();

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: 'assistant',
      content: lang === 'hi'
        ? 'नमस्ते! मैं आपका रेलक्विक एआई असिस्टेंट हूँ। आप मुझसे पूछ सकते हैं कि अगला आर्डर कौन सा पैक करना है, ट्रेन का समय या स्टॉक अपडेट।'
        : 'Hello! I am your RailQuick AI assistant. Ask me about your next order to pack, train timing, or stock updates.'
    }
  ]);

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isThinking) return;

    const newHistory: AIChatMessage[] = [...messages, { role: 'user', content: query }];
    setMessages(newHistory);
    setInputQuery('');
    setIsThinking(true);

    const reply = await askNvidiaAI(query, newHistory, {
      vendor, orders, trains, skus, agents, salesLogs, lang
    });

    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    setIsThinking(false);

    // TTS speech synthesis output
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(reply.replace(/[*#]/g, ''));
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        handleSend(transcript);
      }
    };

    recognition.start();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-sm w-full h-[85vh] sm:h-[600px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30">
              <Bot className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-black text-sm">{t('ai.title')}</h3>
              <span className="text-[10px] text-emerald-200 flex items-center gap-1 font-semibold">
                <Sparkles className="w-3 h-3 text-amber-300" /> Powered by NVIDIA Llama 3.1 70B
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 bg-slate-50 border-b border-slate-200 flex gap-1.5 overflow-x-auto">
          <button
            onClick={() => handleSend(t('ai.suggest1'))}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-full text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors"
          >
            {t('ai.suggest1')}
          </button>
          <button
            onClick={() => handleSend(t('ai.suggest2'))}
            className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 rounded-full text-[11px] font-semibold whitespace-nowrap cursor-pointer transition-colors"
          >
            {t('ai.suggest2')}
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 text-xs ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-2 leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white font-medium rounded-br-none'
                    : 'bg-white border border-slate-200 text-slate-900 shadow-xs rounded-bl-none whitespace-pre-wrap'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>NVIDIA AI is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Voice & Text Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <button
            onClick={startVoiceInput}
            className={`p-2.5 rounded-2xl transition-all cursor-pointer ${
              isListening
                ? 'bg-red-600 text-white ring-pulse-red'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
            title="Voice Mic Input"
          >
            <Mic className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? 'Listening...' : 'Type or ask AI voice assistant...'}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-emerald-600 text-slate-900"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || isThinking}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-2xl transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
