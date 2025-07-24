/**
 * Gọi API Text-to-Speech của FPT AI để chuyển đổi văn bản thành âm thanh
 * @param text - Văn bản cần chuyển đổi
 * @param apiKey - Khóa API của FPT AI
 * @param voice - Giọng đọc (mặc định: thuminh)
 * @param speed - Tốc độ đọc (mặc định: rỗng)
 * @param retries - Số lần thử lại nếu URL không hợp lệ
 * @param retryDelay - Thời gian chờ giữa các lần thử (ms)
 * @returns Promise trả về đối tượng chứa audioUrl hoặc error
 */
export async function textToSpeech(
  text: string,
  apiKey: string,
  voice: string = 'thuminh',
  speed: string = '',
  retries: number = 3,
  retryDelay: number = 2000
): Promise<{ audioUrl?: string; error?: string }> {
  // Kiểm tra tham số đầu vào
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return { error: 'Văn bản không được để trống hoặc không hợp lệ' };
  }
  if (!apiKey || typeof apiKey !== 'string') {
    return { error: 'Khóa API không hợp lệ' };
  }

  try {
    const response: Response = await fetch('https://api.fpt.ai/hmi/tts/v5', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'speed': speed,
        'voice': voice,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(text.trim()),
    });

    if (!response.ok) {
      throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
    }

    const data: { async?: string } = await response.json();
    if (!data.async) {
      return { error: 'Không nhận được URL âm thanh từ API' };
    }

    // Kiểm tra tính hợp lệ của URL âm thanh
    const checkAudioUrl = async (url: string, attempts: number): Promise<{ audioUrl?: string; error?: string }> => {
      for (let i = 0; i < attempts; i++) {
        try {
          const urlResponse: Response = await fetch(url, { method: 'HEAD' });
          if (urlResponse.ok) {
            return { audioUrl: url };
          }
          if (urlResponse.status === 404) {
            if (i < attempts - 1) {
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
              continue;
            }
            return { error: 'File âm thanh không tồn tại (404 Not Found) sau nhiều lần thử' };
          }
          throw new Error(`Lỗi khi kiểm tra URL: Trạng thái ${urlResponse.status}`);
        } catch (err: unknown) {
          if (i < attempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }
          return { error: `Lỗi khi kiểm tra URL: ${(err as Error).message}` };
        }
      }
      return { error: 'Không thể xác minh URL âm thanh' };
    };

    return await checkAudioUrl(data.async, retries);
  } catch (err: unknown) {
    return { error: `Lỗi: ${(err as Error).message}` };
  }
}