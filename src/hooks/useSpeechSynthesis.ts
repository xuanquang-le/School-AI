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
    
    // Find Vietnamese voice or fallback to default
    const vietnameseVoice = voices.find(voice => 
      voice.lang.includes('vi') || 
      voice.lang.includes('VI') ||
      voice.name.toLowerCase().includes('vietnamese') ||
      voice.name.toLowerCase().includes('vietnam')
    );

    if (vietnameseVoice) {
      utterance.voice = vietnameseVoice;
      utterance.lang = 'vi-VN';
    } else {
      // Fallback to Vietnamese language setting even without specific voice
      utterance.lang = 'vi-VN';
    }

    // Optimize settings for Vietnamese speech
    utterance.rate = 0.85; // Slightly slower for better Vietnamese pronunciation
    utterance.pitch = 1.1; // Slightly higher pitch for Vietnamese
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
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
      voice.lang.includes('vi') || 
      voice.lang.includes('VI') ||
      voice.name.toLowerCase().includes('vietnamese')
    )
  };
}