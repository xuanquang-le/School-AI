// --- START OF FILE src/components/ChatInterface.tsx ---
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Send, Mic, MicOff, Volume2, VolumeX, Pause } from 'lucide-react';

// Typing indicator component
const TypingIndicator = ({ t }: { t: (key: string) => string }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex justify-start"
    >
      <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-2">
        <span className="text-sm text-gray-500">{t('chat.ai.thinking')}</span>
        <div className="flex space-x-1">
          <motion.div
            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-1.5 h-1.5 bg-gray-400 rounded-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => void;
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onToggleSpeech: () => void;
  speechEnabled: boolean;
  transcript?: string;
  onSpeakMessage?: (text: string) => void;
}

export default function ChatInterface({
  onSendMessage,
  messages,
  isListening,
  isSpeaking,
  isProcessing,
  onStartListening,
  onStopListening,
  onToggleSpeech,
  speechEnabled,
  transcript = "",
  onSpeakMessage
}: ChatInterfaceProps) {
  const { t } = useLanguage();
  const [inputText, setInputText] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const handleSpeakMessage = (messageId: string, text: string) => {
    if (speakingMessageId === messageId) {
      setSpeakingMessageId(null);
      if (onSpeakMessage) onSpeakMessage('');
    } else {
      setSpeakingMessageId(messageId);
      if (onSpeakMessage) onSpeakMessage(text);
    }
  };

  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingMessageId(null);
    }
  }, [isSpeaking]);

  return (
    // Sửa h-[80vh] thành h-full để khớp với App.tsx
    <div className="flex flex-col h-full bg-white lg:bg-white/90 lg:backdrop-blur-sm lg:rounded-2xl lg:shadow-xl lg:border border-gray-200">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4 lg:p-6 border-b border-gray-200">
        <div>
          <h2 className="text-lg lg:text-xl font-semibold text-gray-900">{t('chat.title')}</h2>
          <div className="flex items-center gap-2">
            {/* Trạng thái hoạt động */}
            <div className={`w-2 h-2 rounded-full ${
                isProcessing ? 'bg-yellow-500 animate-pulse' :
                isSpeaking ? 'bg-green-500 animate-pulse' :
                isListening ? 'bg-red-500 animate-pulse' :
                'bg-gray-300'
            }`} />
            <p className="text-xs lg:text-sm text-gray-500">
              {isProcessing ? t('chat.processing') : isSpeaking ? t('chat.speaking') : isListening ? t('chat.listening') : t('chat.ready')}
            </p>
          </div>
        </div>
        
        <button
          onClick={onToggleSpeech}
          className={`p-3 rounded-full transition-all duration-200 ${speechEnabled
            ? 'bg-green-100 text-green-600 hover:bg-green-200'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          title={speechEnabled ? t('chat.audio.on') : t('chat.audio.off')}
        >
          {speechEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-hidden bg-gray-50 lg:bg-transparent relative">
        <div
          className="h-full overflow-y-auto p-4 space-y-4"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db #f3f4f6' }}
        >
          <div className="h-2" /> {/* Spacer */}
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] lg:max-w-md px-4 py-3 rounded-2xl shadow-sm relative ${message.isUser
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white text-gray-900 border border-gray-100 rounded-tl-sm'
                    }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.text}</p>
                  
                  {/* Timestamp & Play button */}
                  <div className={`flex items-center justify-end mt-1 gap-2 ${message.isUser ? 'text-blue-100' : 'text-gray-400'}`}>
                    <p className="text-[10px]">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    {!message.isUser && onSpeakMessage && (
                      <button
                        onClick={() => handleSpeakMessage(message.id, message.text)}
                        className={`p-1 rounded-full transition-colors ${speakingMessageId === message.id
                            ? 'bg-red-100 text-red-600'
                            : 'hover:bg-gray-100 text-gray-500'
                          }`}
                      >
                        {speakingMessageId === message.id ? <Pause size={12} /> : <Volume2 size={12} />}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isProcessing && <TypingIndicator t={t} />}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 lg:p-6 bg-white border-t border-gray-100">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          {/* Nút Mic */}
          <button
            type="button"
            onClick={handleVoiceToggle}
            disabled={isProcessing}
            className={`p-3 rounded-full transition-all shrink-0 ${isProcessing
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isListening
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse shadow-lg shadow-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          {/* Ô nhập liệu */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              placeholder={
                isListening
                  ? `${t('chat.placeholder.listening')}${transcript || ''}`
                  : isProcessing
                    ? t('chat.placeholder.processing')
                    : t('chat.placeholder.default')
              }
              onChange={(e) => setInputText(e.target.value)}
              // text-base để tránh lỗi zoom trên iPhone
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-full focus:ring-2 focus:ring-blue-500 text-base placeholder-gray-400 disabled:bg-gray-50 disabled:text-gray-400 transition-all"
              disabled={isListening || isProcessing}
            />
          </div>

          {/* Nút Gửi */}
          <button
            type="submit"
            disabled={!inputText.trim() || isListening || isProcessing}
            className={`p-3 rounded-full transition-all shrink-0 ${
               !inputText.trim() || isListening || isProcessing
               ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
               : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:scale-105 active:scale-95'
            }`}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={22} />
            )}
          </button>
        </form>
        
        {/* Helper text cho Mic */}
        <div className="h-5 mt-1 text-center">
           {isListening && (
             <span className="text-xs text-red-500 font-medium animate-pulse">
               {t('chat.status.listening')}
             </span>
           )}
        </div>
      </div>
    </div>
  );
}