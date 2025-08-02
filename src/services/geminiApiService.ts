interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface GeminiRequestBody {
  contents: Array<{
    parts: Array<{
      text: string;
    }>;
  }>;
}

// Detect language of input text
function detectLanguage(text: string): 'vi' | 'en' {
  // Vietnamese characters pattern
  const vietnamesePattern = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

  // Common Vietnamese words
  const vietnameseWords = /\b(tôi|bạn|là|của|và|có|không|được|này|đó|với|trong|cho|về|từ|một|hai|ba|bốn|năm|sáu|bảy|tám|chín|mười|xin|chào|cảm|ơn|làm|gì|như|thế|nào|khi|nào|ở|đâu|ai|sao|tại|vì|nên|phải|cần|muốn|thích|yêu|ghét|đẹp|xấu|tốt|xấu|lớn|nhỏ|cao|thấp|nhanh|chậm|mới|cũ|trẻ|già|khỏe|ốm|vui|buồn|hạnh|phúc|lo|lắng|stress|căng|thẳng|áp|lực|học|tập|làm|việc|gia|đình|bạn|bè|yêu|thương|tình|cảm|cảm|xúc|tâm|lý|sức|khỏe|bệnh|tật|thuốc|bác|sĩ|thầy|cô|giáo|viên|học|sinh|sinh|viên|trường|lớp|môn|bài|kiểm|tra|thi|cử|điểm|số|kết|quả|thành|tích|thành|công|thất|bại|khó|khăn|vấn|đề|giải|pháp|cách|thức|phương|pháp)\b/gi;

  // Check for Vietnamese characters or words
  if (vietnamesePattern.test(text) || vietnameseWords.test(text)) {
    return 'vi';
  }

  return 'en';
}

export class GeminiApiService {
  private apiKey: string;
  private apiUrl: string;
  private maxRetries: number = 3;
  private baseDelay: number = 1000; // 1 second

  constructor() {
    // In Vite, environment variables are injected at build time
    this.apiKey = import.meta.env?.VITE_GEMINI_API_KEY || "";
    this.apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    if (!this.apiKey) {
      console.warn(
        "VITE_GEMINI_API_KEY not found. Please add it to your .env file and restart the development server."
      );
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeApiRequest(requestBody: GeminiRequestBody, attempt: number = 1): Promise<GeminiResponse> {
    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        // Check if it's a retryable error (503, 429, or 5xx server errors)
        const isRetryable = response.status === 503 ||
          response.status === 429 ||
          (response.status >= 500 && response.status < 600);

        if (isRetryable && attempt < this.maxRetries) {
          // Calculate exponential backoff delay
          const delayMs = this.baseDelay * Math.pow(2, attempt - 1);
          console.warn(`Gemini API error ${response.status}, retrying in ${delayMs}ms (attempt ${attempt}/${this.maxRetries})`);

          await this.delay(delayMs);
          return this.makeApiRequest(requestBody, attempt + 1);
        }

        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      // For network errors, also retry if we haven't exceeded max attempts
      if (attempt < this.maxRetries && error instanceof TypeError) {
        const delayMs = this.baseDelay * Math.pow(2, attempt - 1);
        console.warn(`Network error, retrying in ${delayMs}ms (attempt ${attempt}/${this.maxRetries})`);

        await this.delay(delayMs);
        return this.makeApiRequest(requestBody, attempt + 1);
      }

      throw error;
    }
  }
  private cleanResponse(text: string): string {
    // Loại bỏ dấu ** và các ký tự markdown không mong muốn
    return text.replace(/\*\*/g, '').trim();
  }
  async getCounselingResponse(message: string): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error("Gemini API key not configured");
      }

      // Detect the language of the input message
      const inputLanguage = detectLanguage(message);

      let counselingPrompt: string;

      if (inputLanguage === 'vi') {
        // Vietnamese prompt
        counselingPrompt = `Bạn là một chuyên gia tư vấn tâm lý chuyên nghiệp và thân thiện. Hãy trả lời tin nhắn sau của người dùng BẰNG MỘT CÂU NGẮN GỌN TRONG VÒNG 300 KÝ TỰ. Câu trả lời nên:
        - Thể hiện sự đồng cảm
        - Ngắn gọn, súc tích
        - Động viên người dùng
        - Sử dụng ngôn ngữ đơn giản
        - Trả lời bằng tiếng Việt

        Tin nhắn của học sinh: "${message}"`;
      } else {
        // English prompt
        counselingPrompt = `You are a professional and friendly mental health counselor. Respond to the following user message with A SINGLE, CONCISE SENTENCE UNDER 300 CHARACTERS. Your response should:
        - Show empathy
        - Be brief and to the point
        - Encourage the user
        - Use simple language
        - Respond in English

        Student's message: "${message}"`;
      }

      const requestBody: GeminiRequestBody = {
        contents: [
          {
            parts: [
              {
                text: counselingPrompt,
              },
            ],
          },
        ],
      };

      const data = await this.makeApiRequest(requestBody);

      if (data.candidates && data.candidates.length > 0) {
        const responseText = data.candidates[0].content.parts[0]?.text;
        if (responseText) {
          // return responseText.trim();
          // xu li loaij bo dau ** va cac ky tu markdown
          return this.cleanResponse(responseText);
        }
      }

      throw new Error("No valid response from Gemini API");
    } catch (error) {
      console.error("Error calling Gemini API:", error);

      // Fallback responses based on detected language
      const inputLanguage = detectLanguage(message);

      if (inputLanguage === 'vi') {
        const fallbackResponses = [
          "Tôi hiểu bạn đang gặp khó khăn. Mặc dù tôi không thể kết nối với dịch vụ AI ngay lúc này, nhưng tôi muốn bạn biết rằng cảm xúc của bạn hoàn toàn bình thường. Hãy thử thở sâu và nhớ rằng mọi khó khăn đều sẽ qua đi.",
          "Cảm ơn bạn đã chia sẻ với tôi. Tôi đang gặp chút vấn đề kỹ thuật, nhưng tôi muốn khuyến khích bạn tiếp tục tìm kiếm sự hỗ trợ. Bạn đã rất dũng cảm khi tìm đến sự giúp đỡ.",
          "Mặc dù có chút trục trặc kỹ thuật, tôi vẫn muốn bạn biết rằng những gì bạn đang cảm thấy là quan trọng. Hãy chăm sóc bản thân và nhớ rằng bạn không đơn độc trong hành trình này.",
          "Tôi thấy bạn đang cần sự hỗ trợ. Dù có vấn đề kỹ thuật, tôi vẫn muốn nhắc bạn rằng việc học tập và phát triển bản thân là một quá trình, hãy kiên nhẫn với chính mình.",
          "Cảm ơn bạn đã tin tưởng chia sẻ. Mặc dù hệ thống đang gặp sự cố nhỏ, nhưng tôi muốn bạn biết rằng mọi thử thách đều là cơ hội để bạn trưởng thành hơn."
        ];
        // return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        // xu li loaij bo dau ** va cac ky tu markdown
        return this.cleanResponse(fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]);
      } else {
        const fallbackResponses = [
          "I understand you're going through a difficult time. While I'm experiencing some technical issues right now, I want you to know that your feelings are completely valid. Please try taking some deep breaths and remember that every challenge will pass.",
          "Thank you for sharing with me. I'm having some technical difficulties at the moment, but I want to encourage you to continue seeking support. You've shown real courage by reaching out for help.",
          "Despite some technical issues, I want you to know that what you're feeling is important. Please take care of yourself and remember that you're not alone in this journey.",
          "I can see you need support right now. Even with these technical problems, I want to remind you that learning and personal growth is a process - please be patient with yourself.",
          "Thank you for trusting me with your thoughts. Although the system is having minor issues, I want you to know that every challenge is an opportunity for you to grow stronger."
        ];
        // return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        // xu li loaij bo dau ** va cac ky tu markdown
        return this.cleanResponse(fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]);
      }
    }
  }
}

export const geminiApiService = new GeminiApiService();