import { useLanguage } from '../contexts/LanguageContext';

export interface Character {
  id: string;
  name: string;
  role: string;
  gender: 'male' | 'female';
  modelPath: string;
  greeting: string;
  description: string;
  color: string;
  avatar: string; // For preview image
}

// Function to get localized characters
export function getLocalizedCharacters(t: (key: string) => string): Character[] {
  return [
    {
      id: 'teacher-a-female',
      name: t('character.teacher-a-female.name'),
      role: t('character.teacher-a-female.role'),
      gender: 'female' as const,
      modelPath: '/models/teacher-female.glb',
      greeting: t('character.teacher-a-female.greeting'),
      description: t('character.teacher-a-female.description'),
      color: '#4F46E5',
      avatar: '👩‍🏫'
    },
    {
      id: 'teacher-b-male',
      name: t('character.teacher-b-male.name'),
      role: t('character.teacher-b-male.role'),
      gender: 'male' as const,
      modelPath: '/models/teacher-male.glb',
      greeting: t('character.teacher-b-male.greeting'),
      description: t('character.teacher-b-male.description'),
      color: '#059669',
      avatar: '👨‍🏫'
    },
    {
      id: 'doctor-female',
      name: t('character.doctor-female.name'),
      role: t('character.doctor-female.role'),
      gender: 'female' as const,
      modelPath: '/models/doctor-female.glb',
      greeting: t('character.doctor-female.greeting'),
      description: t('character.doctor-female.description'),
      color: '#DC2626',
      avatar: '👩‍⚕️'
    },
    {
      id: 'counselor-male',
      name: t('character.counselor-male.name'),
      role: t('character.counselor-male.role'),
      gender: 'male' as const,
      modelPath: '/models/counselor-male.glb',
      greeting: t('character.counselor-male.greeting'),
      description: t('character.counselor-male.description'),
      color: '#7C3AED',
      avatar: '🧑‍💼'
    }
  ];
}

// Static characters for backward compatibility
export const AVAILABLE_CHARACTERS: Character[] = [
  {
    id: 'teacher-a-female',
    name: 'Teacher Anna',
    role: 'English Teacher',
    gender: 'female',
    modelPath: '/models/teacher-female.glb',
    greeting: "Hello! I'm Teacher Anna. I'm here to help you with your English learning journey. What would you like to study today?",
    description: 'Friendly and patient English teacher with 10+ years experience',
    color: '#4F46E5',
    avatar: '👩‍🏫'
  },
  {
    id: 'teacher-b-male',
    name: 'Teacher Ben',
    role: 'Math Teacher',
    gender: 'male',
    modelPath: '/models/teacher-male.glb',
    greeting: "Hi there! I'm Teacher Ben. Mathematics can be fun and exciting. What math topic can I help you with?",
    description: 'Enthusiastic math teacher who makes complex concepts simple',
    color: '#059669',
    avatar: '👨‍🏫'
  },
  {
    id: 'doctor-female',
    name: 'Dr. Sarah',
    role: 'Health Counselor',
    gender: 'female',
    modelPath: '/models/doctor-female.glb',
    greeting: "Hello! I'm Dr. Sarah. I'm here to provide health guidance and support. How can I help you today?",
    description: 'Caring health professional focused on wellness and prevention',
    color: '#DC2626',
    avatar: '👩‍⚕️'
  },
  {
    id: 'counselor-male',
    name: 'Counselor Mike',
    role: 'Mental Health Counselor',
    gender: 'male',
    modelPath: '/models/counselor-male.glb',
    greeting: "Welcome! I'm Counselor Mike. This is a safe space where you can share your thoughts and feelings. How are you doing today?",
    description: 'Professional counselor specializing in emotional support',
    color: '#7C3AED',
    avatar: '🧑‍💼'
  }
];