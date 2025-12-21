// --- START OF FILE src/App.tsx ---
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
  
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false); // Trạng thái "Đang suy nghĩ..."
  const [hasGreeted, setHasGreeted] = useState(false);
  
  const isMounted = useRef(true);
  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; stop(); };
  }, [stop]);

  const handleSpeakMessage = useCallback((text: string) => {
    if (!text) stop(); else speak(text);
  }, [speak, stop]);

  // --- LOGIC GỬI TIN NHẮN (ĐÃ ĐIỀU CHỈNH) ---
  const handleSendMessage = useCallback(async (text: string) => {
    // 1. Hiện câu hỏi của User ngay lập tức
    const userMessage: Message = { id: Date.now().toString(), text, isUser: true, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    
    // 2. Bật trạng thái Loading (AI đang nghĩ)
    setIsProcessing(true);

    try {
      // 3. Lấy text từ AI (nhưng CHƯA hiện ra vội)
      const response = await geminiApiService.getCounselingResponse(text, messages);
      
      if (!isMounted.current) return;

      // Hàm này sẽ được gọi KHI âm thanh bắt đầu phát
      const showAiMessageNow = () => {
        if (isMounted.current) {
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            text: response,
            isUser: false,
            timestamp: new Date()
          }]);
          // Tắt loading -> Chữ hiện ra cùng lúc với tiếng
          setIsProcessing(false); 
        }
      };

      // 4. Gọi phát âm thanh
      if (speechEnabled) {
        // Truyền hàm showAiMessageNow vào làm callback
        speak(response, showAiMessageNow);
      } else {
        // Nếu tắt tiếng -> Hiện luôn
        showAiMessageNow();
      }

    } catch (error) {
      console.error('Error:', error);
      setIsProcessing(false);
    }
  }, [messages, speechEnabled, speak]);

  const { isListening, startListening, stopListening, transcript } = useSpeechRecognition({
    onResult: handleSendMessage,
    onError: (e) => console.error('Voice Error:', e)
  });

  // Lời chào (Cũng áp dụng logic đồng bộ)
  useEffect(() => {
    if (selectedCharacter && !hasGreeted) {
      const greeting = selectedCharacter.greeting;
      const showGreeting = () => {
        setMessages([{ id: '1', text: greeting, isUser: false, timestamp: new Date() }]);
        setHasGreeted(true);
      };

      setTimeout(() => {
        if (speechEnabled) speak(greeting, showGreeting);
        else showGreeting();
      }, 500);
    }
  }, [selectedCharacter, hasGreeted, speechEnabled, speak]);

  const handleBack = () => { stop(); setSelectedCharacter(null); setMessages([]); setHasGreeted(false); };
  const handleToggleSpeech = () => { if(speechEnabled) stop(); setSpeechEnabled(!speechEnabled); };

  if (!selectedCharacter) {
    return (
      <div className="relative">
        <div className="fixed top-4 right-4 z-50 flex gap-3">
          <LanguageSelector />
          {!user && (
            <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-md hover:shadow-lg transition-all">
              <LogIn size={16}/> <span className="text-sm font-medium">Đăng nhập</span>
            </button>
          )}
          {user && <UserProfile />}
        </div>
        <CharacterSelection onSelectCharacter={setSelectedCharacter} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="fixed top-0 w-full bg-white/90 backdrop-blur-sm z-40 border-b px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><ArrowLeft className="text-gray-600"/></button>
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl hidden sm:block"><Heart className="h-6 w-6 text-white" /></div>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg text-gray-800 flex items-center gap-2">{selectedCharacter.name}</h1>
            <span className="text-xs text-gray-500">{selectedCharacter.role}</span>
          </div>
        </div>
        <div className="flex gap-3 items-center">
           <div className="hidden lg:flex items-center space-x-4 mr-4 border-r pr-4">
              <div className="flex items-center space-x-1 text-xs text-gray-500"><Shield className="h-3 w-3" /><span>{t('app.safe')}</span></div>
              <div className="flex items-center space-x-1 text-xs text-gray-500"><Users className="h-3 w-3" /><span>{t('app.available')}</span></div>
           </div>
           <LanguageSelector />
           {user ? <UserProfile /> : <button onClick={() => setShowAuthModal(true)} className="p-2 bg-white rounded-lg shadow hover:bg-gray-50 text-gray-600"><LogIn size={20}/></button>}
        </div>
      </header>

{/* Main Content */}
      {/* Sử dụng h-[100dvh] thay vì 100vh để fix lỗi thanh địa chỉ trên mobile */}
      <main className="pt-[60px] pb-0 lg:pt-20 lg:pb-4 px-0 lg:px-4 max-w-7xl mx-auto h-[100dvh] lg:h-screen flex flex-col lg:flex-row gap-0 lg:gap-6">
        
        {/* 1. KHUNG 3D ROOM */}
        {/* Mobile: Cao 35%, bo góc dưới. Desktop: Cao 100%, bo tròn */}
        <div className="w-full h-[35dvh] lg:h-full lg:w-2/3 bg-white/50 backdrop-blur-md rounded-b-3xl lg:rounded-2xl shadow-sm lg:shadow-lg overflow-hidden relative border-b lg:border border-white/50 shrink-0 z-0">
          <VirtualRoom 
            character={selectedCharacter} 
            isListening={isListening} 
            isSpeaking={isSpeaking || isProcessing} 
          />
        </div>
        
        {/* 2. KHUNG CHAT */}
        {/* Flex-1 để chiếm toàn bộ phần còn lại. z-10 để nổi lên trên nếu cần */}
        <div className="w-full flex-1 lg:h-full lg:w-1/3 min-h-0 bg-white lg:bg-transparent z-10">
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
            onSpeakMessage={handleSpeakMessage}
          />
        </div>
      </main>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </motion.div>
  );
}

export default App;