import { useState, useCallback, useEffect } from 'react';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState('speechSynthesis' in window);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
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
    
    // Find English voice or use default
    const englishVoice = voices.find(voice => 
      voice.lang.includes('vi') || 
      voice.lang.includes('VI') ||
      voice.name.toLowerCase().includes('english')
    );

    if (englishVoice) {
      utterance.voice = englishVoice;
      utterance.lang = 'vi-VN';
    } else {
      // Fallback to English language setting
      utterance.lang = 'vi-VN';
    }

    // Optimize settings for English speech
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
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
  }, [isSupported, voices]);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices: voices.filter(voice => 
      voice.lang.includes('en') || 
      voice.lang.includes('EN') ||
      voice.name.toLowerCase().includes('english')
    )
  };
}