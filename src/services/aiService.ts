// Simulated AI service - replace with actual OpenAI API integration
export class AIService {
  private responses = [
    "I understand how you're feeling. It's completely normal to experience these emotions, and I'm here to help you work through them.",
    "That sounds challenging. Can you tell me more about what specific aspects of this situation are bothering you the most?",
    "It's great that you're taking the initiative to seek help. That shows real strength and self-awareness.",
    "Let's explore some coping strategies that might help you manage these feelings. Have you tried any relaxation techniques before?",
    "Your feelings are valid, and it's important to acknowledge them. What would you like to focus on improving first?",
    "I hear that you're going through a difficult time. Remember that seeking support is a positive step toward feeling better.",
    "It might help to break this down into smaller, more manageable parts. What feels most urgent to address right now?",
    "You've shown resilience by coming here today. What are some things that usually help you feel more balanced?",
  ];

  async getCounselingResponse(message: string): Promise<string> {
    // Simulate API delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    // Simple keyword-based responses (replace with actual AI integration)
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("anxious") || lowerMessage.includes("anxiety")) {
      return "I can hear that you're experiencing anxiety. This is very common, and there are effective ways to manage these feelings. Would you like to explore some breathing exercises or talk about what's triggering these anxious thoughts?";
    }

    if (lowerMessage.includes("sad") || lowerMessage.includes("depressed")) {
      return "I'm sorry you're feeling this way. Depression and sadness can feel overwhelming, but you don't have to face this alone. What has been your experience with these feelings, and are there any activities that used to bring you joy?";
    }

    if (lowerMessage.includes("stress") || lowerMessage.includes("stressed")) {
      return "Stress can really impact our daily lives. It's important to identify what's causing the stress and develop healthy coping mechanisms. What are the main sources of stress in your life right now?";
    }

    if (lowerMessage.includes("help") || lowerMessage.includes("support")) {
      return "I'm here to provide support and guidance. It takes courage to ask for help, and I want you to know that your wellbeing matters. What kind of support would be most helpful for you right now?";
    }

    // Default response
    return this.responses[Math.floor(Math.random() * this.responses.length)];
  }
}

export const aiService = new AIService();
