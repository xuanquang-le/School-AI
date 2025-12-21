// --- START OF FILE src/hooks/useSpeechRecognition.ts ---
import { useState, useRef, useCallback, useEffect } from "react";

interface UseSpeechRecognitionProps {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
}

// Types cho TypeScript
interface SpeechRecognitionEvent extends Event { results: SpeechRecognitionResultList; }
interface SpeechRecognitionErrorEvent extends Event { error: string; }
interface SpeechRecognition extends EventTarget {
  continuous: boolean; interimResults: boolean; lang: string; maxAlternatives: number;
  onstart: () => void; onend: () => void; onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void; stop: () => void; abort: () => void;
}
interface SpeechRecognitionConstructor { new (): SpeechRecognition; }
declare global { interface Window { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor; } }

export function useSpeechRecognition({ onResult, onError }: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      setIsSupported(true);
    } else {
      setIsSupported(false);
      onError?.("Trình duyệt không hỗ trợ nhận diện giọng nói.");
    }
  }, [onError]);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    const SpeechRecognition = (window.SpeechRecognition || window.webkitSpeechRecognition) as SpeechRecognitionConstructor;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "vi-VN"; // Tiếng Việt
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript("");
      // Timeout nếu không nói gì
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) recognitionRef.current.stop();
      }, 8000);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let final = "";
      let interim = "";
      for (let i = event.results.length - 1; i >= 0; i--) {
        if (event.results[i].isFinal) final = event.results[i][0].transcript;
        else interim = event.results[i][0].transcript;
      }
      setTranscript(final || interim);

      if (final.trim()) {
        onResult(final.trim());
        recognition.stop();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'aborted') { setIsListening(false); return; }
      if (event.error !== 'no-speech') onError?.("Lỗi nhận diện giọng nói.");
      setIsListening(false);
      setTranscript("");
    };

    recognitionRef.current = recognition;
    try { recognition.start(); } catch  { setIsListening(false); }
  }, [isSupported, onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) recognitionRef.current.stop();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsListening(false);
  }, []);

  return { isListening, isSupported, transcript, startListening, stopListening };
}