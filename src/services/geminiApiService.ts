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

export class GeminiApiService {
  private apiKey: string;
  private apiUrl: string;

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

  async getCounselingResponse(message: string): Promise<string> {
    try {
      if (!this.apiKey) {
        throw new Error("Gemini API key not configured");
      }

      // Create a counseling-focused prompt
      const counselingPrompt = `Bạn là một chuyên gia tư vấn tâm lý chuyên nghiệp và thân thiện. Hãy trả lời tin nhắn sau của người dùng một cách ấm áp, hỗ trợ và có ích. Câu trả lời nên:
      - Thể hiện sự đồng cảm và hiểu biết
      - Cung cấp lời khuyên thực tế và hữu ích
      - Khuyến khích người dùng một cách tích cực
      - Giữ tông giọng chuyên nghiệp nhưng gần gũi
      - Trả lời bằng tiếng Việt

      Tin nhắn của người dùng: "${message}"`;

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

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(
          `Gemini API error: ${response.status} ${response.statusText}`
        );
      }

      const data: GeminiResponse = await response.json();

      if (data.candidates && data.candidates.length > 0) {
        const responseText = data.candidates[0].content.parts[0]?.text;
        if (responseText) {
          return responseText.trim();
        }
      }

      throw new Error("No valid response from Gemini API");
    } catch (error) {
      console.error("Error calling Gemini API:", error);

      // Fallback responses in case API fails
      const fallbackResponses = [
        "Tôi hiểu bạn đang gặp khó khăn. Mặc dù tôi không thể kết nối với dịch vụ AI ngay lúc này, nhưng tôi muốn bạn biết rằng cảm xúc của bạn hoàn toàn bình thường. Hãy thử thở sâu và nhớ rằng mọi khó khăn đều sẽ qua đi.",
        "Cảm ơn bạn đã chia sẻ với tôi. Tôi đang gặp chút vấn đề kỹ thuật, nhưng tôi muốn khuyến khích bạn tiếp tục tìm kiếm sự hỗ trợ. Bạn đã rất dũng cảm khi tìm đến sự giúp đỡ.",
        "Mặc dù có chút trục trặc kỹ thuật, tôi vẫn muốn bạn biết rằng những gì bạn đang cảm thấy là quan trọng. Hãy chăm sóc bản thân và nhớ rằng bạn không đơn độc trong hành trình này.",
      ];

      return fallbackResponses[
        Math.floor(Math.random() * fallbackResponses.length)
      ];
    }
  }
}

export const geminiApiService = new GeminiApiService();
