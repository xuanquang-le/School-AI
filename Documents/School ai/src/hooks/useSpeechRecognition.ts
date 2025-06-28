import { useState, useRef, useCallback } from "react";

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
}

// Type definitions for Speech Recognition API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

export function useSpeechRecognition({
  onResult,
  onError,
}: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      onError?.("Speech recognition is not supported in this browser");
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    const SpeechRecognition = (window.SpeechRecognition ||
      window.webkitSpeechRecognition) as SpeechRecognitionConstructor;

    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      onError?.(event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}

// Add these to global Window interface
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}
