import { useState, useCallback, useEffect } from 'react';

// Hàm phát hiện ngôn ngữ của văn bản
function detectLanguage(text: string): 'vi' | 'en' {
  // Ký tự tiếng Việt có dấu
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  
  // Từ tiếng Việt phổ biến
  const vietnameseWords = /\b(tôi|bạn|là|của|và|có|không|được|này|đó|với|trong|cho|về|từ|một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|xin|chào|cảm|ơn|làm|gì|như|thế|nào|khi|nào|ở|đâu|ai|sao|tại|vì|nên|phải|cần|muốn|thích|yêu|ghét|đẹp|xấu|tốt|lớn|nhỏ|cao|thấp|nhanh|chậm|mới|cũ|trẻ|già|khỏe|ốm|vui|buồn|hạnh|phúc|lo|lắng|stress|căng|thẳng|áp|lực|học|tập|làm|việc|gia|đình|bạn|bè|yêu|thương|tình|cảm|tâm|lý|sức|khỏe|bệnh|tật|thuốc|bác|sĩ|thầy|cô|giáo|viên|học|sinh|sinh|viên|trường|lớp|môn|bài|kiểm|tra|thi|cử|điểm|số|kết|quả|thành|tích|thành|công|thất|bại|khó|khăn|vấn|đề|giải|pháp|cách|thức|phương|pháp)\b/gi;
  
  // Kiểm tra ký tự hoặc từ tiếng Việt
  if (vietnamesePattern.test(text) || vietnameseWords.test(text)) {
    return 'vi';
  }
  
  return 'en';
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState('speechSynthesis' in window);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [vietnameseVoices, setVietnameseVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [englishVoices, setEnglishVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Phân loại giọng nói theo ngôn ngữ
      const viVoices = availableVoices.filter(voice => 
        voice.lang.includes('vi') || 
        voice.lang.includes('VI') ||
        voice.name.toLowerCase().includes('vietnamese') ||
        voice.name.toLowerCase().includes('vietnam')
      );
      
      const enVoices = availableVoices.filter(voice => 
        voice.lang.includes('en') || 
        voice.lang.includes('EN') ||
        voice.name.toLowerCase().includes('english') ||
        voice.lang.startsWith('en-')
      );
      
      setVietnameseVoices(viVoices);
      setEnglishVoices(enVoices);
      
      console.log('Available Vietnamese voices:', viVoices.map(v => `${v.name} (${v.lang})`));
      console.log('Available English voices:', enVoices.map(v => `${v.name} (${v.lang})`));
    };

    // Load voices immediately if available
    loadVoices();

    // Some browsers load voices asynchronously
    speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      speechSynthesis.onvoiceschanged = null;
    };
  }, [isSupported]);

  const speak = useCallback((text: string) => {
    if (!isSupported) {
      console.warn('Speech synthesis is not supported in this browser');
      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Phát hiện ngôn ngữ của văn bản
    const detectedLanguage = detectLanguage(text);
    console.log(`Detected language: ${detectedLanguage} for text: "${text.substring(0, 50)}..."`);
    
    // Chọn giọng nói phù hợp
    let selectedVoice: SpeechSynthesisVoice | null = null;
    
    if (detectedLanguage === 'vi') {
      // Ưu tiên giọng tiếng Việt
      if (vietnameseVoices.length > 0) {
        // Tìm giọng nữ tiếng Việt trước
        selectedVoice = vietnameseVoices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('linh') ||
          voice.name.toLowerCase().includes('mai')
        ) || vietnameseVoices[0];
        
        utterance.lang = 'vi-VN';
        utterance.rate = 0.85; // Chậm hơn một chút cho tiếng Việt
        utterance.pitch = 1.1; // Cao hơn một chút
      } else {
        // Fallback: sử dụng giọng tiếng Anh với cài đặt cho tiếng Việt
        console.warn('No Vietnamese voice found, using English voice for Vietnamese text');
        selectedVoice = englishVoices.find(voice => 
          voice.name.toLowerCase().includes('female')
        ) || englishVoices[0] || null;
        
        utterance.lang = 'vi-VN';
        utterance.rate = 0.7; // Chậm hơn để phát âm tiếng Việt rõ hơn
        utterance.pitch = 1.0;
      }
    } else {
      // Sử dụng giọng tiếng Anh
      if (englishVoices.length > 0) {
        // Ưu tiên giọng nữ tiếng Anh
        selectedVoice = englishVoices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('woman') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('susan') ||
          voice.name.toLowerCase().includes('karen')
        ) || englishVoices[0];
        
        utterance.lang = 'en-US';
        utterance.rate = 0.9; // Tốc độ bình thường cho tiếng Anh
        utterance.pitch = 1.0;
      } else {
        // Fallback: sử dụng giọng mặc định
        console.warn('No English voice found, using default voice');
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
      }
    }

    // Áp dụng giọng nói đã chọn
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang}) for ${detectedLanguage} text`);
    }

    // Cài đặt chung
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log(`Started speaking in ${detectedLanguage}: "${text.substring(0, 30)}..."`);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('Finished speaking');
    };

    utterance.onerror = (event) => {
      if (event.error === 'interrupted') {
        console.info('Speech synthesis interrupted (expected behavior)');
      } else {
        console.error('Speech synthesis error:', event);
      }
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  }, [isSupported, vietnameseVoices, englishVoices]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
    vietnameseVoices,
    englishVoices,
    // Thêm thông tin hữu ích
    hasVietnameseVoice: vietnameseVoices.length > 0,
    hasEnglishVoice: englishVoices.length > 0
  };
}