// --- START OF FILE src/hooks/useSpeechSynthesis.ts ---
import { useState, useCallback, useEffect, useRef } from 'react';

// Hàm phát hiện ngôn ngữ
function detectLanguage(text: string): 'vi' | 'en' {
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  const vietnameseWords = /\b(tôi|bạn|là|của|và|có|không|được|xin|chào|cảm|ơn|học|tập|sức|khỏe)\b/gi;
  if (vietnamesePattern.test(text) || vietnameseWords.test(text)) return 'vi';
  return 'en';
}

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  
  // Audio Player chính
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // Callback để báo cho App biết "Đã bắt đầu nói, hiện chữ đi!"
  const onStartCallbackRef = useRef<(() => void) | null>(null);
  // ID để kiểm soát phiên nói hiện tại (chống lặp)
  const currentSessionId = useRef<number>(0);

  // Helper: Gọi callback đúng 1 lần
  const triggerOnStart = useCallback(() => {
    if (onStartCallbackRef.current) {
      onStartCallbackRef.current();
      onStartCallbackRef.current = null; // Hủy ngay để không gọi lại
    }
  }, []);

  // Init Voices & Audio
  useEffect(() => {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // SỰ KIỆN QUAN TRỌNG: Khi loa bắt đầu phát -> Gọi hàm hiện chữ
      audioRef.current.onplay = () => {
        setIsSpeaking(true);
        triggerOnStart();
      };
      
      audioRef.current.onended = () => setIsSpeaking(false);
      audioRef.current.onerror = (e) => {
        console.error("Audio Error:", e);
        setIsSpeaking(false);
        triggerOnStart(); // Lỗi cũng phải hiện chữ
      };
    }
  }, [triggerOnStart]);

  // Reset mọi thứ
  const stop = useCallback(() => {
    currentSessionId.current = 0; // Hủy phiên hiện tại
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsSpeaking(false);
  }, []);

  // Logic Web Speech API (Tiếng Anh)
  const speakWeb = useCallback((text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const lang = detectLanguage(text);
    
    // Chọn giọng
    if (lang === 'en') {
        const enVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
        if (enVoice) utterance.voice = enVoice;
        utterance.lang = 'en-US';
    } else {
        utterance.lang = 'vi-VN';
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      triggerOnStart(); // Bắt đầu nói -> Hiện chữ
    };
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
        setIsSpeaking(false);
        triggerOnStart();
    };

    window.speechSynthesis.speak(utterance);
  }, [voices, triggerOnStart]);

  // Logic FPT AI (Tiếng Việt) - Có chờ file
  const speakFPT = useCallback(async (text: string, sessionId: number) => {
    try {
        const apiKey = import.meta.env.FPT_AI_API_KEY || 'xren6jFm7Sz0bjONia6rEf5CemyWOU3j';
        const res = await fetch('https://api.fpt.ai/hmi/tts/v5', {
            method: 'POST',
            headers: { 'api-key': apiKey, 'voice': 'banmai', 'Content-Type': 'text/plain' },
            body: text
        });
        const data = await res.json();
        
        if (!data.async) throw new Error("No URL");
        const url = data.async;

        // Vòng lặp kiểm tra file (Polling)
        const checkAudio = (attempt: number) => {
            // Nếu người dùng đã bấm câu khác -> Dừng ngay
            if (currentSessionId.current !== sessionId) return;
            if (attempt > 60) { triggerOnStart(); return; } // Timeout

            const probe = new Audio();
            probe.onloadedmetadata = () => {
                // File ngon -> Phát
                if (currentSessionId.current === sessionId && audioRef.current) {
                    audioRef.current.src = url;
                    audioRef.current.play().catch(() => triggerOnStart());
                }
            };
            probe.onerror = () => {
                // File chưa xong -> Đợi 1s thử lại
                setTimeout(() => checkAudio(attempt + 1), 1000);
            };
            probe.src = url;
        };
        checkAudio(1);

    } catch (e) {
        console.error(e);
        speakWeb(text); // Fallback
    }
  }, [speakWeb, triggerOnStart]);

  // HÀM CHÍNH
  const speak = useCallback((text: string, onStartCallback?: () => void) => {
    stop(); // Dừng câu cũ
    
    if (!text.trim()) {
        if (onStartCallback) onStartCallback();
        return;
    }

    // Tạo phiên mới
    const sessionId = Date.now();
    currentSessionId.current = sessionId;
    onStartCallbackRef.current = onStartCallback || null;

    // Giữ trạng thái đang xử lý (để UI hiện loading nếu cần)
    setIsSpeaking(true);

    const lang = detectLanguage(text);
    if (lang === 'vi') {
        speakFPT(text, sessionId);
    } else {
        speakWeb(text);
    }
  }, [stop, speakFPT, speakWeb]);

  return { speak, stop, isSpeaking };
};