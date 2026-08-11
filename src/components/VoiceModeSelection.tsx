// --- START OF FILE src/components/VoiceModeSelection.tsx ---
import { motion } from 'framer-motion';
import { Volume2, MessageSquareText, ArrowLeft, Zap, Clock } from 'lucide-react';
import { Character } from '../types/Character';
import { useLanguage } from '../contexts/LanguageContext';

interface VoiceModeSelectionProps {
  character: Character;
  onSelectMode: (withAudio: boolean) => void;
  onBack: () => void;
}

export default function VoiceModeSelection({ character, onSelectMode, onBack }: VoiceModeSelectionProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden flex items-center justify-center px-4 py-10">
      <div className="relative z-10 w-full max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-purple-200 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">{t('voiceMode.back')}</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl"
            style={{ backgroundColor: character.color }}
          >
            {character.avatar}
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{t('voiceMode.title')}</h1>
          <p className="text-purple-200 max-w-xl mx-auto">{t('voiceMode.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Chỉ chat */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectMode(false)}
            className="text-left bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:border-blue-400/60 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <MessageSquareText className="text-blue-400" size={24} />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-200 bg-emerald-500/10 px-2 py-1 rounded-full">
                <Zap size={12} /> {t('voiceMode.text.badge')}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{t('voiceMode.text.title')}</h3>
            <p className="text-sm text-purple-200 leading-relaxed">{t('voiceMode.text.description')}</p>
          </motion.button>

          {/* Có âm thanh */}
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelectMode(true)}
            className="text-left bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 hover:border-green-400/60 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-green-500/20 flex items-center justify-center">
                <Volume2 className="text-green-400" size={24} />
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-amber-200 bg-amber-500/10 px-2 py-1 rounded-full">
                <Clock size={12} /> {t('voiceMode.audio.badge')}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{t('voiceMode.audio.title')}</h3>
            <p className="text-sm text-purple-200 leading-relaxed">{t('voiceMode.audio.description')}</p>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
