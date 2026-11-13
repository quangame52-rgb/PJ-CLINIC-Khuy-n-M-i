/* PJ Clinic — main.js (chỉ tăng trải nghiệm, nội dung đã có sẵn trong HTML)
   Form đặt hẹn: gửi thông tin khách vào Google Sheet qua Apps Script webhook
   (cùng sheet và cùng đoạn script web cũ dùng trước đây). Không còn lưu về
   Firebase/Admin như hệ thống cũ. Sau khi gửi, khách vẫn thấy hướng dẫn gọi
   hotline hoặc nhắn Zalo để giữ chắc suất. */
(function(){
  "use strict";

  /* Menu mobile */
  var menuBtn = document.getElementById("menuBtn");
  var mainNav = document.getElementById("mainNav");
  if (menuBtn && mainNav) {
    menuBtn.addEventListener("click", function(){
      mainNav.classList.toggle("open");
    });
  }

  /* FAQ accordion */
  document.querySelectorAll(".faq-q").forEach(function(btn){
    btn.addEventListener("click", function(){
      var item = btn.parentElement;
      var wasOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(function(el){ el.classList.remove("open"); });
      if (!wasOpen) item.classList.add("open");
    });
  });

  /* Chọn chương trình khuyến mãi trên trang chủ: cuộn tới form và chọn sẵn */
  document.querySelectorAll("[data-promo]").forEach(function(el){
    el.addEventListener("click", function(){
      var sel = document.getElementById("bkPromo");
      if (sel) sel.value = el.getAttribute("data-promo");
    });
  });

  /* Form đặt hẹn — chỉ xử lý phía trình duyệt (không có backend) */
  var bookForm = document.getElementById("bookingForm");
  if (bookForm) {
    bookForm.addEventListener("submit", function(e){
      e.preventDefault();
      var ok = true;
      var name = document.getElementById("bkName");
      var phone = document.getElementById("bkPhone");
      var promo = document.getElementById("bkPromo");
      var date = document.getElementById("bkDate");
      var phoneErr = document.getElementById("phoneErr");
      phoneErr.textContent = "";
      [name, phone, promo, date].forEach(function(f){ f.style.borderColor = ""; });
      if (!name.value.trim()) { name.style.borderColor = "#dc2626"; ok = false; }
      var p = phone.value.replace(/[\s.]/g, "");
      if (!/^0\d{9}$/.test(p)) {
        phone.style.borderColor = "#dc2626";
        phoneErr.textContent = "Số điện thoại chưa đúng. Vui lòng nhập 10 số, bắt đầu bằng số 0 (ví dụ 0339 603 960).";
        ok = false;
      }
      if (!promo.value) { promo.style.borderColor = "#dc2626"; ok = false; }
      if (!date.value) { date.style.borderColor = "#dc2626"; ok = false; }
      if (!ok) return;
      /* Gửi thông tin đặt hẹn vào Google Sheet (Apps Script web app cũ của PJ Clinic).
         Dùng mode no-cors giống web cũ: trình duyệt gửi đi nhưng không đọc được
         phản hồi — nếu gửi lỗi thì khách vẫn giữ chỗ được qua hotline/Zalo bên dưới. */
      try {
        var dParts = date.value.split("-");
        var dateText = dParts.length === 3 ? dParts[2] + "/" + dParts[1] + "/" + dParts[0] : date.value;
        var timeEl = document.getElementById("bkTime");
        var noteEl = document.getElementById("bkNote");
        fetch("https://script.google.com/macros/s/AKfycbyGgg8UNHazYD91G9kvMY5DN_KAKBDs8QC2TCjgyy9y1kdTrZ5U7P7_Qts9odwfutFfqg/exec", {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({
            date: dateText + " — " + (timeEl ? timeEl.options[timeEl.selectedIndex].text : ""),
            transferCode: "",
            name: name.value.trim(),
            service: promo.options[promo.selectedIndex].text,
            phone: phone.value.trim(),
            email: "",
            address: "",
            note: noteEl ? noteEl.value.trim() : "",
            paymentStatus: "",
            bookingStatus: ""
          })
        });
      } catch (sheetErr) { /* giữ chỗ qua hotline/Zalo vẫn hoạt động */ }
      var time = document.getElementById("bkTime");
      var note = document.getElementById("bkNote");
      var summary = document.getElementById("bookSummary");
      var promoText = promo.options[promo.selectedIndex].text;
      var timeText = time.options[time.selectedIndex].text;
      var msg = "Chào PJ Clinic, mình muốn đặt hẹn: " + promoText + " vào " + date.value + " (" + timeText + "). Tên: " + name.value.trim() + ", SĐT: " + phone.value.trim() + ".";
      var zaloUrl = "https://zalo.me/0339603960?text=" + encodeURIComponent(msg);
      summary.innerHTML =
        "<h4>Đã ghi nhận yêu cầu giữ chỗ của bạn!</h4>" +
        "<p><strong>Họ tên:</strong> " + esc(name.value) + "<br>" +
        "<strong>Số điện thoại:</strong> " + esc(phone.value) + "<br>" +
        "<strong>Chương trình:</strong> " + esc(promoText) + "<br>" +
        "<strong>Ngày giờ mong muốn:</strong> " + esc(date.value) + " — " + esc(timeText) + "</p>" +
        "<p>Để giữ chắc suất ưu đãi, bạn gọi hotline hoặc nhắn Zalo cho PJ Clinic ngay nhé — giữ chỗ chỉ mất 30 giây, không cần thanh toán trước.</p>" +
        '<p><a class="btn red" href="tel:0339603960">Gọi ngay 03 3960 3960</a> ' +
        '<a class="btn" style="background:#0068ff" href="' + zaloUrl + '" target="_blank" rel="noopener">Nhắn Zalo giữ chỗ</a></p>';
      summary.classList.remove("hidden");
      summary.scrollIntoView({behavior:"smooth", block:"nearest"});
    });
    function esc(s){
      return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }
  }

  /* Đặt ngày tối thiểu cho ô chọn ngày là hôm nay */
  var dateInput = document.getElementById("bkDate");
  if (dateInput) {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    dateInput.min = today.getFullYear() + "-" + mm + "-" + dd;
  }
})();
