import React, { useState, useRef, useEffect } from 'react';
import { getAiResponse } from '../services/geminiService';
import { SendIcon, SparklesIcon, DownloadIcon } from './Icons';
import type { Message } from '../types/index';

const AiAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
      { sender: 'ai', text: 'أهلاً بك! أنا مساعدك الذكي. اسألني عن المبيعات، المخزون، أو أي بيانات أخرى.', category: 'ترحيب' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { text: aiText, category: aiCategory } = await getAiResponse(input);
      const aiMessage: Message = { sender: 'ai', text: aiText, category: aiCategory };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error)
 {
      console.error("AI response error:", error);
      const errorMessage: Message = { sender: 'ai', text: 'حدث خطأ أثناء محاولة الحصول على رد. يرجى المحاولة مرة أخرى.', category: 'خطأ' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleExportChat = () => {
    const chatContent = messages.map(msg => {
        const sender = msg.sender === 'user' ? 'المستخدم' : 'المساعد';
        const category = msg.category ? `[${msg.category}]` : '';
        return `${sender} ${category}:\n${msg.text}\n`;
    }).join('\n---\n');

    const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[var(--card-light)] dark:bg-[var(--card-dark)] p-6 rounded-xl shadow-lg flex flex-col h-full" style={{minHeight: '600px'}}>
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--border-light)] dark:border-[var(--border-dark)]">
        <div className="flex items-center">
            <SparklesIcon />
            <h2 className="text-xl font-semibold mr-2 text-gray-800 dark:text-white">المساعد الذكي</h2>
        </div>
        <button 
          onClick={handleExportChat} 
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-500/10 rounded-full"
          aria-label="تصدير المحادثة"
        >
          <DownloadIcon />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 mb-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-end gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.sender === 'ai' && (
              <div className="w-9 h-9 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white flex-shrink-0 shadow-md">
                <SparklesIcon className="w-5 h-5" />
              </div>
            )}
            <div className={`max-w-xs md:max-w-sm rounded-2xl px-4 py-3 shadow-sm ${msg.sender === 'user' ? 'bg-[var(--primary-color)] text-white rounded-br-lg' : 'bg-gray-100 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200 rounded-bl-lg'}`}>
              {msg.sender === 'ai' && msg.category && (
                <span className="block text-xs font-bold text-[var(--primary-color)] dark:text-blue-400 mb-1">{msg.category}</span>
              )}
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className="flex justify-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white flex-shrink-0 animate-pulse">
                <SparklesIcon className="w-5 h-5" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-900/50 rounded-2xl px-4 py-3 rounded-bl-lg shadow-sm">
              <div className="flex items-center justify-center space-x-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative pt-4 border-t border-[var(--border-light)] dark:border-[var(--border-dark)]">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="اسأل شيئًا..."
          className="w-full pr-12 pl-4 py-3 text-sm text-gray-700 bg-gray-200/50 dark:bg-gray-900/50 dark:text-gray-300 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          disabled={isLoading}
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || input.trim() === ''}
          aria-label="إرسال"
          className="absolute inset-y-0 right-1 top-5 flex items-center justify-center w-10 h-10 bg-[var(--primary-color)] hover:bg-[var(--primary-color-hover)] rounded-md text-white disabled:bg-gray-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

export default AiAssistant;