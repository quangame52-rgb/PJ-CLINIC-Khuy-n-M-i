// HƯỚNG DẪN CÀI ĐẶT LƯU THÔNG TIN VÀO GOOGLE SHEETS
// 1. Mở file Google Sheets của bạn: https://docs.google.com/spreadsheets/d/1cAVNLuitBAQ7dq4Wg53vaQnUE5RuJmDdkkatp46AD_w/edit
// 2. Trên thanh menu, chọn Tiện ích mở rộng (Extensions) -> Apps Script
// 3. Xóa hết code cũ và dán toàn bộ đoạn code bên dưới vào
// 4. Nhấn nút Lưu (Save) hoặc Ctrl+S
// 5. Nhấn nút Triển khai (Deploy) -> Triển khai mới (New deployment)
// 6. Chọn loại (Select type) -> Ứng dụng web (Web app)
// 7. Ở phần Quyền truy cập (Who has access), chọn "Bất kỳ ai" (Anyone)
// 8. Nhấn Triển khai (Deploy). Nếu Google yêu cầu cấp quyền, hãy chọn tài khoản của bạn -> Nâng cao -> Đi tới dự án (không an toàn) -> Cho phép.
// 9. Copy "URL của ứng dụng web" (Web app URL) và dán vào file .env trong project (VITE_GOOGLE_SHEET_WEBHOOK_URL=...)

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Cấu trúc cột theo bảng tính thực tế của khách hàng:
    // A: Ngày Đặt Lịch
    // B: Mã Chuyển Khoản
    // C: Họ và tên
    // D: Thông tin đơn Hàng
    // E: SĐT
    // F: Email
    // G: Địa Chỉ Khách Hàng
    // H: ghi chú
    // I: Chuyển Khoản (Trạng thái thanh toán)
    // J: Đặt Lịch (Trạng thái đặt lịch)
    // K: Đã gửi mail
    // L: Đã gửi Zalo
    
    sheet.appendRow([
      data.date || new Date().toLocaleString('vi-VN'),
      data.transferCode || '',
      data.name || '',
      data.service || '',
      data.phone || '',
      data.email || '',
      data.address || '',
      data.note || '',
      data.paymentStatus || '',
      data.bookingStatus || '',
      'Chưa', // K: Đã gửi mail
      'Chưa'  // L: Đã gửi Zalo
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'error', 'message': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var transferCode = e.parameter.transferCode;
    
    if (!transferCode) {
      return ContentService.createTextOutput(JSON.stringify({ 'status': 'error', 'message': 'Missing transferCode' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var rowTransferCode = data[i][1] ? data[i][1].toString().trim() : ''; // Cột B là index 1
      if (rowTransferCode === transferCode.toString().trim()) { 
        return ContentService.createTextOutput(JSON.stringify({ 
          'status': 'success', 
          'paymentStatus': data[i][8], // Cột I (Chuyển Khoản) là index 8
          'bookingStatus': data[i][9]  // Cột J (Đặt Lịch) là index 9
        }))
        .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'not_found' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'status': 'error', 'message': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Hàm này để xử lý lỗi CORS khi gọi từ trình duyệt
function doOptions(e) {
  var headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  };
  
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
}
