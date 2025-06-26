import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import VirtualRoom from './components/VirtualRoom';
import ChatInterface from './components/ChatInterface';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import { aiService } from './services/aiService';
import { Heart, Shield, Users } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI counselor. I'm here to provide a safe, supportive space where you can share your thoughts and feelings. How are you doing today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const { speak, stop, isSpeaking } = useSpeechSynthesis();

  const handleSendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      const response = await aiService.getCounselingResponse(text);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      if (speechEnabled) {
        speak(response);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [speak, speechEnabled]);

  const { isListening, startListening, stopListening } = useSpeechRecognition({
    onResult: handleSendMessage,
    onError: (error) => {
      console.error('Speech recognition error:', error);
    }
  });

  const toggleSpeech = () => {
    if (speechEnabled && isSpeaking) {
      stop();
    }
    setSpeechEnabled(!speechEnabled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Virtual Counseling Room</h1>
                <p className="text-sm text-gray-600">AI-Powered Mental Health Support</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Safe & Confidential</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>24/7 Available</span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-200px)]">
          {/* 3D Room */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden"
          >
            <VirtualRoom 
              isListening={isListening} 
              isSpeaking={isSpeaking || isProcessing} 
            />
          </motion.div>

          {/* Chat Interface */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <ChatInterface
              onSendMessage={handleSendMessage}
              messages={messages}
              isListening={isListening}
              isSpeaking={isSpeaking || isProcessing}
              onStartListening={startListening}
              onStopListening={stopListening}
              onToggleSpeech={toggleSpeech}
              speechEnabled={speechEnabled}
            />
          </motion.div>
        </div>

        {/* Footer Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Use</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Type or speak your questions</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Get AI-powered counseling responses</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Listen to responses with text-to-speech</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default App;