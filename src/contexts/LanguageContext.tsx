import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'vi' | 'en';

// Define the translation keys type
type TranslationKeys = {
  [key: string]: string;
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations object
const translations: Record<Language, TranslationKeys> = {
  vi: {
    // Character Selection
    'character.selection.title': 'Chọn Trợ Lý AI Của Bạn',
    'character.selection.subtitle': 'Chọn một trợ lý ảo để giúp bạn học tập, phát triển và khám phá các chủ đề mới trong môi trường 3D tương tác',
    'character.selection.select': 'Chọn',
    'character.selection.loading': 'Đang tải...',
    'character.selection.clickToSelect': 'Nhấn để chọn!',
    'character.selection.footer': 'Mỗi nhân vật có đặc điểm tính cách và lĩnh vực kiến thức chuyên môn riêng',
    'character.selection.experience': 'Kinh nghiệm',
    'character.selection.friendliness': 'Thân thiện',
    'character.selection.male': 'Nam',
    'character.selection.female': 'Nữ',

    // Characters
    'character.teacher-a-female.name': 'Cô Anna',
    'character.teacher-a-female.role': 'Giáo viên Tiếng Anh',
    'character.teacher-a-female.description': 'Giáo viên tiếng Anh thân thiện và kiên nhẫn với hơn 10 năm kinh nghiệm',
    'character.teacher-a-female.greeting': 'Xin chào! Tôi là cô Anna. Tôi ở đây để giúp bạn trong hành trình học tiếng Anh. Hôm nay bạn muốn học gì?',

    'character.teacher-b-male.name': 'Thầy Ben',
    'character.teacher-b-male.role': 'Giáo viên Toán',
    'character.teacher-b-male.description': 'Giáo viên toán nhiệt tình, biến những khái niệm phức tạp thành đơn giản',
    'character.teacher-b-male.greeting': 'Chào bạn! Tôi là thầy Ben. Toán học có thể thú vị và hấp dẫn. Tôi có thể giúp bạn chủ đề toán nào?',

    'character.doctor-female.name': 'Bác sĩ Sarah',
    'character.doctor-female.role': 'Tư vấn Sức khỏe',
    'character.doctor-female.description': 'Chuyên gia y tế quan tâm, tập trung vào sức khỏe và phòng ngừa',
    'character.doctor-female.greeting': 'Xin chào! Tôi là bác sĩ Sarah. Tôi ở đây để cung cấp hướng dẫn và hỗ trợ về sức khỏe. Hôm nay tôi có thể giúp gì cho bạn?',

    'character.counselor-male.name': 'Tư vấn viên Mike',
    'character.counselor-male.role': 'Tư vấn Tâm lý',
    'character.counselor-male.description': 'Tư vấn viên chuyên nghiệp chuyên về hỗ trợ cảm xúc',
    'character.counselor-male.greeting': 'Chào mừng! Tôi là tư vấn viên Mike. Đây là không gian an toàn nơi bạn có thể chia sẻ suy nghĩ và cảm xúc. Hôm nay bạn cảm thấy thế nào?',

    // Main App
    'app.title': 'Phòng Tư Vấn Ảo',
    'app.chatting': 'Đang trò chuyện với',
    'app.safe': 'An toàn & Bảo mật',
    'app.available': 'Có sẵn 24/7',
    'app.status.processing': 'Đang xử lý',
    'app.status.speaking': 'Đang nói',
    'app.status.listening': 'Đang nghe',
    'app.status.ready': 'Sẵn sàng',

    // Chat Interface
    'chat.title': '💬 Trò chuyện với AI',
    'chat.processing': 'Đang xử lý...',
    'chat.speaking': 'Đang nói...',
    'chat.listening': 'Đang nghe...',
    'chat.ready': 'Sẵn sàng hỗ trợ',
    'chat.placeholder.listening': '🎤 Đang nghe... ',
    'chat.placeholder.processing': '⏳ Đang chờ AI trả lời...',
    'chat.placeholder.default': '💬 Nhập tin nhắn hoặc dùng voice...',
    'chat.status.listening': '🎤 Đang nghe giọng nói của bạn...',
    'chat.status.processing': '🤖 AI đang suy nghĩ...',
    'chat.status.speaking': '🔊 AI đang nói...',
    'chat.ai.thinking': 'AI đang suy nghĩ',
    'chat.speak.stop': 'Dừng phát âm',
    'chat.speak.play': 'Nghe tin nhắn này',
    'chat.audio.on': 'Tắt âm thanh',
    'chat.audio.off': 'Bật âm thanh',

    // Virtual Room
    'room.listening': 'Đang nghe...',
    'room.speaking': 'Đang nói...',
    'room.ready': 'sẵn sàng hỗ trợ',

    // Language Selector
    'language.vietnamese': 'Tiếng Việt',
    'language.english': 'English',
    'language.select': 'Chọn ngôn ngữ',

    // Voice Mode Selection
    'voiceMode.title': 'Bạn muốn trò chuyện như thế nào?',
    'voiceMode.subtitle': 'Chọn chế độ phù hợp với bạn. Bạn vẫn có thể bật/tắt âm thanh bất cứ lúc nào trong lúc chat.',
    'voiceMode.audio.title': 'Có giọng nói',
    'voiceMode.audio.description': 'Nhân vật đọc to câu trả lời, trải nghiệm sống động hơn. Phản hồi sẽ chậm hơn một chút.',
    'voiceMode.audio.badge': 'Chậm hơn',
    'voiceMode.text.title': 'Chỉ nhắn tin',
    'voiceMode.text.description': 'Chỉ hiện chữ, không phát âm thanh. Trả lời nhanh hơn và tiết kiệm hơn.',
    'voiceMode.text.badge': 'Nhanh hơn',
    'voiceMode.continue': 'Bắt đầu trò chuyện',
    'voiceMode.back': 'Quay lại chọn nhân vật'
  },
  en: {
    // Character Selection
    'character.selection.title': 'Choose Your AI Companion',
    'character.selection.subtitle': 'Select a virtual assistant to help you learn, grow, and explore new topics in an interactive 3D environment',
    'character.selection.select': 'Select',
    'character.selection.loading': 'Loading...',
    'character.selection.clickToSelect': 'Click to select!',
    'character.selection.footer': 'Each character has unique personality traits and specialized knowledge areas',
    'character.selection.experience': 'Experience',
    'character.selection.friendliness': 'Friendliness',
    'character.selection.male': 'Male',
    'character.selection.female': 'Female',

    // Characters
    'character.teacher-a-female.name': 'Teacher Anna',
    'character.teacher-a-female.role': 'English Teacher',
    'character.teacher-a-female.description': 'Friendly and patient English teacher with 10+ years experience',
    'character.teacher-a-female.greeting': "Hello! I'm Teacher Anna. I'm here to help you with your English learning journey. What would you like to study today?",

    'character.teacher-b-male.name': 'Teacher Ben',
    'character.teacher-b-male.role': 'Math Teacher',
    'character.teacher-b-male.description': 'Enthusiastic math teacher who makes complex concepts simple',
    'character.teacher-b-male.greeting': "Hi there! I'm Teacher Ben. Mathematics can be fun and exciting. What math topic can I help you with?",

    'character.doctor-female.name': 'Dr. Sarah',
    'character.doctor-female.role': 'Health Counselor',
    'character.doctor-female.description': 'Caring health professional focused on wellness and prevention',
    'character.doctor-female.greeting': "Hello! I'm Dr. Sarah. I'm here to provide health guidance and support. How can I help you today?",

    'character.counselor-male.name': 'Counselor Mike',
    'character.counselor-male.role': 'Mental Health Counselor',
    'character.counselor-male.description': 'Professional counselor specializing in emotional support',
    'character.counselor-male.greeting': "Welcome! I'm Counselor Mike. This is a safe space where you can share your thoughts and feelings. How are you doing today?",

    // Main App
    'app.title': 'Virtual Consultation Room',
    'app.chatting': 'Chatting with',
    'app.safe': 'Safe & Confidential',
    'app.available': '24/7 Available',
    'app.status.processing': 'Processing',
    'app.status.speaking': 'Speaking',
    'app.status.listening': 'Listening',
    'app.status.ready': 'Ready',

    // Chat Interface
    'chat.title': '💬 Chat with AI',
    'chat.processing': 'Processing...',
    'chat.speaking': 'Speaking...',
    'chat.listening': 'Listening...',
    'chat.ready': 'Ready to help',
    'chat.placeholder.listening': '🎤 Listening... ',
    'chat.placeholder.processing': '⏳ Waiting for AI response...',
    'chat.placeholder.default': '💬 Type message or use voice...',
    'chat.status.listening': '🎤 Listening to your voice...',
    'chat.status.processing': '🤖 AI is thinking...',
    'chat.status.speaking': '🔊 AI is speaking...',
    'chat.ai.thinking': 'AI is thinking',
    'chat.speak.stop': 'Stop speaking',
    'chat.speak.play': 'Listen to this message',
    'chat.audio.on': 'Turn off audio',
    'chat.audio.off': 'Turn on audio',

    // Virtual Room
    'room.listening': 'Listening...',
    'room.speaking': 'Speaking...',
    'room.ready': 'is ready to help',

    // Language Selector
    'language.vietnamese': 'Tiếng Việt',
    'language.english': 'English',
    'language.select': 'Select language',

    // Voice Mode Selection
    'voiceMode.title': 'How would you like to chat?',
    'voiceMode.subtitle': "Pick the mode that suits you. You can still turn audio on/off anytime during the chat.",
    'voiceMode.audio.title': 'With voice',
    'voiceMode.audio.description': 'The character reads replies aloud for a more immersive experience. Responses are a bit slower.',
    'voiceMode.audio.badge': 'Slower',
    'voiceMode.text.title': 'Text only',
    'voiceMode.text.description': 'Text only, no audio. Faster and more efficient.',
    'voiceMode.text.badge': 'Faster',
    'voiceMode.continue': 'Start chatting',
    'voiceMode.back': 'Back to character selection'
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('vi');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('app-language') as Language;
    if (savedLanguage && (savedLanguage === 'vi' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when changed
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}