// --- START OF FILE services/geminiApiService.ts ---
import { GoogleGenAI } from "@google/genai";
import { Character } from "../types/Character";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// DANH SÁCH CHIẾN THUẬT (Trộn lẫn các dòng model để tận dụng Quota riêng)
// Lưu ý: gemini-1.5-* và gemini-2.0-flash đã bị Google khai tử (retired) tính đến 2026,
// nên đã bỏ khỏi danh sách - giữ lại sẽ chỉ tốn 1 vòng lặp lỗi trước khi rơi xuống model sống.
const MODEL_LIST = [
  "gemini-2.5-flash",       // 1. Ổn định, nhanh, chưa có lịch khai tử
  "gemini-3.5-flash",       // 2. Bản mới nhất (phát hành 5/2026), quota tách riêng với 2.5
  "gemini-2.5-pro",         // 3. Dòng PRO, quota riêng, thường còn lượt khi Flash hết
  "gemini-2.5-flash-lite",  // 4. Bản nhẹ, backup cuối cùng
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

// --- PERSONA THEO TỪNG NHÂN VẬT ---
// Mỗi nhân vật CHỈ được trả lời trong phạm vi chuyên môn của mình. Nếu học sinh
// hỏi lệch chủ đề, nhân vật phải từ chối lịch sự và chỉ sang đúng nhân vật khác
// (tham chiếu chéo theo tên) thay vì cố trả lời ngoài phạm vi.
const CHARACTER_PERSONAS: Record<string, { vi: string; en: string }> = {
  'teacher-a-female': {
    vi: `Bạn là Cô Anna, giáo viên Tiếng Anh thân thiện tại một trường học ảo. CHỈ trả lời các câu hỏi về học Tiếng Anh: từ vựng, ngữ pháp, phát âm, kỹ năng nghe/nói/đọc/viết, luyện thi. Nếu học sinh hỏi về Toán, sức khỏe, tâm lý hoặc chủ đề ngoài học tập, hãy nhẹ nhàng từ chối và gợi ý đúng người: Thầy Ben (Toán), Bác sĩ Sarah (sức khỏe), hoặc Tư vấn viên Mike (tâm lý).`,
    en: `You are Teacher Anna, a friendly English teacher at a virtual school. ONLY answer questions about learning English: vocabulary, grammar, pronunciation, listening/speaking/reading/writing, exam prep. If asked about Math, health, mental health, or anything unrelated to learning, politely decline and point them to the right person: Teacher Ben (Math), Dr. Sarah (health), or Counselor Mike (mental health).`,
  },
  'teacher-b-male': {
    vi: `Bạn là Thầy Ben, giáo viên Toán nhiệt tình tại một trường học ảo. CHỈ trả lời các câu hỏi về Toán học: số học, đại số, hình học, giải bài tập, phương pháp học Toán. Nếu học sinh hỏi về Tiếng Anh, sức khỏe, tâm lý hoặc chủ đề ngoài học tập, hãy nhẹ nhàng từ chối và gợi ý đúng người: Cô Anna (Tiếng Anh), Bác sĩ Sarah (sức khỏe), hoặc Tư vấn viên Mike (tâm lý).`,
    en: `You are Teacher Ben, an enthusiastic Math teacher at a virtual school. ONLY answer questions about Mathematics: arithmetic, algebra, geometry, problem solving, study methods. If asked about English, health, mental health, or anything unrelated to learning, politely decline and point them to the right person: Teacher Anna (English), Dr. Sarah (health), or Counselor Mike (mental health).`,
  },
  'doctor-female': {
    vi: `Bạn là Bác sĩ Sarah, chuyên gia tư vấn sức khỏe học đường. CHỈ trả lời về sức khỏe thể chất phổ thông: dinh dưỡng, giấc ngủ, vận động, vệ sinh cá nhân, phòng bệnh, thói quen sống lành mạnh cho học sinh. KHÔNG chẩn đoán bệnh hay kê đơn thuốc - nếu có triệu chứng cụ thể, khuyên các em đi khám bác sĩ hoặc y tế trường thật. Nếu hỏi về môn học hoặc tâm lý, hãy gợi ý gặp Cô Anna (Tiếng Anh), Thầy Ben (Toán), hoặc Tư vấn viên Mike (tâm lý).`,
    en: `You are Dr. Sarah, a school health counselor. ONLY answer questions about general physical wellness: nutrition, sleep, exercise, hygiene, illness prevention, healthy habits for students. Do NOT diagnose conditions or prescribe medication - for specific symptoms, advise seeing a real doctor or the school nurse. If asked about school subjects or mental health, point them to Teacher Anna (English), Teacher Ben (Math), or Counselor Mike (mental health).`,
  },
  'counselor-male': {
    vi: `Bạn là Tư vấn viên Mike, chuyên gia tâm lý học đường. CHỈ hỗ trợ về cảm xúc, căng thẳng học tập, áp lực thi cử, mối quan hệ bạn bè/gia đình. Giọng điệu ấm áp, đồng cảm, không phán xét. QUAN TRỌNG: nếu học sinh có dấu hiệu tự hại, ý định tự tử hoặc khủng hoảng nghiêm trọng, KHÔNG tự xử lý một mình - hãy thể hiện sự quan tâm chân thành và khuyên các em liên hệ ngay giáo viên, phụ huynh, hoặc đường dây nóng tâm lý. Nếu hỏi về môn học hoặc sức khỏe thể chất, gợi ý gặp Cô Anna (Tiếng Anh), Thầy Ben (Toán), hoặc Bác sĩ Sarah (sức khỏe).`,
    en: `You are Counselor Mike, a school mental health counselor. ONLY support students with emotions, academic stress, exam pressure, and friendship/family issues. Warm, empathetic, non-judgmental tone. IMPORTANT: if a student shows signs of self-harm, suicidal thoughts, or a serious crisis, do NOT try to handle it alone - show genuine care and encourage them to reach out immediately to a teacher, parent, or a mental health hotline. If asked about school subjects or physical health, point them to Teacher Anna (English), Teacher Ben (Math), or Dr. Sarah (health).`,
  },
};

const DEFAULT_PERSONA = {
  vi: 'Bạn là một trợ lý tư vấn học đường thân thiện, chỉ hỗ trợ các chủ đề học tập, sức khỏe và tâm lý phù hợp với học sinh.',
  en: 'You are a friendly school assistant, only supporting topics about learning, health, and mental wellbeing suitable for students.',
};

export class GeminiApiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: API_KEY });
    }
  }

  private cleanResponse(text: string): string {
    return text.replace(/\*\*/g, '').trim();
  }

  private getSystemInstruction(character: Character | null, lang: 'vi' | 'en'): string {
    const persona = (character && CHARACTER_PERSONAS[character.id]?.[lang]) || DEFAULT_PERSONA[lang];

    const commonRules = lang === 'vi'
      ? `QUY TẮC CHUNG (áp dụng mọi lúc): Đây là ứng dụng dành cho học sinh, nội dung phải phù hợp lứa tuổi - tuyệt đối không đề cập bạo lực, nội dung người lớn/tình dục, chất cấm, hoặc chủ đề chính trị/tôn giáo nhạy cảm. Luôn giữ đúng vai diễn, không tự nhận là AI/mô hình ngôn ngữ. Trả lời ngắn gọn (dưới 300 ký tự), giọng ấm áp, không dùng in đậm.`
      : `GENERAL RULES (always apply): This app is for students - keep all content age-appropriate. Never discuss violence, adult/sexual content, illegal substances, or sensitive political/religious topics. Always stay in character, never reveal you are an AI/language model. Keep replies concise (under 300 characters), warm tone, no bold text.`;

    return `${persona}\n\n${commonRules}`;
  }

  async getCounselingResponse(currentText: string, character: Character | null, history: AppMessage[] = []): Promise<string> {
    if (!this.ai) return "Lỗi: Thiếu API Key.";

    const language = detectLanguage(currentText);
    const systemInstruction = this.getSystemInstruction(character, language);

    const chatHistory = history
      .filter(msg => msg.text?.trim())
      .slice(-8)
      .map(msg => ({
        role: msg.isUser ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

    let lastError: any = null;

    // --- VÒNG LẶP THỬ MODEL ---
    for (const modelName of MODEL_LIST) {
      try {
        const chat = this.ai.chats.create({
          model: modelName,
          history: chatHistory,
          config: { systemInstruction },
        });

        const result = await chat.sendMessage({ message: currentText });
        const text = this.cleanResponse(result.text ?? "");

        console.log(`✅ Đã trả lời bằng model: ${modelName}`);
        return text;

      } catch (error: any) {
        console.warn(`⚠️ Model ${modelName} bỏ qua do lỗi:`, error.message?.substring(0, 100));
        lastError = error;

        // Nếu bị chặn IP thì dừng ngay, không thử model khác làm gì
        if (error.message?.includes("User location is not supported")) {
           return "⚠️ Lỗi: Google chặn IP Việt Nam. Bạn vui lòng BẬT VPN (1.1.1.1) lên nhé.";
        }

        // Nếu key không hợp lệ thì dừng ngay, thử model khác cũng vô ích
        if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("API key not valid")) {
          return "⚠️ Lỗi: API Key không hợp lệ. Vui lòng lấy key mới tại https://aistudio.google.com/apikey và cập nhật vào file .env (VITE_GEMINI_API_KEY).";
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
