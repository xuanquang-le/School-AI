// --- START OF FILE src/hooks/useSpeechSynthesis.ts ---
import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';

// Hàm phát hiện ngôn ngữ
function detectLanguage(text: string): 'vi' | 'en' {
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  const vietnameseWords = /\b(tôi|bạn|là|của|và|có|không|được|xin|chào|cảm|ơn|học|tập|sức|khỏe)\b/gi;
  if (vietnamesePattern.test(text) || vietnameseWords.test(text)) return 'vi';
  return 'en';
}

// Giọng đọc Gemini TTS theo từng nhân vật (30 giọng có sẵn, xem/nghe thử tại
// https://aistudio.google.com/generate-speech - đổi tên giọng ở đây nếu muốn khác).
const CHARACTER_VOICES: Record<string, string> = {
  'teacher-a-female': 'Leda',          // Cô Anna - trẻ trung
  'teacher-b-male': 'Puck',            // Thầy Ben - sôi nổi
  'doctor-female': 'Vindemiatrix',     // Bác sĩ Sarah - nhẹ nhàng
  'counselor-male': 'Achird',          // Tư vấn viên Mike - thân thiện, ấm áp
};
const DEFAULT_VOICE = 'Achird';
const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

// Ghép header WAV (44 byte) vào trước dữ liệu PCM thô mà Gemini TTS trả về
// (24kHz, 16-bit, mono) để trình duyệt phát được trực tiếp qua <audio>.
function pcmBase64ToWavBlob(base64Pcm: string, sampleRate = 24000): Blob {
  const binary = atob(base64Pcm);
  const len = binary.length;
  const pcmBytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) pcmBytes[i] = binary.charCodeAt(i);

  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const buffer = new ArrayBuffer(44 + pcmBytes.length);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + pcmBytes.length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, pcmBytes.length, true);
  new Uint8Array(buffer, 44).set(pcmBytes);

  return new Blob([buffer], { type: 'audio/wav' });
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
  // URL âm thanh trước đó (để giải phóng bộ nhớ khi tạo URL mới)
  const lastObjectUrl = useRef<string | null>(null);

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

  // Logic Web Speech API (Tiếng Anh, và fallback khi Gemini TTS lỗi)
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

  // Logic Gemini TTS (Tiếng Việt) - 1 request duy nhất, không cần polling như FPT
  const speakGemini = useCallback(async (text: string, sessionId: number, characterId?: string) => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('Thiếu VITE_GEMINI_API_KEY');

      const voiceName = (characterId && CHARACTER_VOICES[characterId]) || DEFAULT_VOICE;
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: TTS_MODEL,
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
        },
      });

      // Nếu người dùng đã chuyển sang câu khác trong lúc chờ -> bỏ qua
      if (currentSessionId.current !== sessionId) return;

      const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!data) throw new Error('Gemini TTS không trả về audio');

      const blob = pcmBase64ToWavBlob(data);
      const url = URL.createObjectURL(blob);

      if (lastObjectUrl.current) URL.revokeObjectURL(lastObjectUrl.current);
      lastObjectUrl.current = url;

      if (currentSessionId.current === sessionId && audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play().catch(() => triggerOnStart());
      }
    } catch (e) {
      console.error('Gemini TTS lỗi, chuyển sang giọng trình duyệt:', e);
      if (currentSessionId.current === sessionId) speakWeb(text); // Fallback
    }
  }, [speakWeb, triggerOnStart]);

  // HÀM CHÍNH
  const speak = useCallback((text: string, onStartCallback?: () => void, characterId?: string) => {
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
        speakGemini(text, sessionId, characterId);
    } else {
        speakWeb(text);
    }
  }, [stop, speakGemini, speakWeb]);

  return { speak, stop, isSpeaking };
};
