// --- START OF FILE App.tsx ---

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './contexts/Authcontext';
import CharacterSelection from './components/CharacterSelection';
import AuthModal from './components/AuthModal';
import UserProfile from './components/UserProfile';
import VirtualRoom from './components/VirtualRoom';
import ChatInterface from './components/ChatInterface';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { geminiApiService } from './services/geminiApiService';
import { Character } from './types/Character';
import { useLanguage } from './contexts/LanguageContext';
import LanguageSelector from './components/LanguageSelector';
import { Heart, Shield, Users, ArrowLeft, LogIn } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

function App() {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // State quản lý
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  
  // Ref để kiểm soát vòng đời component (tránh lỗi memory leak)
  const isMounted = useRef(true);
  
  // Hooks âm thanh
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  // Cleanup khi thoát ứng dụng
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; stop(); };
  }, [stop]);

  // Xử lý đọc tin nhắn (Dùng useCallback để tối ưu hiệu năng render)
  const handleSpeakMessage = useCallback((text: string) => {
    if (!text) {
      stop();
    } else {
      speak(text);
    }
  }, [speak, stop]);

  // Xử lý gửi tin nhắn & gọi AI
  const handleSendMessage = useCallback(async (text: string) => {
    // 1. Hiển thị tin nhắn user ngay lập tức
    const userMessage: Message = { id: Date.now().toString(), text, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // 2. Gọi API Gemini (Truyền text VÀ history messages)
      // Lưu ý: File geminiApiService.ts phải được cập nhật để nhận 2 tham số
      const response = await geminiApiService.getCounselingResponse(text, messages);
      
      // 3. Cập nhật câu trả lời của AI
      if (isMounted.current) {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          text: response,
          isUser: false,
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      if (isMounted.current) setIsProcessing(false);
    }
  }, [messages]);

  // Effect: Tự động đọc tin nhắn mới nhất của AI
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && !lastMsg.isUser && speechEnabled && !isProcessing) {
      const timer = setTimeout(() => speak(lastMsg.text), 500);
      return () => clearTimeout(timer);
    }
  }, [messages, speechEnabled, isProcessing, speak]);

  // Hook nhận diện giọng nói
  const { isListening, startListening, stopListening, transcript } = useSpeechRecognition({
    onResult: handleSendMessage,
    onError: (e) => console.error('Voice Error:', e)
  });

  // Effect: Gửi lời chào khi chọn nhân vật
  useEffect(() => {
    if (selectedCharacter && !hasGreeted) {
      setMessages([{ id: '1', text: selectedCharacter.greeting, isUser: false, timestamp: new Date() }]);
      setHasGreeted(true);
    }
  }, [selectedCharacter, hasGreeted]);

  const handleBack = () => { 
    stop(); 
    setSelectedCharacter(null); 
    setMessages([]); 
    setHasGreeted(false); 
  };

  const handleToggleSpeech = () => {
    if(speechEnabled) stop();
    setSpeechEnabled(!speechEnabled);
  };

  // MÀN HÌNH 1: CHỌN NHÂN VẬT
  if (!selectedCharacter) {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50 flex gap-3">
          <LanguageSelector />
          {!user && (
            <button 
              onClick={() => setShowAuthModal(true)} 
              className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <LogIn size={16}/> 
              <span className="text-sm font-medium">Đăng nhập</span>
            </button>
          )}
          {user && <UserProfile />}
        </div>
        <CharacterSelection onSelectCharacter={setSelectedCharacter} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  // MÀN HÌNH 2: PHÒNG CHAT 3D
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-40 border-b px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="text-gray-600"/>
          </button>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg text-gray-800 hidden sm:block">{selectedCharacter.name}</h1>
            <span className="text-xs text-gray-500 hidden sm:block">{selectedCharacter.role}</span>
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
           <LanguageSelector />
           {user ? (
             <UserProfile /> 
           ) : (
             <button 
               onClick={() => setShowAuthModal(true)}
               className="p-2 bg-white rounded-lg shadow hover:bg-gray-50 text-gray-600"
             >
               <LogIn size={20}/>
             </button>
           )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-4 px-4 max-w-7xl mx-auto h-screen flex gap-6">
        {/* 3D Room - Ẩn trên mobile để tối ưu trải nghiệm */}
        <div className="hidden lg:block w-2/3 bg-white/50 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden relative border border-white/50">
          <VirtualRoom 
            character={selectedCharacter} 
            isListening={isListening} 
            isSpeaking={isSpeaking || isProcessing} 
          />
        </div>
        
        {/* Chat Interface - Full màn hình trên mobile */}
        <div className="w-full lg:w-1/3 h-full">
          <ChatInterface 
            onSendMessage={handleSendMessage} 
            messages={messages} 
            isListening={isListening} 
            isSpeaking={isSpeaking || isProcessing} 
            isProcessing={isProcessing}
            onStartListening={startListening} 
            onStopListening={stopListening}
            onToggleSpeech={handleToggleSpeech}
            speechEnabled={speechEnabled} 
            transcript={transcript}
            onSpeakMessage={handleSpeakMessage} // Sử dụng hàm đã tối ưu
          />
        </div>
      </main>
      
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </motion.div>
  );
}

export default App;