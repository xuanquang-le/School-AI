// --- START OF FILE services/geminiApiService.ts ---
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// DANH SÁCH CHIẾN THUẬT (Trộn lẫn các dòng model để tận dụng Quota riêng)
const MODEL_LIST = [
  "gemini-2.5-flash",       // 1. Mới nhất (Nhanh)
  "gemini-2.0-flash",       // 2. Bản ổn định
  "gemini-1.5-pro",         // 3. Dòng PRO (Quota riêng, thường còn lượt khi Flash hết)
  "gemini-1.5-flash",       // 4. Bản cũ (Backup)
  "gemini-1.5-flash-8b",    // 5. Bản siêu nhẹ (Backup cuối cùng)
];

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

// Hàm delay để tránh spam request quá nhanh
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class GeminiApiService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    if (API_KEY) {
      this.genAI = new GoogleGenerativeAI(API_KEY);
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
    if (!this.genAI) return "Lỗi: Thiếu API Key.";

    const language = detectLanguage(currentText);
    const instructionText = this.getSystemInstruction(language);

    // Prompt Engineering
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

    const finalHistory = [...promptSetup, ...userHistory];
    let lastError = null;

    // --- VÒNG LẶP THỬ MODEL ---
    for (const modelName of MODEL_LIST) {
      try {
        const model = this.genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({ history: finalHistory });

        const result = await chat.sendMessage(currentText);
        const response = await result.response;
        const text = this.cleanResponse(response.text());

        console.log(`✅ Đã trả lời bằng model: ${modelName}`);
        return text;

      } catch (error: any) {
        console.warn(`⚠️ Model ${modelName} bỏ qua do lỗi:`, error.message?.substring(0, 100));
        lastError = error;
        
        // Nếu bị chặn IP thì dừng ngay, không thử model khác làm gì
        if (error.message?.includes("User location is not supported")) {
           return "⚠️ Lỗi: Google chặn IP Việt Nam. Bạn vui lòng BẬT VPN (1.1.1.1) lên nhé.";
        }

        // Nếu lỗi 429 (Hết lượt) hoặc 404 (Không tìm thấy) -> Đợi 1s rồi thử model tiếp theo
        await delay(1000);
        continue;
      }
    }

    console.error("❌ Hết danh sách model.");
    
    // Thông báo lỗi thân thiện hơn
    if (lastError?.message?.includes("429")) {
        return language === 'vi' 
            ? "Hệ thống đang quá tải, bạn vui lòng đợi 1 phút rồi thử lại nhé."
            : "System is busy, please try again in 1 minute.";
    }

    return `⚠️ Lỗi kỹ thuật: ${lastError?.message || "Không xác định"}`;
  }
}

export const geminiApiService = new GeminiApiService();