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
  maxAlternatives: number;
  onstart: () => void;
  onend: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
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
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // const timeoutRef = useRef<NodeJS.Timeout | null>(null);
const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startListening = useCallback(() => {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      onError?.("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      setIsSupported(false);
      return;
    }

    setIsSupported(true);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const SpeechRecognition = (window.SpeechRecognition ||
      window.webkitSpeechRecognition) as SpeechRecognitionConstructor;

    const recognition = new SpeechRecognition();

    // Optimized configuration for better speech recognition
    recognition.continuous = false; // Stop after getting result
    recognition.interimResults = true; // Show interim results
    recognition.lang = "en-US"; // English language
    recognition.maxAlternatives = 1; // Only get best result

    recognition.onstart = () => {
      console.log("Speech recognition started...");
      setIsListening(true);
      setTranscript("");
      setInterimTranscript("");
      
      // Auto stop after 10 seconds if no speech
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 10000);
    };

    recognition.onend = () => {
      console.log("Speech recognition ended");
      setIsListening(false);
      setInterimTranscript("");
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      // Process all results
      for (let i = event.results.length - 1; i >= 0; i--) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript = result[0].transcript;
        } else {
          interimTranscript = result[0].transcript;
        }
      }

      // Update interim transcript
      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      setInterimTranscript(interimTranscript);

      // If we have final result, send it
      if (finalTranscript.trim()) {
        console.log("Recognition result:", finalTranscript);
        onResult(finalTranscript.trim());
        setIsListening(false);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // Handle aborted case as normal behavior, not an error
      if (event.error === 'aborted') {
        console.log("Speech recognition aborted (normal behavior)");
        setIsListening(false);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        return; // Don't call onError for aborted events
      }
      
      console.error("Speech recognition error:", event.error);
      
      let errorMessage = "An error occurred during speech recognition";
      
      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected. Please try again.";
          break;
        case "audio-capture":
          errorMessage = "Cannot access microphone. Please check permissions.";
          break;
        case "not-allowed":
          errorMessage = "Microphone access denied. Please allow microphone access.";
          break;
        case "network":
          errorMessage = "Network error. Please check your internet connection.";
          break;
        case "service-not-allowed":
          errorMessage = "Speech recognition service not available.";
          break;
      }
      
      onError?.(errorMessage);
      setIsListening(false);
      setInterimTranscript("");
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (error) {
      console.error("Cannot start speech recognition:", error);
      onError?.("Cannot start speech recognition. Please try again.");
      setIsListening(false);
      setInterimTranscript("");
    }
  }, [onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setIsListening(false);
    setTranscript("");
    setInterimTranscript("");
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    isListening,
    isSupported,
    transcript, // Interim transcript for display
    interimTranscript,
    startListening,
    stopListening,
    cleanup,
  };
}

// Add these to global Window interface
declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}