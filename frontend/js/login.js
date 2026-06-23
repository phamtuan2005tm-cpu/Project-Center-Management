document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("login-form"); 
    
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault(); 

            // Lấy đúng ID từ file HTML của bạn sang
            const emailInput = document.getElementById("enter-email").value;
            const passwordInput = document.getElementById("enter-password").value;

            console.log("Sending request to Java Server with account:", emailInput);

            // Bắn tín hiệu qua Java Backend cổng 8080
            fetch(`http://localhost:8080/api/login?email=${emailInput}&password=${passwordInput}`)
                .then(response => response.text()) 
                .then(data => {
                    console.log("Gói bưu phẩm nhận được từ Java Backend:", data);

                    if (data.startsWith("SUCCESS")) {
                        const parts = data.split(':'); 
                        const role = parts[1]; // Lấy nhãn vai trò
                        const name = decodeURIComponent(parts[2]); // Giải mã tên tiếng Việt

                        // Cất quyền và tên vào bộ nhớ tạm localStorage của trình duyệt
                        localStorage.setItem("userRole", role);
                        localStorage.setItem("userName", name);

                        alert(`Đăng nhập thành công! Chào mừng ${name} với vai trò [${role}]`);

                        // Đá vèo một cái sang sảnh chính dashboard.html
                        window.location.href = 'dashboard.html';
                    } 
                    else {
                        alert("Mật khẩu hoặc tài khoản Nancy Center không đúng. Vui lòng thử lại!");
                    }
                })
                .catch(error => {
                    console.error("Lỗi kết nối:", error);
                    alert("Không thể kết nối đến Backend chính! Bạn đã bấm nút [Run] cho file App.java chưa?");
                });
        });
    }
});

// Hàm này sẽ tự động kích hoạt ngay khi fen chọn tài khoản Gmail thành công
function handleCredentialResponse(response) {
    console.log("Đã nhận được gói dữ liệu mã hóa từ Google!");

    // 1. Giải mã gói bưu phẩm JWT để lấy thông tin Gmail thật
    const idToken = response.credential;
    const payload = parseJwt(idToken);
    
    console.log("Chào mừng:", payload.name);
    console.log("Email:", payload.email);
    console.log("Avatar URL:", payload.picture);

    // 2. Cất chặt thông tin vào bộ nhớ tạm để trang Dashboard sử dụng
    localStorage.setItem("userRole", "ADMIN"); // Hoặc STUDENT tùy fen phân quyền nhé
    localStorage.setItem("userName", payload.name);
    localStorage.setItem("userEmail", payload.email);
    localStorage.setItem("userAvatar", payload.picture); // Lưu link ảnh Gmail thật để buổi tới vẽ lên Sidebar

    // 3. LỆNH THẦN CHÚ: Ép trình duyệt nhảy sang sảnh chính Dashboard liền
    // Thêm alert để dễ kiểm tra luồng chạy
    alert(`Đăng nhập thành công! Chào mừng thầy Thái Tuấn đến với Nancy Center. 🎉`);
    window.location.href = "dashboard.html"; 
}

// Hàm bổ trợ giải mã gói bưu phẩm Token của Google (Giữ nguyên không thay đổi)
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}