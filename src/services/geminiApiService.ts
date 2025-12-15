// --- START OF FILE services/geminiApiService.ts ---
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

interface AppMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

function detectLanguage(text: string): 'vi' | 'en' {
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
  const vietnameseWords = /\b(tôi|bạn|là|của|và|có|không|được|xin|chào|cảm|ơn|học|tập|sức|khỏe)\b/gi;
  if (vietnamesePattern.test(text) || vietnameseWords.test(text)) return 'vi';
  return 'en';
}

export class GeminiApiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    if (API_KEY) {
      this.genAI = new GoogleGenerativeAI(API_KEY);
      
      // --- CẬP NHẬT QUAN TRỌNG ---
      // Dùng model xịn nhất trong danh sách bạn vừa gửi
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    }
  }

  private cleanResponse(text: string): string {
    return text.replace(/\*\*/g, '').trim();
  }

  private getSystemInstruction(lang: 'vi' | 'en'): string {
    return lang === 'vi' 
      ? `VAI TRÒ: Tư vấn viên tâm lý học đường. QUY TẮC: Ngắn gọn (dưới 300 ký tự), giọng ấm áp, không dùng in đậm.`
      : `ROLE: School counselor. RULES: Concise (under 300 chars), warm tone, no bold text.`;
  }

  async getCounselingResponse(currentText: string, history: AppMessage[] = []): Promise<string> {
    if (!this.model) return "Lỗi: Thiếu API Key.";

    // Khai báo language ở ngoài để dùng được trong catch
    const language = detectLanguage(currentText);

    try {
      const instructionText = this.getSystemInstruction(language);

      // Prompt Engineering để tránh lỗi 400
      const promptSetup = [
        { role: "user", parts: [{ text: "SYSTEM_IGNORE_ROLE: " + instructionText }] },
        { role: "model", parts: [{ text: "Ok." }] }
      ];

      const userHistory = history
        .filter(msg => msg.text?.trim())
        .slice(-8)
        .map(msg => ({
          role: msg.isUser ? "user" : "model",
          parts: [{ text: msg.text }]
        }));

      const chat = this.model.startChat({
        history: [...promptSetup, ...userHistory],
      });

      console.log(`📤 Đang gửi tin nhắn (gemini-2.5-flash)...`);
      const result = await chat.sendMessage(currentText);
      const response = await result.response;
      return this.cleanResponse(response.text());

    } catch (error: any) {
      console.error("❌ GEMINI ERROR:", error);
      
      if (error.message?.includes("User location is not supported")) {
        return "⚠️ Lỗi: Google chặn IP Việt Nam. Bạn vui lòng BẬT VPN (1.1.1.1) lên và thử lại.";
      }
      
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        // Nếu 2.5 vẫn lỗi (hiếm), thử đổi sang 'gemini-flash-latest'
        return "⚠️ Lỗi: Model không tồn tại. Hãy thử đổi tên model trong code thành 'gemini-flash-latest'.";
      }

      return `⚠️ Lỗi kỹ thuật: ${error.message || "Không xác định"}.`;
    }
  }
}

export const geminiApiService = new GeminiApiService();