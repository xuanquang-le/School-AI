# Hướng dẫn thiết lập Gemini API cho Chatbot Tư vấn

## 🚀 Tính năng mới

Ứng dụng chatbot tư vấn của bạn đã được cập nhật để sử dụng **Google Gemini AI API** thay vì responses ngẫu nhiên. Điều này mang lại:

- ✅ Phản hồi thông minh và có ý nghĩa từ AI
- ✅ Tư vấn tâm lý chuyên nghiệp bằng tiếng Việt
- ✅ Hiểu ngữ cảnh và cảm xúc của người dùng
- ✅ Backup responses khi API gặp sự cố

## 🔧 Cách thiết lập

### Bước 1: Lấy API Key từ Google AI Studio

1. Truy cập [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Đăng nhập bằng tài khoản Google của bạn
3. Nhấn "Create API Key"
4. Chọn project hoặc tạo project mới
5. Copy API key được tạo

### Bước 2: Cấu hình Environment Variable (Vite)

1. Rename file `env` thành `.env` trong thư mục root của project
2. Thay thế `your_gemini_api_key_here` bằng API key thực của bạn:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Restart development server

**Lưu ý quan trọng**: Project này sử dụng Vite, nên environment variables phải có prefix `VITE_` (không phải `REACT_APP_`)

## 🔐 Bảo mật

- API key được lưu trong file `.env` local của bạn
- File `.env` không được commit lên git (đã được thêm vào .gitignore)
- Mỗi request được gửi trực tiếp từ browser đến Google Gemini API

## 🚨 Xử lý sự cố

### Lỗi "API key not configured"

- Đảm bảo bạn đã rename file `env` thành `.env`
- Kiểm tra sử dụng đúng prefix: `VITE_GEMINI_API_KEY` (không phải `REACT_APP_GEMINI_API_KEY`)
- Kiểm tra API key trong file `.env` đã được nhập đúng
- Restart development server sau khi thay đổi file `.env`

### Lỗi "429 Too Many Requests"

- Bạn đã vượt quá giới hạn request miễn phí
- Chờ một lúc hoặc nâng cấp plan Google AI

### Lỗi "403 Forbidden"

- API key không hợp lệ hoặc đã hết hạn
- Tạo API key mới từ Google AI Studio

### Fallback khi API lỗi

- Ứng dụng sẽ tự động hiển thị responses dự phòng bằng tiếng Việt
- Kiểm tra console để xem chi tiết lỗi

## 💡 Tối ưu hóa

Để có trải nghiệm tốt nhất:

1. **Viết câu hỏi rõ ràng**: AI hiểu tốt hơn khi bạn mô tả cụ thể tình huống
2. **Sử dụng tiếng Việt**: AI được config để trả lời bằng tiếng Việt
3. **Kiên nhẫn**: API có thể mất 2-3 giây để xử lý yêu cầu phức tạp

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy kiểm tra:

- Console của browser để xem error logs
- Network tab để xem API calls
- Đảm bảo internet connection ổn định

---

**Lưu ý**: Google Gemini API có giới hạn miễn phí. Kiểm tra usage tại [Google AI Studio](https://makersuite.google.com/) để theo dõi việc sử dụng.
